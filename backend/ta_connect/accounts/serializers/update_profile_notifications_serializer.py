from rest_framework import serializers
from accounts.models import User

class UpdateProfileNotificationsSerializer(serializers.Serializer):
    """Serializer for updating user profile information"""
    
    email_on_booking = serializers.BooleanField()
    email_on_cancellation = serializers.BooleanField()

    def validate(self, data):
        """Validate email notification preferences"""
        return data
    
    def update(self, instance, validated_data):
        """Update user profile with validated data"""

        if instance.is_instructor():
            instance.instructor_profile.email_notifications_on_booking = validated_data.get('email_on_booking', instance.instructor_profile.email_notifications_on_booking)
            instance.instructor_profile.email_notifications_on_cancellation = validated_data.get('email_on_cancellation', instance.instructor_profile.email_notifications_on_cancellation)
            instance.instructor_profile.save()

        elif instance.is_student():
            instance.student_profile.email_notifications_on_booking = validated_data.get('email_on_booking', instance.student_profile.email_notifications_on_booking)
            instance.student_profile.email_notifications_on_cancellation = validated_data.get('email_on_cancellation', instance.student_profile.email_notifications_on_cancellation)
            instance.student_profile.save()
            
        return instance

