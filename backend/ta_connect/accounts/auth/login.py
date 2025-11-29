from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import AnonRateThrottle
from drf_yasg.utils import swagger_auto_schema
from accounts.schemas.auth_schemas import login_request, login_response
from ..serializers.login_serializer import LoginSerializer
from utils.email_sending.auth.send_verification_email import send_verification_email
from ..models import User

class LoginRateThrottle(AnonRateThrottle):
    rate = '5/min'  # Limit to 5 login attempts per minute per IP for more security

class LoginView(GenericAPIView):
    """
    Authenticate user and return JWT tokens.
    Supports both username and email authentication.
    """
    serializer_class = LoginSerializer # Serializer for validating login data
    permission_classes = [AllowAny] #the permissions for who can access this
    throttle_classes = [LoginRateThrottle] #the throttle to have a maximum of calling this endpoint per minute

    #swagger implementation
    @swagger_auto_schema(
        operation_description='Authenticate using username or email and password.',
        request_body=login_request,
       responses={
            200: login_response,
            400: 'Invalid input',
            401: 'Unauthorized',
            429: 'Too many requests',
            500: 'Internal server error'
        }
    )
    def post(self, request): #defining the function with post
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    format_serializer_errors(serializer.errors),
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            username = serializer.validated_data.get('username', '').strip()
            password = serializer.validated_data.get('password')

            user = None
            if '@' in username:

                email = username.lower()
                user_obj = User.objects.filter(email__iexact=email).first()
                if user_obj:
                    user = authenticate(username=user_obj.username, password=password)
                    
            else:#then authenticate using username

                user = authenticate(username=username, password=password)

            if not user:
                return Response(
                    {'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not user.email_verify:
                send_verification_email(user)
                return Response(
                    {
                        'error': 'Email not verified',
                        'message': 'Please check your email to verify your account. A new verification email has been sent.'
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )

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
            }, status=status.HTTP_200_OK)

        except Exception:
            return Response(
                {'error': f'An error occurred during login. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
