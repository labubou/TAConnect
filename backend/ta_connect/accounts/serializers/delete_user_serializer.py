from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from accounts.models import User, InstructorProfile, StudentProfile

class DeleteUserSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        user = self.context.get('user')
        if not user.check_password(data.get('password', '')):
            raise serializers.ValidationError({"password": "Incorrect password."})
        return data
