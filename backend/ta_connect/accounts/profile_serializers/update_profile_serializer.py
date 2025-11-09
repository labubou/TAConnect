from rest_framework import serializers
from accounts.models import User

class UpdateProfileSerializer(serializers.Serializer):
    """Serializer for updating user profile information"""
    
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    username = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    user_type = serializers.CharField(max_length=10, required=False, allow_blank=True)

    def validate_username(self, value):
        """Validate username - cannot contain @ and must be unique"""
        if not value:
            return value
        
        # Check if username contains '@'
        if '@' in value:
            raise serializers.ValidationError("Username cannot contain @")
        
        # Check if username already exists (excluding current user)
        user = self.context.get('user')
        if user and User.objects.filter(username=value).exclude(id=user.id).exists():
            raise serializers.ValidationError('Username already taken, please choose another one!')
        
        return value

    def validate_email(self, value):
        """Validate email - must contain @ and must be unique"""
        if not value:
            return value
        
        # Check if email contains '@'
        if '@' not in value:
            raise serializers.ValidationError("Email must contain @")
        
        # Check if email already exists (excluding current user)
        user = self.context.get('user')
        if user and User.objects.filter(email=value).exclude(id=user.id).exists():
            raise serializers.ValidationError('Email already taken, please choose another one!')
        
        return value

    def validate_user_type(self, value):
        """Validate user type - must be a valid choice"""
        if not value:
            return value
        
        if value not in dict(User.USER_TYPE_CHOICES).keys():
            raise serializers.ValidationError("Invalid user type")
        
        return value
