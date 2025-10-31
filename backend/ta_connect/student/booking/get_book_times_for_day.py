from django.shortcuts import render
from accounts.permissions import IsStudent, IsInstructor
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from instructor.models import OfficeHourSlot, BookingPolicy
from student.models import Booking
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import datetime

# Create your views here.
@swagger_auto_schema(
    method='get',
    operation_description='Get available booking times for a specific date and slot.',
    manual_parameters=[
        openapi.Parameter(
            'slot_id',
            openapi.IN_PATH,
            description='ID of the office hour slot',
            type=openapi.TYPE_INTEGER,
            required=True
        ),
        openapi.Parameter(
            'date',
            openapi.IN_QUERY,
            description='Date in YYYY-MM-DD format',
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        200: 'List of available time slots',
        400: 'Invalid request or slot not active',
        403: 'Student email not allowed to book this slot',
        404: 'Slot not found',
        500: 'Internal server error'
    }
)
@api_view(['GET'])
@permission_classes([IsStudent])
def book_slot(request, slot_id):
    try:
        today = datetime.date.today()

        # Get date from query parameters, not request.data (GET request)
        date_str = request.query_params.get("date")

        slot = OfficeHourSlot.objects.filter(id=slot_id).first()

        if not slot:
            return Response({'error': 'Slot not found'}, status=404)
        
        if not date_str:
            return Response({'error': 'No date provided'}, status=400)

        if not slot.instructor:
            return Response({'error': 'Instructor not assigned to this slot'}, status=400)

        if not slot.day_of_week or not slot.start_time or not slot.end_time:
            return Response({'error': 'Slot timing details are incomplete'}, status=400)
        
        # Check if slot is within the active date range
        try:
            selected_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=400)
        
        if slot.start_date > selected_date or slot.end_date < selected_date:
            return Response({'error': 'This slot is not active on the selected date'}, status=400)
        
        if not slot.status:
            return Response({'error': f'This slot is inactive'}, status=400)
        
        # Check if student email is allowed (if policy requires specific emails)
        student_email = request.user.email
        if hasattr(slot, 'policy') and slot.policy.require_specific_email:
            is_allowed = slot.policy.allowed_students.filter(email=student_email).exists()
            if not is_allowed:
                return Response({
                    'error': 'Your email is not authorized to book this office hour slot'
                }, status=403)
        
        available_times = []

        # Verify the selected date matches the slot's day of week
        day_of_the_week = selected_date.strftime('%a')  # Mon, Tue, etc.
        if day_of_the_week != slot.day_of_week:
            return Response({
            }, status=400)
        
        # Get already booked appointments for this date
        booked_times = Booking.objects.filter(
            office_hour=slot,
            date=selected_date
        ).values_list('start_time', flat=True)

        # Use slot's duration_minutes, not booked_times
        separation_minutes = slot.duration_minutes
        current_time = datetime.datetime.combine(datetime.date.today(), slot.start_time)
        end_time = datetime.datetime.combine(datetime.date.today(), slot.end_time)
        
        # Generate all possible time slots between start_time and end_time
        while current_time < end_time:
            time_obj = current_time.time()
            
            # Check if this time is already booked
            if time_obj not in booked_times:
                available_times.append({
                    'value': time_obj.strftime('%H:%M:%S'),
                    'display': time_obj.strftime('%I:%M %p')
                })
            
            # Move to the next time slot based on duration_minutes
            current_time += datetime.timedelta(minutes=int(separation_minutes))

        return Response({
            'slot_id': slot.id,
            'date': date_str,
            'available_times': available_times
        }, status=200)
    
    except Exception as e:
        return Response({'error': f'An error occurred {str(e)}'}, status=500)