from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from accounts.schemas.email_preference_schemas import (
    get_email_preferences_swagger,
    update_email_preferences_swagger,
)
from ..serializers.update_profile_notifications_serializer import UpdateProfileNotificationsSerializer
from utils.error_formatter import format_serializer_errors

class ProfileEmailPreferenceView(GenericAPIView):
    """
    Manage email notification preferences for authenticated users.
    
    Supports both GET and PATCH methods:
    - GET: Retrieve current email notification preferences
    - PATCH: Update email notification preferences
    
    Works for both instructor and student user types.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateProfileNotificationsSerializer

    @swagger_auto_schema(**get_email_preferences_swagger)
    def get(self, request):
        """
        Get current user email notification preferences.
        
        Returns the user's current settings for:
        - Email notifications on booking
        - Email notifications on cancellation
        - Email notifications on updates booking
        """
        try:
            user = request.user
            
            # Initialize default values
            email_on_booking = True
            email_on_cancellation = True
            email_on_update = True
            
            # Get preferences based on user type
            if user.is_instructor():
                email_on_booking = user.instructor_profile.email_notifications_on_booking
                email_on_cancellation = user.instructor_profile.email_notifications_on_cancellation
                email_on_update = user.instructor_profile.email_notifications_on_update
            elif user.is_student():
                email_on_booking = user.student_profile.email_notifications_on_booking
                email_on_cancellation = user.student_profile.email_notifications_on_cancellation
                email_on_update = user.student_profile.email_notifications_on_update

            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
                'email_on_booking': email_on_booking,
                'email_on_cancellation': email_on_cancellation,
                'email_on_update': email_on_update,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print("Error retrieving email preferences:", e)
            return Response(
                {'error': 'An error occurred while retrieving email preferences. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @swagger_auto_schema(**update_email_preferences_swagger)
    def patch(self, request):
        """Update user email notification preferences"""
        try:
            user = request.user
            serializer = self.get_serializer(data=request.data, context={'user': user})
            
            if not serializer.is_valid():
                return Response(
                    format_serializer_errors(serializer.errors),
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer.update(user, serializer.validated_data)

            return Response(
                {'status': 'Profile updated successfully'},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            print("Error updating email preferences:", e)
            return Response(
                {'error': 'An error occurred while updating email preferences. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
