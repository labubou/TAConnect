from django.shortcuts import redirect
from ..models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from ta_connect.settings import SITE_DOMAIN, frontend_url
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from drf_yasg.utils import swagger_auto_schema
from accounts.schemas.profile_schemas import (
    get_profile_response,
    update_profile_request,
    update_profile_response,
    change_password_request,
    change_password_response,
    verify_email_change_request,
    verify_email_change_response,
)
from ..serializers.change_password_serializer import ChangePasswordSerializer
from ..serializers.update_profile_serializer import UpdateProfileSerializer
from ..serializers.verify_email_change_serializer import VerifyEmailChangeSerializer
from ..serializers.get_profile_serializer import GetProfileSerializer

@swagger_auto_schema(
    method='get',
    operation_description='Get current user profile information.',
    responses={200: get_profile_response}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Get current user profile information"""
    user = request.user
    serializer = GetProfileSerializer(user)
    return Response(serializer.data)

@swagger_auto_schema(
    method='put',
    operation_description='Update current user profile information and send email verification if email changed.',
    request_body=update_profile_request,
    responses={200: update_profile_response, 400: 'Validation error'}
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile information"""
    try:
        user = request.user
        serializer = UpdateProfileSerializer(data=request.data, context={'user': user})
        
        if not serializer.is_valid():
            errors = []
            for field, field_errors in serializer.errors.items():
                if isinstance(field_errors, list):
                    errors.extend(field_errors)
                else:
                    errors.append(str(field_errors))
            return Response(
                {'error': errors[0] if len(errors) == 1 else errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        messages = []

        # Update first name and last name directly
        first_name = validated_data.get('first_name', '')
        if first_name is not None:
            first_name = first_name.strip()
            if first_name != user.first_name:
                user.first_name = first_name
                messages.append("First name updated")
        
        last_name = validated_data.get('last_name', '')
        if last_name is not None:
            last_name = last_name.strip()
            if last_name != user.last_name:
                user.last_name = last_name
                messages.append("Last name updated")

        # Validate and update user type
        user_type = validated_data.get('user_type', '')
        if user_type is not None:
            user_type = user_type.strip()
            if user_type and user_type != user.user_type:
                user.user_type = user_type
                messages.append("User type updated")

        # Validate and update username
        username = validated_data.get('username', '')
        if username is not None:
            username = username.strip()
            if username and username != user.username:
                user.username = username
                messages.append("Username updated")

        # Validate and handle email update
        email = validated_data.get('email', '')
        if email is not None:
            email = email.strip()
            if email and email != user.email:
                # Send verification email for new email
                try:
                    mail_subject = 'Verify your new email address'
                    current_site = SITE_DOMAIN.rstrip('/')
                    
                    # Create verification context
                    uid = urlsafe_base64_encode(force_bytes(user.pk))
                    token = default_token_generator.make_token(user)
                    new_email_encoded = urlsafe_base64_encode(force_bytes(email))
                    
                    context = {
                        'user': user,
                        'domain': current_site,
                        'frontend_url': frontend_url,
                        'uid': uid,
                        'token': token,
                        'new_email': email,
                        'new_email_encoded': new_email_encoded,
                        'verification_url': f'{frontend_url}/verify-email-change/{uid}/{token}/{new_email_encoded}'
                    }
                    
                    message = render_to_string('activate_mail_change_send.html', context)
                    
                    send_mail(
                        mail_subject, 
                        '', 
                        'taconnect.team@gmail.com', 
                        [email], 
                        html_message=message
                    )
                    
                    messages.append("Email verification sent! Please check your new email to verify the change.")
                    
                except Exception as email_error:
                    print(f"Failed to send email verification: {str(email_error)}")
                    return Response(
                        {'error': "Failed to send verification email. Please try again later."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        # Save user if there are changes
        if messages:
            user.save()
        else:
            messages.append("Profile updated successfully!")

        return Response({
            'message': messages[0] if len(messages) == 1 else messages,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email_verify': user.email_verify,
            }
        })

    except Exception as e:
        return Response(
            {'error': f'An error occurred during profile update: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@swagger_auto_schema(
    method='post',
    operation_description='Change password for current user.',
    request_body=change_password_request,
    responses={200: change_password_response, 400: 'Validation error'}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    try:
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data, context={'user': user})
        
        if not serializer.is_valid():
            errors = []
            for field, field_errors in serializer.errors.items():
                if isinstance(field_errors, list):
                    if isinstance(field_errors[0], list):
                        errors.extend(field_errors[0])
                    else:
                        errors.extend(field_errors)
                else:
                    errors.append(str(field_errors))
            return Response(
                {'error': errors[0] if len(errors) == 1 else errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        new_password = validated_data.get('new_password')

        # Set new password
        user.set_password(new_password)
        user.save()

        return Response(
            {'message': 'Password changed successfully'}, 
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {'error': f'An error occurred during password change: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@swagger_auto_schema(
    method='post',
    operation_description='Verify email change using uid/token and new email.',
    request_body=verify_email_change_request,
    responses={200: verify_email_change_response, 400: 'Invalid link'}
)
@api_view(['POST'])
@permission_classes([])
def verify_email_change(request):
    """Verify email change using token"""
    try:
        serializer = VerifyEmailChangeSerializer(data=request.data)
        
        if not serializer.is_valid():
            errors = []
            for field, field_errors in serializer.errors.items():
                if isinstance(field_errors, list):
                    errors.extend(field_errors)
                else:
                    errors.append(str(field_errors))
            return Response(
                {'error': errors[0] if len(errors) == 1 else errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        user = validated_data.get('user')
        new_email = validated_data.get('new_email_decoded')
        
        # Update the user's email
        user.email = new_email
        user.email_verify = True
        user.save()
        
        return Response(
            {'message': 'Email updated successfully'}, 
            status=status.HTTP_200_OK
        )
            
    except Exception as e:
        return Response(
            {'error': f'An error occurred during email verification: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )