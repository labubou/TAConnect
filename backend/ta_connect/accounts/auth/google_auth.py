#all of the google auth related function
#all of this file is copied from the internet and it's working as expected
#it's updated on 16 Nov 2025 by Karim Bassem

from django.shortcuts import redirect
from ..models import User
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
import requests
from ta_connect.settings import SITE_DOMAIN, GOOGLE_OAUTH2_CLIENT_ID, GOOGLE_OAUTH2_CLIENT_SECRET, frontend_url
from decouple import config
from drf_yasg.utils import swagger_auto_schema
from accounts.schemas.auth_schemas import (
    google_login_url_response,
    google_auth_request,
    google_auth_response,
    set_user_type_request,
    set_user_type_response,
)
from .utils.send_welcome_email import send_welcome_email

class GoogleAuthRateThrottle(AnonRateThrottle):
    rate = '10/hour'  # Limit Google OAuth attempts

class SetUserTypeRateThrottle(UserRateThrottle):
    rate = '5/hour'  # Limit user type setting attempts

class GoogleLoginUrlView(GenericAPIView):
    """Provides the Google OAuth2 login URL"""
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description='Get Google OAuth2 login URL for frontend.',
        responses={
            200: google_login_url_response,
            500: 'Internal server error'
        }
    )
    def get(self, request):
        """Returns the Google OAuth2 login URL for frontend"""
        try:
            redirect_uri = config('GOOGLE_REDIRECT_URI', default=f'{SITE_DOMAIN}/api/auth/google/callback/')
            oauth2_url = (
                'https://accounts.google.com/o/oauth2/v2/auth?'
                f'client_id={GOOGLE_OAUTH2_CLIENT_ID}&'
                f'redirect_uri={redirect_uri}&'
                'response_type=code&'
                'scope=openid email profile&'
                'access_type=offline'
            )
            return Response({'auth_url': oauth2_url}, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {'error': 'Failed to generate Google login URL. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GoogleAuthView(GenericAPIView):
    """Authenticate with Google OAuth2 authorization code"""
    permission_classes = [AllowAny]
    throttle_classes = [GoogleAuthRateThrottle]

    @swagger_auto_schema(
        operation_description='Authenticate with Google OAuth2 authorization code.',
        request_body=google_auth_request,
        responses={
            200: google_auth_response,
            400: 'Invalid code',
            429: 'Too many requests',
            500: 'Internal server error'
        }
    )
    def post(self, request):
        """Handle Google OAuth2 authentication with authorization code"""
        try:
            code = request.data.get('code')
            
            if not code:
                return Response(
                    {'error': 'Authorization code is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            redirect_uri = config('GOOGLE_REDIRECT_URI', default=f'{SITE_DOMAIN}/api/auth/google/callback/')
            
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
            except requests.RequestException:
                return Response(
                    {'error': 'Failed to connect to Google. Please try again.'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            if token_response.status_code != 200:
                return Response(
                    {'error': 'Invalid authorization code. Please try again.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            token_data = token_response.json()

            # Get user info using access token
            userinfo_url = 'https://www.googleapis.com/oauth2/v3/userinfo'
            headers = {'Authorization': f'Bearer {token_data["access_token"]}'}
            
            try:
                userinfo_response = requests.get(userinfo_url, headers=headers, timeout=10)
            except requests.RequestException:
                return Response(
                    {'error': 'Failed to retrieve user information from Google. Please try again.'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            if userinfo_response.status_code != 200:
                return Response(
                    {'error': 'Failed to authenticate with Google. Please try again.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            user_info = userinfo_response.json()

            email = user_info.get('email')
            if not email:
                return Response(
                    {'error': 'Failed to retrieve email from Google account.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            first_name = user_info.get('given_name', '')
            last_name = user_info.get('family_name', '')
            
            # Check if user exists
            user = User.objects.filter(email=email).first()
            
            if user:
                # User exists
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'user_type': user.user_type if user.user_type else None,
                    },
                    'needs_user_type': not bool(user.user_type)
                }, status=status.HTTP_200_OK)
            else:
                # Create new user
                username = email.split('@')[0]
                
                # Ensure username is unique
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                try:
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        email_verify=True,
                        is_active=True,
                        user_type=''  # Empty, to be set by user
                    )
                except Exception:
                    return Response(
                        {'error': 'Failed to create user account. Please try again.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

                # Generate tokens
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'user_type': None,
                    },
                    'is_new_user': True,
                    'needs_user_type': True
                }, status=status.HTTP_200_OK)

        except Exception:
            return Response(
                {'error': 'An error occurred during Google authentication. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GoogleCallbackView(APIView):
    """Handles the callback from Google OAuth2 - redirects to frontend with code"""
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description='Handle Google OAuth2 callback and redirect to frontend.',
        responses={302: 'Redirect to frontend with code or error'}
    )
    def get(self, request):
        """Handles the callback from Google OAuth2 - redirects to frontend with code"""
        code = request.GET.get('code')
        error = request.GET.get('error')
        
        if error:
            return redirect(f"{frontend_url}/login?error=google_auth_cancelled")
        
        if code:
            return redirect(f"{frontend_url}/auth/google/callback?code={code}")
        
        return redirect(f"{frontend_url}/login?error=google_auth_failed")

class SetUserTypeView(GenericAPIView):
    """Set user type for newly created Google OAuth users"""
    permission_classes = [IsAuthenticated]
    throttle_classes = [SetUserTypeRateThrottle]
    
    @swagger_auto_schema(
        operation_description='Set user type for Google OAuth users who need to complete their profile.',
        request_body=set_user_type_request,
        responses={
            200: set_user_type_response,
            400: 'Invalid user type or missing field',
            401: 'Authentication required',
            429: 'Too many requests',
            500: 'Internal server error'
        }
    )
    def post(self, request):
        """Set user type for newly created Google OAuth users"""
        try:
            user_type = request.data.get('user_type')
            
            if not user_type:
                return Response(
                    {'error': 'user_type is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate user_type
            if user_type not in dict(User.USER_TYPE_CHOICES).keys():
                return Response(
                    {'error': 'Invalid user_type. Must be either "student" or "instructor"'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = request.user
            
            # Check if user_type is already set
            if user.user_type and user.user_type != '':
                return Response(
                    {'error': 'User type has already been set and cannot be changed.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update user_type
            user.user_type = user_type
            user.save()
            
            # Send welcome email now that user_type is set
            try:
                send_welcome_email(user)
            except Exception:
                # Welcome email failed - not critical
                pass

            return Response({
                'message': 'User type set successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'user_type': user.user_type,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception:
            return Response(
                {'error': 'An error occurred while setting user type. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Backward compatibility aliases
GoogleLoginUrl = GoogleLoginUrlView
GoogleAuth = GoogleAuthView
GoogleCallback = GoogleCallbackView
google_authenticate = GoogleAuthView.as_view()
