from rest_framework import serializers
from accounts.models import User

class GetProfileSerializer(serializers.ModelSerializer):
    """Serializer for getting user profile information"""
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'email_verify',
            'user_type',
            'date_joined',
        ]
        read_only_fields = [
            'id',
            'email_verify',
            'date_joined',
        ]

