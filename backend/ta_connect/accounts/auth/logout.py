from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_yasg.utils import swagger_auto_schema
from accounts.schemas.auth_schemas import logout_request, logout_response

class LogoutView(GenericAPIView):
    """Logout by blacklisting the provided refresh token"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description='Logout by blacklisting the provided refresh token.',
        request_body=logout_request,
        responses={
            200: logout_response,
            400: 'Invalid or missing token',
            500: 'Internal server error'
        }
    )
    def post(self, request):
        """
        Logout view that blacklists the refresh token
        """
        try:
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response(
                    {'message': 'Logout successful'}, 
                    status=status.HTTP_200_OK
                )
            except TokenError:
                return Response(
                    {'error': 'Invalid or expired refresh token'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception:
            return Response(
                {'error': 'An error occurred during logout. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
