from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from accounts.permissions import IsInstructor, IsStudent
from rest_framework.response import Response
from instructor.models import OfficeHourSlot
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from instructor.schemas.time_slot_schemas import update_time_slot_request, update_time_slot_response

@swagger_auto_schema(
    method='delete',
    operation_description='Delete an existing office hour time slot for the logged-in instructor.',
    manual_parameters=[
        openapi.Parameter(
            'slot_id',
            openapi.IN_PATH,
            description='ID of the time slot to delete',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    responses={
        200: openapi.Response(
            description='Time slot deleted successfully',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'success': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    'time_slot_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                }
            )
        ),
        404: 'Time slot not found',
        500: 'Internal server error - failed to delete time slot',
    }
)
@api_view(['DELETE'])
@permission_classes([IsInstructor])
def del_slot(request, slot_id):
    """Handle update time slot for the logged-in user."""
    user = request.user
    
    if not slot_id:
        return Response(
            {'error': 'Slot ID is required.'}
            , status=status.HTTP_400_BAD_REQUEST)

    time_slot = get_object_or_404(OfficeHourSlot, id=slot_id, instructor=user)

    try:  # making a try and except to handle database errors
        
       time_slot.delete()
    except Exception as e:
        return Response({'error': f'Failed to update time slot'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'success': True, 'time_slot_id': time_slot.id}, status=status.HTTP_200_OK)
