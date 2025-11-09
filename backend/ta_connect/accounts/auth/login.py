from django.contrib.auth import authenticate
from ..models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
from ta_connect.settings import SITE_DOMAIN, frontend_url
from django.views.decorators.csrf import csrf_exempt
from drf_yasg.utils import swagger_auto_schema
from accounts.schemas.auth_schemas import login_request, login_response
from ..serializers.login_serializer import LoginSerializer

#the login route
@swagger_auto_schema(
    method='post',
    operation_description='Authenticate using username or email and password.',
    request_body=login_request,
    responses={200: login_response, 400: 'Invalid input', 401: 'Unauthorized'}
)
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_view(request):
    try:
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        username = serializer.validated_data.get('username')
        password = serializer.validated_data.get('password')

        user = authenticate(username=username, password=password)

        if user:
            if user.email_verify == True:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'user_type': user.user_type,
                    }
                })
            else:
                # Send verification email
                try:
                    mail_subject = 'Activate your TAConnect account'
                    current_site = SITE_DOMAIN.rstrip('/')
                    message = render_to_string('activate_mail_send.html', {
                        'user': user,
                        'domain': current_site,
                        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                        'token': default_token_generator.make_token(user),
                        'frontend_url': frontend_url
                    })
                    send_mail(mail_subject, message, 'taconnect.team@gmail.com', [user.email], html_message=message)
                except Exception as email_error:
                    # If email fails, still create the user but log the error
                    print(f"Failed to send verification email: {str(email_error)}")

                return Response(
                    {
                        'error': 'Email not verified',
                        'message': 'Please check your email to verify your account. A new verification email has been sent.'
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

    except Exception as e:
        return Response(
            {'error': 'An error occurred during login. Please try again.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )