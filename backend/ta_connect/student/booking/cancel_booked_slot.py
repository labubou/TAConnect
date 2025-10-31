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
from student.schemas.booking_schemas import cancel_booked_slot_request, cancel_booked_slot_response


@swagger_auto_schema(
    method='delete',
    operation_description='Cancel an existing booking for an office hour slot.',
    manual_parameters=[
        openapi.Parameter(
            'slot_id',
            openapi.IN_PATH,
            description='ID of the office hour slot',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    request_body=cancel_booked_slot_request,
    responses={
        200: cancel_booked_slot_response,
        400: 'Invalid request or booking already cancelled',
        404: 'Booking not found',
        500: 'Internal server error'
    }
)
@api_view(['DELETE'])
@permission_classes([IsStudent])
def cancel_slot(request, slot_id):
    try:
        date_str = request.data.get("date")
        start_time_str = request.data.get("time")

        if not date_str or not start_time_str:
            return Response({'error': 'Date and time are required'}, status=400)

        # Check the format of the date and time
        try:
            selected_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
            selected_time = datetime.datetime.strptime(start_time_str, '%H:%M').time()
            start_datetime = datetime.datetime.combine(selected_date, selected_time)
        except ValueError:
            return Response({'error': 'Invalid date/time format. Use YYYY-MM-DD for date and HH:MM for time'}, status=400)

        # Find the specific booking
        booking = get_object_or_404(
            Booking,
            office_hour_id=slot_id,
            student=request.user,
            date=selected_date,
            start_time=start_datetime,
            is_cancelled=False
        )

        # Cancel the booking
        booking.is_cancelled = True
        booking.save()

        # Prepare email context
        email_context = {
            'student_name': f"{request.user.first_name} {request.user.last_name}" if request.user.first_name else request.user.username,
            'student_email': request.user.email,
            'instructor_name': f"{booking.office_hour.instructor.first_name} {booking.office_hour.instructor.last_name}" if booking.office_hour.instructor.first_name else booking.office_hour.instructor.username,
            'course_name': booking.office_hour.course_name,
            'booking_date': selected_date.strftime('%B %d, %Y'),
            'booking_time': start_time_str,
            'room': booking.office_hour.room,
            'frontend_url': frontend_url,
        }

        # Send cancellation email to student
        try:
            mail_subject = 'Booking Cancellation Confirmation - TA Connect'
            message = render_to_string('booking_cancellation_email_Student.html', email_context)
            send_mail(mail_subject, message, 'taconnect.team@gmail.com', [request.user.email], html_message=message)
        except Exception as email_error:
            print(f"Failed to send cancellation email to student: {str(email_error)}")

        # Send cancellation notification to instructor
        try:
            mail_subject = 'Booking Cancellation Notice - TA Connect'
            message = render_to_string('booking_cancellation_email_TA.html', email_context)
            send_mail(mail_subject, message, 'taconnect.team@gmail.com', [booking.office_hour.instructor.email], html_message=message)
        except Exception as email_error:
            print(f"Failed to send cancellation email to instructor: {str(email_error)}")

        return Response({
            'success': True,
            'message': f"Successfully cancelled booking for {booking.office_hour.course_name} on {date_str} at {start_time_str}."
        }, status=200)

    except Exception as e:
        return Response({'error': f'An error occurred: {str(e)}'}, status=500)