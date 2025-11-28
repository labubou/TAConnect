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
from ..serializers.update_profile_notifications_serializer import UpdateProfileNotificationsSerializer
from .utils.send_change_email import send_change_email

class ProfileEmailPreferenceView(GenericAPIView):
    """Get current user profile information"""
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateProfileNotificationsSerializer

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
        """Get current user email preference information"""
        try:
            user = request.user
            if user.is_instructor():
                email_on_booking = user.instructor_profile.email_notifications_on_booking
                email_on_cancellation = user.instructor_profile.email_notifications_on_cancellation

            elif user.is_student():
                email_on_booking = user.student_profile.email_notifications_on_booking
                email_on_cancellation = user.student_profile.email_notifications_on_cancellation

            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
                'email_on_booking': email_on_booking,
                'email_on_cancellation': email_on_cancellation,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print("Error retrieving profile information:", e)
            return Response(
                {'error': 'An error occurred while retrieving profile. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
    def patch(self, request):
        """Update user email preferences"""
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

            user = serializer.update(user, serializer.validated_data)

            return Response(
                {'status': 'Profile updated successfully'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print("Error updating profile information:", e)
            return Response(
                {'error': 'An error occurred during profile update. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
