"""
Google Calendar Management Views

This module provides endpoints for:
- Connecting a Google account for Calendar integration
- Enabling/disabling Google Calendar integration
- Getting Google Calendar connection status

This code is vibe coded most of it by cursor but updated by Karim Bassem.
"""

from django.shortcuts import redirect
from django.utils import timezone
from datetime import timedelta
from ..models import User, GoogleCalendarCredentials
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
import requests
from ta_connect.settings import SITE_DOMAIN, GOOGLE_OAUTH2_CLIENT_ID, GOOGLE_OAUTH2_CLIENT_SECRET, frontend_url
from decouple import config
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from accounts.auth.google_auth import save_google_calendar_credentials, GOOGLE_OAUTH_SCOPES

class GoogleCalendarRateThrottle(UserRateThrottle):
    rate = '50/hour'  # Limit Google Calendar connection attempts

class GoogleCalendarConnectUrlView(APIView):
    """
    Provides the Google OAuth2 URL for connecting Google Calendar.
    This endpoint is for users who want to connect a Google account
    for Calendar integration (works for both Google and non-Google logged-in users).
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [GoogleCalendarRateThrottle]

    @swagger_auto_schema(
        operation_description='Get Google OAuth2 URL for connecting Google Calendar.',
        responses={
            200: openapi.Response(
                description='Google OAuth2 authorization URL',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'auth_url': openapi.Schema(type=openapi.TYPE_STRING, description='Google OAuth2 authorization URL')
                    }
                )
            ),
            401: 'Authentication required',
            429: 'Too many requests',
            500: 'Internal server error'
        }
    )
    def get(self, request):
        """Returns the Google OAuth2 URL for connecting Google Calendar"""
        try:
            # Use a different redirect URI for calendar connection (profile flow)
            redirect_uri = config('GOOGLE_CALENDAR_CONNECT_REDIRECT_URI', 
                                default=f'{SITE_DOMAIN}/api/auth/google/calendar/callback/')
            
            # Check if request is from settings page
            from_param = request.GET.get('from', '')  # 'settings' or 'profile'
            
            # Include user type in state to determine redirect destination in callback
            user_type = request.user.user_type if request.user.is_authenticated else 'student'
            state = f"{from_param}:{user_type}" if from_param else user_type
            
            oauth2_url = (
                'https://accounts.google.com/o/oauth2/v2/auth?'
                f'client_id={GOOGLE_OAUTH2_CLIENT_ID}&'
                f'redirect_uri={redirect_uri}&'
                'response_type=code&'
                f'scope={GOOGLE_OAUTH_SCOPES}&'
                'access_type=offline&'
                'prompt=consent'
            )
            
            # Add state parameter to identify where the request came from and user type
            if state:
                oauth2_url += f'&state={state}'
            return Response({'auth_url': oauth2_url}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error generating Google Calendar connect URL: {e}")
            return Response(
                {'error': 'Failed to generate Google Calendar connection URL. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GoogleCalendarConnectView(APIView):
    """
    Connect a Google account for Calendar integration.
    This endpoint handles the OAuth callback and saves the credentials.
    Works for both users who logged in with Google and those who didn't.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [GoogleCalendarRateThrottle]

    @swagger_auto_schema(
        operation_description='Connect Google account for Calendar integration using authorization code.',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'code': openapi.Schema(type=openapi.TYPE_STRING, description='Google OAuth2 authorization code')
            },
            required=['code']
        ),
        responses={
            200: openapi.Response(
                description='Successful connection',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                        'calendar_enabled': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'google_email': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            400: 'Invalid code',
            401: 'Authentication required',
            429: 'Too many requests',
            500: 'Internal server error'
        }
    )
    def post(self, request):
        """Handle Google OAuth2 authorization code for Calendar connection"""
        try:
            code = request.data.get('code')
            
            if not code:
                return Response(
                    {'error': 'Authorization code is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            redirect_uri = config('GOOGLE_CALENDAR_CONNECT_REDIRECT_URI', 
                                default=f'{SITE_DOMAIN}/api/auth/google/calendar/callback/')
            
            # Exchange code for access token
            token_url = 'https://oauth2.googleapis.com/token'
            token_payload = {
                'client_id': GOOGLE_OAUTH2_CLIENT_ID,
                'client_secret': GOOGLE_OAUTH2_CLIENT_SECRET,
                'code': code,
                'redirect_uri': redirect_uri,
                'grant_type': 'authorization_code'
            }

            try:
                token_response = requests.post(token_url, data=token_payload, timeout=10)
            except requests.RequestException as e:
                print(f"Error connecting to Google: {e}")
                return Response(
                    {'error': 'Failed to connect to Google. Please try again.'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            if token_response.status_code != 200:
                error_data = token_response.json() if token_response.content else {}
                print(f"Google token exchange failed: {error_data}")
                return Response(
                    {'error': 'Invalid authorization code. Please try again.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            token_data = token_response.json()
            user = request.user

            # Fetch Google account email using access token
            google_email = None
            try:
                userinfo_url = 'https://www.googleapis.com/oauth2/v3/userinfo'
                headers = {'Authorization': f'Bearer {token_data.get("access_token")}'}
                userinfo_response = requests.get(userinfo_url, headers=headers, timeout=10)
                if userinfo_response.status_code == 200:
                    user_info = userinfo_response.json()
                    google_email = user_info.get('email')
            except Exception as e:
                print(f"Failed to fetch Google email: {e}")
                # Continue without email - it's not critical for connection

            # Save or update Google Calendar credentials
            success = save_google_calendar_credentials(user, token_data, google_email=google_email)
            
            if not success:
                return Response(
                    {'error': 'Failed to save Google Calendar credentials. Please try again.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Get the credentials object to check calendar_enabled status
            creds = GoogleCalendarCredentials.objects.get(user=user)
            
            return Response({
                'message': 'Google Calendar connected successfully.',
                'calendar_enabled': creds.calendar_enabled,
                'google_email': creds.google_email
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error connecting Google Calendar: {e}")
            return Response(
                {'error': 'An error occurred while connecting Google Calendar. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GoogleCalendarCallbackView(APIView):
    """
    Handles the callback from Google OAuth2 for Calendar connection.
    Redirects to frontend with code or error.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description='Handle Google OAuth2 callback for Calendar connection and redirect to frontend.',
        responses={302: 'Redirect to frontend with code or error'}
    )
    def get(self, request):
        """Handles the callback from Google OAuth2 - redirects to frontend with code"""
        code = request.GET.get('code')
        error = request.GET.get('error')
        state = request.GET.get('state', '')  # Get state parameter if provided
        
        # Determine redirect URL based on state parameter (which includes user type)
        # State format: "from:user_type" or just "user_type"
        user_type = 'student'  # default
        if state:
            # Parse state to extract user type
            if ':' in state:
                # Format: "from:user_type"
                parts = state.split(':', 1)
                user_type = parts[1] if len(parts) > 1 else 'student'
            else:
                # Format: just "user_type" (for backward compatibility)
                user_type = state
        
        # Fallback to checking authenticated user if state doesn't contain user type
        if user_type not in ['instructor', 'student'] and request.user.is_authenticated:
            user_type = request.user.user_type
        
        # Determine base URL based on user type
        if user_type == 'instructor':
            base_url = f"{frontend_url}/ta/settings"
        else:
            base_url = f"{frontend_url}/student/settings"
        
        if error:
            return redirect(f"{base_url}?error=google_calendar_auth_cancelled&google_calendar=true")
        
        if code:
            return redirect(f"{base_url}?code={code}&google_calendar=true")
        
        return redirect(f"{base_url}?error=google_calendar_auth_failed&google_calendar=true")


class GoogleCalendarStatusView(APIView):
    """
    Get Google Calendar connection status for the current user.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description='Get Google Calendar connection status.',
        responses={
            200: openapi.Response(
                description='Status information',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'connected': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'calendar_enabled': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'has_valid_credentials': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'google_email': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            401: 'Authentication required',
            500: 'Internal server error'
        }
    )
    def get(self, request):
        """Get Google Calendar connection status"""
        try:
            user = request.user
            
            if not hasattr(user, 'google_calendar_credentials'):
                return Response({
                    'connected': False,
                    'calendar_enabled': False,
                    'has_valid_credentials': False,
                    'google_email': None
                }, status=status.HTTP_200_OK)
            
            creds = user.google_calendar_credentials
            
            return Response({
                'connected': bool(creds.refresh_token),
                'calendar_enabled': creds.calendar_enabled,
                'has_valid_credentials': creds.has_valid_credentials(),
                'google_email': creds.google_email
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error getting Google Calendar status: {e}")
            return Response(
                {'error': 'An error occurred while retrieving Google Calendar status.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GoogleCalendarToggleView(APIView):
    """
    Enable or disable Google Calendar integration.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [GoogleCalendarRateThrottle]

    @swagger_auto_schema(
        operation_description='Enable or disable Google Calendar integration.',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'enabled': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='True to enable, False to disable')
            },
            required=['enabled']
        ),
        responses={
            200: openapi.Response(
                description='Toggle result',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                        'calendar_enabled': openapi.Schema(type=openapi.TYPE_BOOLEAN)
                    }
                )
            ),
            400: 'Invalid request or no Google account connected',
            401: 'Authentication required',
            429: 'Too many requests',
            500: 'Internal server error'
        }
    )
    def post(self, request):
        """Enable or disable Google Calendar integration"""
        try:
            enabled = request.data.get('enabled')
            
            if enabled is None:
                return Response(
                    {'error': 'enabled field is required (true or false)'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = request.user
            
            # Check if user has Google Calendar credentials
            if not hasattr(user, 'google_calendar_credentials'):
                return Response(
                    {'error': 'Please connect a Google account first to enable Calendar integration.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            creds = user.google_calendar_credentials
            
            # Check if user has valid credentials before enabling
            if enabled and not creds.refresh_token:
                return Response(
                    {'error': 'Please connect a Google account first to enable Calendar integration.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update calendar_enabled status
            creds.calendar_enabled = bool(enabled)
            creds.save()
            
            return Response({
                'message': f'Google Calendar integration {"enabled" if enabled else "disabled"} successfully.',
                'calendar_enabled': creds.calendar_enabled
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error toggling Google Calendar: {e}")
            return Response(
                {'error': 'An error occurred while updating Google Calendar settings. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GoogleCalendarDisconnectView(APIView):
    """
    Disconnect Google Calendar by removing credentials.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [GoogleCalendarRateThrottle]

    @swagger_auto_schema(
        operation_description='Disconnect Google Calendar by removing credentials.',
        responses={
            200: openapi.Response(
                description='Successful disconnection',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            400: 'No Google account connected',
            401: 'Authentication required',
            429: 'Too many requests',
            500: 'Internal server error'
        }
    )
    def post(self, request):
        """Disconnect Google Calendar by removing credentials"""
        try:
            user = request.user
            
            # Check if user has Google Calendar credentials
            if not hasattr(user, 'google_calendar_credentials'):
                return Response(
                    {'error': 'No Google account connected.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            creds = user.google_calendar_credentials
            
            # Delete the credentials
            creds.delete()
            
            return Response({
                'message': 'Google Calendar disconnected successfully.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error disconnecting Google Calendar: {e}")
            return Response(
                {'error': 'An error occurred while disconnecting Google Calendar. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
