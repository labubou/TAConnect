from rest_framework import serializers
from accounts.models import User
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator

class VerifyEmailChangeSerializer(serializers.Serializer):
    """Serializer for verifying email change"""
    
    uid = serializers.CharField()
    token = serializers.CharField()
    new_email = serializers.CharField()

    def validate(self, data):
        """Validate email change verification data"""
        uid = data.get('uid')
        token = data.get('token')
        new_email_encoded = data.get('new_email')

        if not all([uid, token, new_email_encoded]):
            raise serializers.ValidationError('Missing verification parameters')

        # Decode the user ID and new email
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            new_email = force_str(urlsafe_base64_decode(new_email_encoded))
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError('Invalid verification link')

        # Check if the token is valid
        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError('Invalid or expired verification link')

        # Check if the new email is already taken by another user
        if User.objects.filter(email=new_email).exclude(id=user.id).exists():
            raise serializers.ValidationError('This email address is already in use by another account')

        # Store decoded values in validated_data for use in view
        data['user'] = user
        data['new_email_decoded'] = new_email

        return data

