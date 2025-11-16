from rest_framework import serializers
from accounts.models import User

class LoginSerializer(serializers.Serializer):
    #validation for login fields
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    #validate the username field with specific rules
    def validate_username(self, value):
        v = value.strip()
        if '@' in v:
            if not User.objects.filter(email__iexact=v).exists():
                raise serializers.ValidationError("Email does not exist.")
        else:
            if not User.objects.filter(username__iexact=v).exists():
                raise serializers.ValidationError("Username does not exist.")
        return v
