from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from accounts.models import User

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if '@' in value: #then it's an email
            try:
                user_obj = User.objects.filter(email=value).first()
                if not user_obj:
                    raise serializers.ValidationError("Email does not exist.")
            except Exception as e:
                raise serializers.ValidationError("Database error occurred.")
        else: #then it's a username
            try:
                if not User.username_exists(value):
                    raise serializers.ValidationError("Username does not exist.")
            except Exception as e:
                raise serializers.ValidationError("Database error occurred.")
        return value

