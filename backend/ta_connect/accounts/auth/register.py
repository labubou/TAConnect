from ..models import User
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from drf_yasg.utils import swagger_auto_schema
from accounts.schemas.auth_schemas import (
    register_request,
    register_response,
    verify_email_request,
    verify_email_response,
)
from ..serializers.register_serializer import RegisterSerializer
from .utils.send_verification_email import send_verification_email
from .utils.send_welcome_email import send_welcome_email

class RegisterRateThrottle(AnonRateThrottle):
    rate = '3/hour'  # Limit registration to prevent abuse

class VerifyEmailRateThrottle(AnonRateThrottle):
    rate = '5/hour'  # Limit email verification attempts

class RegisterView(GenericAPIView):
    """Register a new user and send email verification"""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_classes = [RegisterRateThrottle]

    @swagger_auto_schema(
        operation_description='Register a new user and send email verification.',
        request_body=register_request,
        responses={
            201: register_response,
            400: 'Validation error',
            429: 'Too many requests',
            500: 'Internal server error'
        }
    )
    def post(self, request):
        try:
            serializer = self.get_serializer(data=request.data)

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
                    {'error': 'Failed to create user. Please try again.'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Send verification email
            try:
                send_verification_email(user)
            except Exception:
                # User created but email failed - log this but don't fail the registration
                return Response(
                    {
                        'message': 'User created successfully, but verification email failed to send. Please contact support.',
                        'user_id': user.id
                    }, 
                    status=status.HTTP_201_CREATED
                )

            return Response(
                {'message': 'User created successfully. Please check your email to verify your account.'}, 
                status=status.HTTP_201_CREATED
            )
                
        except Exception:
            return Response(
                {'error': 'An error occurred during registration. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VerifyEmailView(GenericAPIView):
    """Verify user email with uid and token"""
    permission_classes = [AllowAny]
    throttle_classes = [VerifyEmailRateThrottle]

    @swagger_auto_schema(
        operation_description='Verify user email with uid and token.',
        request_body=verify_email_request,
        responses={
            200: verify_email_response,
            400: 'Invalid link',
            429: 'Too many requests',
            500: 'Internal server error'
        }
    )
    def post(self, request):
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

            # Check if already verified
            if user.email_verify:
                return Response(
                    {'message': 'Email already verified. You can now login.'}, 
                    status=status.HTTP_200_OK
                )

            # Check if the token is valid
            if not default_token_generator.check_token(user, token):
                return Response(
                    {'error': 'Invalid or expired verification link. Please request a new verification email.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.is_active = True
            user.email_verify = True
            user.save()

            # Send welcome email after verification
            try:
                send_welcome_email(user)
            except Exception:
                # Email verified but welcome email failed - not critical
                pass

            return Response(
                {'message': 'Email verified successfully. You can now login.'}, 
                status=status.HTTP_200_OK
            )
                
        except Exception:
            return Response(
                {'error': 'An error occurred during verification. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Backward compatibility alias
VerifyEmail = VerifyEmailView