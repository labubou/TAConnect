from django.shortcuts import render
from accounts.permissions import IsStudent, IsInstructor
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from instructor.models import OfficeHourSlot, BookingPolicy
from student.models import Booking
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import datetime
from django.core.mail import send_mail
from django.template.loader import render_to_string
from ta_connect.settings import frontend_url

# Create your views here.
@swagger_auto_schema(
    method='post',
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
@api_view(['POST'])
@permission_classes([IsStudent])
def book_slot(request, slot_id):
    try:

        date_str = request.data.get("date")
        start_time_str = request.data.get("time")

        slot = OfficeHourSlot.objects.filter(id=slot_id).first()

        if not slot:
            return Response({'error': 'Slot not found'}, status=404)
        
        if not date_str:
            return Response({'error': 'No date provided'}, status=400)
        
        if not start_time_str:
            return Response({'error': 'No start_time provided'}, status=400)

        if not slot.instructor:
            return Response({'error': 'Instructor not assigned to this slot'}, status=400)

        if not slot.day_of_week or not slot.start_time or not slot.end_time:
            return Response({'error': 'Slot timing details are incomplete'}, status=400)

        # Check the format of the date
        try:
            selected_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=400)
        
        # Check the format of the time
        try:
            selected_time = datetime.datetime.strptime(start_time_str, '%H:%M').time()
        except ValueError:
            return Response({'error': 'Invalid time format. Use HH:MM'}, status=400)
        
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

        # Combine date and time into datetime
        start_datetime = datetime.datetime.combine(selected_date, selected_time)

        # Check if this time is already booked
        existing_booking = Booking.objects.filter(
            office_hour=slot,
            date=selected_date,
            start_time=start_datetime
        ).exists()

        if existing_booking:
            return Response({'error': 'This time is already booked'}, status=400)
            
        book_time = Booking.objects.create(
                office_hour=slot,
                student=request.user,
                date=selected_date,
                start_time=start_datetime,
            )

        book_time.save()

        # Prepare email context data
        email_context = {
            'student_name': f"{request.user.first_name} {request.user.last_name}" if request.user.first_name else request.user.username,
            'student_email': request.user.email,
            'instructor_name': f"{slot.instructor.first_name} {slot.instructor.last_name}" if slot.instructor.first_name else slot.instructor.username,
            'course_name': slot.course_name if slot.course_name else 'N/A',
            'booking_date': selected_date.strftime('%B %d, %Y'),
            'booking_time': start_time_str,
            'duration': slot.duration_minutes,
            'room': slot.room if hasattr(slot, 'room') and slot.room else None,
            'frontend_url': frontend_url,
        }

        # Send email to the student to confirm
        try:
            mail_subject = 'Booking Confirmation - TA Connect'
            message = render_to_string('booking_confirmation_email_Student.html', email_context)
            send_mail(mail_subject, message, 'taconnect.team@gmail.com', [request.user.email], html_message=message)
        except Exception as email_error:
            # If email fails, still create the user but log the error
            print(f"Failed to send booking confirmation email: {str(email_error)}")

        # Send email to the TA to confirm
        try:
            mail_subject = 'New Booking Received - TA Connect'
            message = render_to_string('booking_confirmation_email_TA.html', email_context)
            send_mail(mail_subject, message, 'taconnect.team@gmail.com', [slot.instructor.email], html_message=message)
        except Exception as email_error:
            # If email fails, still create the user but log the error
            print(f"Failed to send booking confirmation email: {str(email_error)}")

        return Response({
            'slot_id': slot.id,
            'date': date_str,
            'start_time': start_time_str,
            'message' : f"Successfully booked slot {slot.id} on {date_str} at {start_time_str}."
        }, status=200)
    
    except Exception as e:
        return Response({'error': f'An error occurred {str(e)}'}, status=500)