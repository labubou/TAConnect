from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from drf_yasg.utils import swagger_auto_schema
from accounts.schemas.profile_schemas import (
    get_profile_response,
    update_profile_request,
    update_profile_response,
    change_password_request,
    change_password_response,
    verify_email_change_request,
    verify_email_change_response,
)
from ..serializers.change_password_serializer import ChangePasswordSerializer
from ..serializers.update_profile_serializer import UpdateProfileSerializer
from ..serializers.verify_email_change_serializer import VerifyEmailChangeSerializer
from utils.email_sending.profile.send_change_email import send_change_email

class ProfileRateThrottle(UserRateThrottle):
    rate = '50/hour'  # Limit profile operations

class PasswordChangeRateThrottle(UserRateThrottle):
    rate = '5/hour'  # Limit password change attempts

class EmailVerificationRateThrottle(UserRateThrottle):
    rate = '20/hour'  # Limit email verification attempts

class GetProfileView(GenericAPIView):
    """Get current user profile information"""
    permission_classes = [IsAuthenticated]
    throttle_classes = [ProfileRateThrottle]

    @swagger_auto_schema(
        operation_description='Get current user profile information.',
        responses={
            200: get_profile_response,
            401: 'Authentication required',
            429: 'Too many requests',
            500: 'Internal server error'
        }
    )
    def get(self, request):
        """Get current user profile information"""
        try:
            user = request.user
            
            # Get Google Calendar status
            google_calendar_status = {
                'connected': False,
                'calendar_enabled': False,
                'has_valid_credentials': False,
                'google_email': None
            }
            
            if hasattr(user, 'google_calendar_credentials'):
                creds = user.google_calendar_credentials
                google_calendar_status = {
                    'connected': bool(creds.refresh_token),
                    'calendar_enabled': creds.calendar_enabled,
                    'has_valid_credentials': creds.has_valid_credentials(),
                    'google_email': creds.google_email
                }
            
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email_verify': user.email_verify,
                'user_type': user.user_type,
                'date_joined': user.date_joined,
                'google_calendar': google_calendar_status,
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {'error': 'An error occurred while retrieving profile. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UpdateProfileView(GenericAPIView):
    """Update current user profile information"""
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateProfileSerializer
    throttle_classes = [ProfileRateThrottle]

    @swagger_auto_schema(
        operation_description='Update current user profile information and send email verification if email changed.',
        request_body=update_profile_request,
        responses={
            200: update_profile_response,
            400: 'Validation error',
            401: 'Authentication required',
            429: 'Too many requests',
            500: 'Internal server error'
        }
    )
    def put(self, request):
        """Update user profile information"""
        try:
            user = request.user
            serializer = self.get_serializer(data=request.data, context={'user': user})
            
            if not serializer.is_valid():
                errors = []
                for field, field_errors in serializer.errors.items():
                    if isinstance(field_errors, list):
                        errors.extend(field_errors)
                    else:
                        errors.append(str(field_errors))
                return Response(
                    {'error': errors[0] if len(errors) == 1 else errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            validated_data = serializer.validated_data
            messages = []

            # Update first name and last name directly
            first_name = validated_data.get('first_name', '')
            if first_name is not None:
                first_name = first_name.strip()
                if first_name != user.first_name:
                    user.first_name = first_name
                    messages.append("First name updated")
            
            last_name = validated_data.get('last_name', '')
            if last_name is not None:
                last_name = last_name.strip()
                if last_name != user.last_name:
                    user.last_name = last_name
                    messages.append("Last name updated")

            # Validate and update username
            username = validated_data.get('username', '')
            if username is not None:
                username = username.strip()
                if username and username != user.username:
                    user.username = username
                    messages.append("Username updated")

            # Validate and handle email update
            email = validated_data.get('email', '')
            if email is not None:
                email = email.strip()
                if email and email != user.email:
                    # Send verification email for new email
                    try:
                        send_change_email(user, email)
                        messages.append("Email verification sent! Please check your new email to verify the change.")
                    except Exception:
                        return Response(
                            {'error': "Failed to send verification email. Please try again later."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

            # Save user if there are changes
            if messages:
                user.save()
            else:
                messages.append("Profile updated successfully!")

            return Response({
                'message': messages[0] if len(messages) == 1 else messages,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email_verify': user.email_verify,
                }
            }, status=status.HTTP_200_OK)

        except Exception:
            return Response(
                {'error': 'An error occurred during profile update. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ChangePasswordView(GenericAPIView):
    """Change password for current user"""
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [PasswordChangeRateThrottle]

    @swagger_auto_schema(
        operation_description='Change password for current user.',
        request_body=change_password_request,
        responses={
            200: change_password_response,
            400: 'Validation error',
            401: 'Authentication required',
            429: 'Too many requests',
            500: 'Internal server error'
        }
    )
    def post(self, request):
        """Change user password"""
        try:
            user = request.user
            serializer = self.get_serializer(data=request.data, context={'user': user})
            
            if not serializer.is_valid():
                errors = []
                for field, field_errors in serializer.errors.items():
                    if isinstance(field_errors, list):
                        if isinstance(field_errors[0], list):
                            errors.extend(field_errors[0])
                        else:
                            errors.extend(field_errors)
                    else:
                        errors.append(str(field_errors))
                return Response(
                    {'error': errors[0] if len(errors) == 1 else errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            validated_data = serializer.validated_data
            new_password = validated_data.get('new_password')

            # Set new password
            user.set_password(new_password)
            user.save()

            return Response(
                {'message': 'Password changed successfully'}, 
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {'error': 'An error occurred during password change. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VerifyEmailChangeView(GenericAPIView):
    """Verify email change using uid/token and new email"""
    permission_classes = [AllowAny]
    serializer_class = VerifyEmailChangeSerializer
    throttle_classes = [EmailVerificationRateThrottle]

    @swagger_auto_schema(
        operation_description='Verify email change using uid/token and new email.',
        request_body=verify_email_change_request,
        responses={
            200: verify_email_change_response,
            400: 'Invalid link',
            429: 'Too many requests',
            500: 'Internal server error'
        }
    )
    def post(self, request):
        """Verify email change using token"""
        try:
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                errors = []
                for field, field_errors in serializer.errors.items():
                    if isinstance(field_errors, list):
                        errors.extend(field_errors)
                    else:
                        errors.append(str(field_errors))
                return Response(
                    {'error': errors[0] if len(errors) == 1 else errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            validated_data = serializer.validated_data
            user = validated_data.get('user')
            new_email = validated_data.get('new_email_decoded')
            pending_change = validated_data.get('pending_change')
            
            # Mark the pending change as used (single-use token)
            pending_change.used = True
            pending_change.save()
            
            # Update the user's email
            user.email = new_email
            user.email_verify = True
            user.save()
            
            return Response(
                {'message': 'Email updated successfully'}, 
                status=status.HTTP_200_OK
            )
                
        except Exception:
            return Response(
                {'error': 'An error occurred during email verification. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Backward compatibility aliases
get_profile = GetProfileView.as_view()
update_profile = UpdateProfileView.as_view()
change_password = ChangePasswordView.as_view()
verify_email_change = VerifyEmailChangeView.as_view()