from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
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
@permission_classes([IsAuthenticated])
def update_time_slot(request, slot_id):
    """Handle update time slot for the logged-in user."""
    user = request.user

    #the data to update
    course_name = request.data.get("course_name")
    section = request.data.get("section", " ")
    day_of_week = request.data.get("day_of_week")
    start_time = request.data.get("start_time")
    end_time = request.data.get("end_time")
    duration_minutes = request.data.get("duration_minutes", 10)
    start_date = request.data.get("start_date")
    end_date = request.data.get("end_date")

    # Validate the required input data
    if not user or not course_name or not start_time or not end_time or not day_of_week or not start_date or not end_date:
        return Response(
            {'error': 'Course name, start time, end time, day of week, start date, and end date are required.'}
            , status=status.HTTP_400_BAD_REQUEST)
    
    if not slot_id:
        return Response(
            {'error': 'Slot ID is required.'}
            , status=status.HTTP_400_BAD_REQUEST)

    time_slot = get_object_or_404(OfficeHourSlot, id=slot_id, instructor=user)

    try:  # making a try and except to handle database errors
        # Update the time slot
        time_slot.course_name = course_name
        time_slot.section = section
        time_slot.day_of_week = day_of_week
        time_slot.start_time = start_time
        time_slot.end_time = end_time
        time_slot.duration_minutes = duration_minutes
        time_slot.start_date = start_date
        time_slot.end_date = end_date
        time_slot.save()
    except Exception as e:
        return Response({'error': f'Failed to update time slot'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'success': True, 'time_slot_id': time_slot.id}, status=status.HTTP_200_OK)
