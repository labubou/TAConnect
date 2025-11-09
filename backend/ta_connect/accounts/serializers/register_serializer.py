from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from accounts.models import User

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    user_type = serializers.CharField(max_length=50)
    first_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=50, required=False, allow_blank=True)

    def validate_username(self, value):
        if '@' in value:
            raise serializers.ValidationError("Username cannot contain '@'.")
        if User.username_exists(value):
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Invalid email format.")
        if User.email_exists(value):
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            **validated_data,
            email_verify=False
        )
        return user
