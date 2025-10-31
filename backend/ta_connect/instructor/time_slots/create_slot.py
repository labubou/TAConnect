from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from instructor.models import OfficeHourSlot, BookingPolicy
from drf_yasg.utils import swagger_auto_schema
from instructor.schemas.time_slot_schemas import add_time_slot_request, add_time_slot_response
from accounts.permissions import IsInstructor, IsStudent

@swagger_auto_schema(
    method="post",
    operation_description="Create a new office hour time slot for the logged-in instructor.",
    request_body=add_time_slot_request,
    responses={
        201: add_time_slot_response,
        400: "Invalid input data - missing required fields",
        500: "Internal server error - failed to create time slot"
    }
)
@api_view(["POST"])
@permission_classes([IsInstructor])
def add_time_slot(request):
    try:
        user = request.user
        course_name = request.data.get("course_name")
        section = request.data.get("section", " ")
        day_of_week = request.data.get("day_of_week")
        start_time = request.data.get("start_time")
        end_time = request.data.get("end_time")
        duration_minutes = request.data.get("duration_minutes", 10)
        start_date = request.data.get("start_date")
        end_date = request.data.get("end_date")
        room = request.data.get("room")

        # Validate the required input data
        if not user or not course_name or not start_time or not end_time or not day_of_week or not start_date or not end_date or not room:
            return Response(
                {'error': 'Course name, start time, end time, day of week, start date, room, and end date are required.'}
                , status=status.HTTP_400_BAD_REQUEST)

        days_of_week_choices = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        if day_of_week not in days_of_week_choices:
            return Response(
                {'error': f'Day of week must be one of {days_of_week_choices}.'}
                , status=status.HTTP_400_BAD_REQUEST)

        try: #making a try and except to handle database errors
            # Create the time slot
            time_slot = OfficeHourSlot.objects.create(
                instructor=user,
                course_name=course_name,
                section=section,
                start_time=start_time,
                end_time=end_time,
                day_of_week=day_of_week,
                duration_minutes=duration_minutes,
                start_date=start_date,
                end_date=end_date,
                room=room
            )
        except Exception as e:
            return Response({'error': f'Failed to create time slot'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'success': True, 'time_slot_id': time_slot.id}, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error in add_time_slot")
        return Response(
            {'error': 'An error occurred while creating the time slot'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
