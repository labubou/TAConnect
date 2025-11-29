from rest_framework import serializers
from accounts.models import User, PendingEmailChange
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
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
            raise serializers.ValidationError(f'Invalid verification link: Unable to decode parameters')

        # Check for pending email change record - look for any valid pending change for this user/email
        pending_change = PendingEmailChange.objects.filter(
            user=user,
            new_email=new_email,
        ).order_by('-created_at').first()

        if not pending_change:
            raise serializers.ValidationError('No pending email change request found. Please request a new email change from your profile.')

        # Check if token has already been used
        if pending_change.used:
            raise serializers.ValidationError('This email change has already been completed. Your email may have been updated already.')

        # Check if token has expired
        if pending_change.is_expired():
            raise serializers.ValidationError('This verification link has expired. Please request a new email change from your profile.')

        # Verify the token matches
        if pending_change.token != token:
            # Check if there's a newer request
            raise serializers.ValidationError('This verification link is outdated. A newer email change request may have been made.')

        # Check if the token is valid using Django's token generator
        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError('The verification token is invalid or has expired. Please request a new email change.')

        # Check if the new email is already taken by another user
        if User.objects.filter(email=new_email).exclude(id=user.id).exists():
            raise serializers.ValidationError('This email address is already in use by another account')

        # Store decoded values in validated_data for use in view
        data['user'] = user
        data['new_email_decoded'] = new_email
        data['pending_change'] = pending_change

        return data

