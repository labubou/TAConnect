#all of the auth related function
from django.shortcuts import redirect
from ..models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from django.conf import settings
from ta_connect.settings import SITE_DOMAIN, GOOGLE_OAUTH2_CLIENT_ID, GOOGLE_OAUTH2_CLIENT_SECRET, frontend_url
from decouple import config
from django.template.loader import render_to_string
from django.core.mail import send_mail
from drf_yasg.utils import swagger_auto_schema
from accounts.schemas.auth_schemas import (
    google_login_url_response,
    google_auth_request,
    google_auth_response,
    set_user_type_request,
    set_user_type_response,
)

@swagger_auto_schema(
    method='get',
    operation_description='Get Google OAuth2 login URL for frontend.',
    responses={200: google_login_url_response}
)
@api_view(['GET'])
@permission_classes([AllowAny])
def google_login_url(request):
    """Returns the Google OAuth2 login URL for frontend"""
    redirect_uri = config('GOOGLE_REDIRECT_URI', default=f'{SITE_DOMAIN}/api/auth/google/callback/')
    oauth2_url = (
        'https://accounts.google.com/o/oauth2/v2/auth?'
        f'client_id={GOOGLE_OAUTH2_CLIENT_ID}&'
        f'redirect_uri={redirect_uri}&'
        'response_type=code&'
        'scope=openid email profile&'
        'access_type=offline'
    )
    return Response({'auth_url': oauth2_url})

@swagger_auto_schema(
    method='post',
    operation_description='Authenticate with Google OAuth2 authorization code.',
    request_body=google_auth_request,
    responses={200: google_auth_response, 400: 'Invalid code'}
)
@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
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

        token_response = requests.post(token_url, data=token_payload)
        
        if token_response.status_code != 200:
            return Response(
                {'error': 'Failed to exchange code for token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        token_data = token_response.json()

        # Get user info using access token
        userinfo_url = 'https://www.googleapis.com/oauth2/v3/userinfo'
        headers = {'Authorization': f'Bearer {token_data["access_token"]}'}
        userinfo_response = requests.get(userinfo_url, headers=headers)
        
        if userinfo_response.status_code != 200:
            return Response(
                {'error': 'Failed to get user info from Google'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user_info = userinfo_response.json()

        email = user_info['email']
        first_name = user_info.get('given_name', '')
        last_name = user_info.get('family_name', '')
        
        # Check if user exists
        user = User.objects.filter(email=email).first()
        
        if user:
            # User exists, check if user_type is set
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
            })
        else:
            # User doesn't exist, create new user without user_type
            username = email.split('@')[0]
            
            # Ensure username is unique
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            # Create new user without user_type (will be set later)
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                email_verify=True,
                is_active=True,
                user_type=''  # Empty, to be set by user
            )

            # Generate tokens and return
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
            })

    except Exception:
        return Response(
            {'error': f'An error occurred during Google authentication'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@swagger_auto_schema(
    method='get',
    operation_description='Handle Google OAuth2 callback and redirect to frontend.',
    responses={302: 'Redirect to frontend with code or error'}
)
@api_view(['GET'])
@permission_classes([AllowAny])
def google_callback(request):
    """Handles the callback from Google OAuth2 - redirects to frontend with code"""
    code = request.GET.get('code')
    error = request.GET.get('error')
    
    if error:
        return redirect(f"{frontend_url}/login?error=google_auth_cancelled")
    
    if code:
        return redirect(f"{frontend_url}/auth/google/callback?code={code}")
    
    return redirect(f"{frontend_url}/login?error=google_auth_failed")

# Add alias for the endpoint
google_authenticate = google_auth

@swagger_auto_schema(
    method='post',
    operation_description='Set user type for Google OAuth users who need to complete their profile.',
    request_body=set_user_type_request,
    responses={
        200: set_user_type_response,
        400: 'Invalid user type or missing field',
        401: 'Authentication required or invalid token'
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def set_user_type(request):
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
        
        # Get user from token
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response(
                {'error': 'Authentication required'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token = auth_header.split(' ')[1]
        
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
        except Exception:
            return Response(
                {'error': 'Invalid or expired token'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Update user_type
        user.user_type = user_type
        user.save()
        
        # Send welcome email now that user_type is set
        try:
            mail_subject = 'Welcome to TAConnect!'
            message = render_to_string('welcome_email.html', {
                'user': user,
                'domain': SITE_DOMAIN.rstrip('/'),
                'frontend_url': frontend_url,
            })
            send_mail(mail_subject, '', 'taconnect.team@gmail.com', [user.email], html_message=message)
        except Exception as email_error:
            print(f"Failed to send welcome email: {str(email_error)}")
        
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
            {'error': 'An error occurred while setting user type'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
