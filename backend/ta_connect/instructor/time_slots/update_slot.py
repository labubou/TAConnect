from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from accounts.permissions import IsInstructor, IsStudent
from rest_framework.response import Response
from instructor.serializers.update_slot_serializer import UpdateSlotSerializer
from instructor.models import OfficeHourSlot
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from instructor.schemas.time_slot_schemas import update_time_slot_request, update_time_slot_response

@swagger_auto_schema(
    method='post',
    operation_description='Update an existing office hour time slot for the logged-in instructor.',
    manual_parameters=[
        openapi.Parameter(
            'slot_id',
            openapi.IN_PATH,
            description='ID of the time slot to update',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    request_body=update_time_slot_request,
    responses={
        200: update_time_slot_response,
        400: 'Validation error - missing required fields',
        404: 'Time slot not found',
        500: 'Internal server error - failed to update time slot',
    }
)
@api_view(['POST'])
@permission_classes([IsInstructor])
def update_time_slot(request, slot_id):
    """Handle update time slot for the logged-in user."""
    user = request.user

    if not slot_id:
        return Response(
            {'error': 'Slot ID is required.'}
            , status=status.HTTP_400_BAD_REQUEST)

    time_slot = get_object_or_404(OfficeHourSlot, id=slot_id, instructor=user)

    serializer = UpdateSlotSerializer(instance=time_slot, data=request.data)

    if not serializer.is_valid():
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    updated_slot = serializer.save()
    return Response({'success': True, 'time_slot_id': updated_slot.id, 'message': 'Time slot updated successfully.'}, status=status.HTTP_200_OK)
