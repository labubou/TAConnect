from ..models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
from ta_connect.settings import SITE_DOMAIN, frontend_url
from drf_yasg.utils import swagger_auto_schema
from accounts.schemas.auth_schemas import (
    register_request,
    register_response,
    verify_email_request,
    verify_email_response,
)
from ..serializers.register_serializer import RegisterSerializer

#the register route
@swagger_auto_schema(
    method='post',
    operation_description='Register a new user and send email verification.',
    request_body=register_request,
    responses={201: register_response, 400: 'Validation error'}
)
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    try:
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create a new user
        try:
            user = serializer.save()
        except Exception:
            return Response(
                {'error': f'Failed to create user'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Send verification email
        try:
            mail_subject = 'Activate your TAConnect account'
            current_site = SITE_DOMAIN.rstrip('/')  # Remove trailing slash if present
            message = render_to_string('activate_mail_send.html', {
                'user': user,
                'domain': current_site,
                'frontend_url': frontend_url,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': default_token_generator.make_token(user),
            })
            send_mail(mail_subject, message, 'taconnect.team@gmail.com', [user.email], html_message=message)
        except Exception as email_error:
            # If email fails, still create the user but log the error
            print(f"Failed to send verification email: {str(email_error)}")

        return Response(
            {'message': 'User created successfully. Please check your email to verify your account.'}, 
            status=status.HTTP_201_CREATED
        )
            
    except Exception:
        return Response(
            {'error': f'An error occurred during registration'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

#the verify email API route
@swagger_auto_schema(
    method='post',
    operation_description='Verify user email with uid and token.',
    request_body=verify_email_request,
    responses={200: verify_email_response, 400: 'Invalid link'}
)
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    try:
        uid = request.data.get('uid')
        token = request.data.get('token')
        
        if not uid or not token:
            return Response(
                {'error': 'Missing verification parameters'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Decode the user ID
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'error': 'Invalid verification link'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the token is valid
        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.email_verify = True
            user.save()

            # Send welcome email after verification
            try:
                mail_subject = 'Welcome to TAConnect!'
                message = render_to_string('welcome_email.html', {
                    'user': user,
                    'domain': SITE_DOMAIN.rstrip('/'),
                    'frontend_url': frontend_url,
                    'uid': user.pk,  # Not needed here, but template expects it
                    'token': '',     # Not needed here, but template expects it
                })
                send_mail(mail_subject, '', 'taconnect.team@gmail.com', [user.email], html_message=message)
            except Exception as email_error:
                print(f"Failed to send welcome email: {str(email_error)}")
            
            return Response(
                {'message': 'Email verified successfully'}, 
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid or expired verification link'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception:
        return Response(
            {'error': f'An error occurred during verification'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )