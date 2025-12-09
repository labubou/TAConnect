from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from accounts.permissions import IsInstructor, IsStudent
from rest_framework.response import Response
from instructor.models import OfficeHourSlot
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from instructor.schemas.time_slot_schemas import update_status_time_slot_response
from student.utils.cancel_student_bookings import cancel_student_bookings

@swagger_auto_schema(
    method='POST',
    operation_description='Toggle the status of an existing office hour time slot for the logged-in instructor.',
    manual_parameters=[
        openapi.Parameter(
            'slot_id',
            openapi.IN_PATH,
            description='ID of the time slot to toggle status',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    responses={
        200: update_status_time_slot_response,
        404: 'Time slot not found',
        500: 'Internal server error - failed to update time slot status',
    }
)
@api_view(['POST'])
@permission_classes([IsInstructor])
def update_time_slot_status(request, slot_id):
    """Handle update time slot for the logged-in user."""
    try:
        user = request.user

        if not slot_id:
            return Response(
                {'error': 'Slot ID is required.'}
                , status=status.HTTP_400_BAD_REQUEST)

        time_slot = get_object_or_404(OfficeHourSlot, id=slot_id, instructor=user)

        try:  # making a try and except to handle database errors       
            time_slot.status = not time_slot.status
            time_slot.save()
        except Exception as e:
            return Response({'error': f'Failed to update time slot'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Only cancel bookings if slot is being disabled
        if not time_slot.status:
            message, error = cancel_student_bookings(time_slot, cancellation_reason='slot_disabled')

            if error:
                print(f"Error cancelling bookings for time slot {time_slot.id}: {error}")
                return Response({'error': "something went wrong"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            message = "Time slot enabled successfully."

        return Response({'success': True, 'time_slot_id': time_slot.id, 'message': message}, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error updating time slot status: {str(e)}")
        return Response({'error': 'An error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)