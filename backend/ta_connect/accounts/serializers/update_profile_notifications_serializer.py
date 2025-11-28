from rest_framework import serializers
from accounts.models import User

class UpdateProfileNotificationsSerializer(serializers.Serializer):
    """
    Serializer for updating email notification preferences.
    
    Fields:
    - email_on_booking: Boolean flag for booking notifications
    - email_on_cancellation: Boolean flag for cancellation notifications
    """
    email_on_booking = serializers.BooleanField(required=False)
    email_on_cancellation = serializers.BooleanField(required=False)

    def validate(self, data):
        """
        Validate that at least one field is provided.
        """
        if not data:
            raise serializers.ValidationError(
                "At least one notification preference must be provided."
            )
        return data

    def update(self, user, validated_data):
        """
        Update the user's email notification preferences.
        
        Args:
            user: The user instance to update
            validated_data: Dictionary containing preference updates
            
        Returns:
            Updated user instance
        """
        # Update based on user type
        if user.is_instructor():
            profile = user.instructor_profile
        elif user.is_student():
            profile = user.student_profile
        else:
            raise serializers.ValidationError(
                "User must have either an instructor or student profile."
            )

        # Update only the fields that were provided
        if 'email_on_booking' in validated_data:
            profile.email_notifications_on_booking = validated_data['email_on_booking']
        
        if 'email_on_cancellation' in validated_data:
            profile.email_notifications_on_cancellation = validated_data['email_on_cancellation']
        
        profile.save()
        return user

