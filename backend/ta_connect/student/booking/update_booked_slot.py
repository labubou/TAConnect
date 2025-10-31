from django.shortcuts import render, get_object_or_404
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
from student.schemas.booking_schemas import update_booked_slot_request, update_booked_slot_response
#update booked slot

# Create your views here.
@swagger_auto_schema(
    method='PATCH',
    operation_description='Update an existing booking for an office hour slot.',
    manual_parameters=[
        openapi.Parameter(
            'slot_id',
            openapi.IN_PATH,
            description='ID of the office hour slot',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    request_body=update_booked_slot_request,
    responses={
        200: update_booked_slot_response,
        400: 'Invalid request or slot not active',
        403: 'Student email not allowed to update this slot',
        404: 'Booking not found',
        500: 'Internal server error'
    }
)
@api_view(['PATCH'])
@permission_classes([IsStudent])
def update_slot(request, slot_id):
    try:
        # Get booking details
        old_date_str = request.data.get("old_date")
        old_time_str = request.data.get("old_time")
        new_date_str = request.data.get("new_date")
        new_time_str = request.data.get("new_time")

        if not all([old_date_str, old_time_str, new_date_str, new_time_str]):
            return Response({'error': 'All date and time fields are required'}, status=400)

        # Parse dates and times
        try:
            old_date = datetime.datetime.strptime(old_date_str, '%Y-%m-%d').date()
            old_time = datetime.datetime.strptime(old_time_str, '%H:%M').time()
            new_date = datetime.datetime.strptime(new_date_str, '%Y-%m-%d').date()
            new_time = datetime.datetime.strptime(new_time_str, '%H:%M').time()
        except ValueError:
            return Response({'error': 'Invalid date/time format. Use YYYY-MM-DD for date and HH:MM for time'}, status=400)

        # Find the existing booking
        old_start_datetime = datetime.datetime.combine(old_date, old_time)
        existing_booking = get_object_or_404(
            Booking,
            office_hour_id=slot_id,
            student=request.user,
            date=old_date,
            start_time=old_start_datetime,
            is_cancelled=False
        )

        slot = existing_booking.office_hour

        # Validate new booking time
        if slot.start_date > new_date or slot.end_date < new_date:
            return Response({'error': 'The new date is outside the valid range for this slot'}, status=400)

        if not slot.status:
            return Response({'error': 'This slot is currently inactive'}, status=400)

        # Check if new time is already booked
        new_start_datetime = datetime.datetime.combine(new_date, new_time)
        time_conflict = Booking.objects.filter(
            office_hour=slot,
            date=new_date,
            start_time=new_start_datetime,
            is_cancelled=False
        ).exclude(id=existing_booking.id).exists()

        if time_conflict:
            return Response({'error': 'The new time slot is already booked'}, status=400)

        # Update the booking
        existing_booking.date = new_date
        existing_booking.start_time = new_start_datetime
        existing_booking.save()

        # Prepare email context
        email_context = {
            'student_name': f"{request.user.first_name} {request.user.last_name}" if request.user.first_name else request.user.username,
            'student_email': request.user.email,
            'instructor_name': f"{slot.instructor.first_name} {slot.instructor.last_name}" if slot.instructor.first_name else slot.instructor.username,
            'course_name': slot.course_name,
            'old_booking_date': old_date_str,
            'old_booking_time': old_time_str,
            'new_booking_date': new_date_str,
            'new_booking_time': new_time_str,
            'duration': slot.duration_minutes,
            'room': slot.room,
            'frontend_url': frontend_url,
        }

        # Send update email to student
        try:
            mail_subject = 'Booking Update Confirmation - TA Connect'
            message = render_to_string('booking_update_email_Student.html', email_context)
            send_mail(mail_subject, message, 'taconnect.team@gmail.com', [request.user.email], html_message=message)
        except Exception as email_error:
            print(f"Failed to send update email to student: {str(email_error)}")

        # Send update notification to instructor
        try:
            mail_subject = 'Booking Update Notice - TA Connect'
            message = render_to_string('booking_update_email_TA.html', email_context)
            send_mail(mail_subject, message, 'taconnect.team@gmail.com', [slot.instructor.email], html_message=message)
        except Exception as email_error:
            print(f"Failed to send update email to instructor: {str(email_error)}")

        return Response({
            'success': True,
            'booking_id': existing_booking.id,
            'new_date': new_date_str,
            'new_time': new_time_str,
            'message': f"Successfully updated booking to {new_date_str} at {new_time_str}."
        }, status=200)

    except Exception as e:
        return Response({'error': f'An error occurred: {str(e)}'}, status=500)