from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password"""
    
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        """Validate password change data"""
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        if not all([current_password, new_password, confirm_password]):
            raise serializers.ValidationError('All password fields are required')

        # Check if new passwords match
        if new_password != confirm_password:
            raise serializers.ValidationError('New passwords do not match')

        # Validate new password using Django's password validators
        user = self.context.get('user')
        if user:
            try:
                validate_password(new_password, user)
            except ValidationError as e:
                raise serializers.ValidationError({'new_password': e.messages})

        return data

    def validate_current_password(self, value):
        """Validate current password"""
        user = self.context.get('user')
        if user and not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect')
        return value
