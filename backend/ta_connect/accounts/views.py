from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from .schemas.profile_schemas import (
    user_view_response,
)

@swagger_auto_schema(
    method='get',
    operation_description='Get current authenticated user details including user type.',
    responses={200: user_view_response}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view(request):
    """
    Get current authenticated user details
    """
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email_verify': getattr(user, 'email_verify', False),
        'user_type': getattr(user, 'user_type', None),
    })
