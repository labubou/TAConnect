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
from student.serializers.update_book_serializer import UpdateBookingSerializer

#update booked slot

# Create your views here.
@swagger_auto_schema(
    method='PATCH',
    operation_description='Update an existing booking for an office hour slot. The new date must be today or in the future.',
    manual_parameters=[
        openapi.Parameter(
            'booking_id',
            openapi.IN_PATH,
            description='ID of the booking to update',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    request_body=update_booked_slot_request,
    responses={
        200: update_booked_slot_response,
        400: 'Invalid request, slot not active, or attempting to update to a past date/time',
        403: 'Student email not allowed to update this slot',
        404: 'Booking not found',
        500: 'Internal server error'
    }
)
@api_view(['PATCH'])
@permission_classes([IsStudent])
def update_slot(request, booking_id):
    try:
        existing_booking = get_object_or_404(
            Booking,
            id=booking_id,
            student=request.user,
            is_cancelled=False
        )

        serializer = UpdateBookingSerializer(
            data=request.data,
            context={'booking': existing_booking, 'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=400
            )

        # Update the booking through the serializer
        updated_booking = serializer.save(instance=existing_booking)
        
        slot = existing_booking.office_hour

        # Prepare email context
        email_context = {
            'student_name': f"{request.user.first_name} {request.user.last_name}" if request.user.first_name else request.user.username,
            'student_email': request.user.email,
            'instructor_name': f"{slot.instructor.first_name} {slot.instructor.last_name}" if slot.instructor.first_name else slot.instructor.username,
            'course_name': slot.course_name,
            'old_booking_date': str(serializer.validated_data['old_date']),
            'old_booking_time': str(serializer.validated_data['old_time']),
            'new_booking_date': str(serializer.validated_data['new_date']),
            'new_booking_time': str(serializer.validated_data['new_time']),
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
            'booking_id': updated_booking.id,
            'new_date': str(serializer.validated_data['new_date']),
            'new_time': str(serializer.validated_data['new_time']),
            'message': f"Successfully updated booking to {str(serializer.validated_data['new_date'])} at {str(serializer.validated_data['new_time'])}."
        }, status=200)

    except Exception as e:
        return Response({'error': f'An error occurred: {str(e)}'}, status=500)