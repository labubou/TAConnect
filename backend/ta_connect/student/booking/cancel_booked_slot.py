from django.shortcuts import render, get_object_or_404
from accounts.permissions import IsStudent, IsInstructor
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from instructor.models import OfficeHourSlot, BookingPolicy
from student.models import Booking
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.core.mail import send_mail
from django.template.loader import render_to_string
from ta_connect.settings import frontend_url
from student.schemas.booking_schemas import cancel_booked_slot_request, cancel_booked_slot_response
from student.serializers.cancel_book_serializer import CancelBookingSerializer


@swagger_auto_schema(
    method='PATCH',
    operation_description='Cancel an existing booking for an office hour slot. Cannot cancel bookings for past dates or times.',
    manual_parameters=[
        openapi.Parameter(
            'booking_id',
            openapi.IN_PATH,
            description='ID of the booking to cancel',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    request_body=cancel_booked_slot_request,
    responses={
        200: cancel_booked_slot_response,
        400: 'Invalid request, booking already cancelled, or attempting to cancel a past booking',
        404: 'Booking not found',
        500: 'Internal server error'
    }
)
@api_view(['PATCH'])
@permission_classes([IsStudent])
def cancel_slot(request, booking_id):
    try:
        # Find the specific booking
        booking = get_object_or_404(
            Booking,
            id=booking_id,
            student=request.user,
            is_cancelled=False
        )

        serializer = CancelBookingSerializer(
            data={},
            context={'booking': booking, 'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=400
            )

        # Cancel the booking through the serializer
        cancelled_booking = serializer.save(instance=booking)

        # Prepare email context
        email_context = {
            'student_name': f"{request.user.first_name} {request.user.last_name}" if request.user.first_name else request.user.username,
            'student_email': request.user.email,
            'instructor_name': f"{serializer.validated_data['instructor'].first_name} {serializer.validated_data['instructor'].last_name}" if serializer.validated_data['instructor'].first_name else serializer.validated_data['instructor'].username,
            'course_name': serializer.validated_data['course_name'],
            'booking_date': serializer.validated_data['booking_date'].strftime('%B %d, %Y'),
            'booking_time': serializer.validated_data['booking_time'].strftime('%I:%M %p'),
            'room': serializer.validated_data['room'],
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
            send_mail(mail_subject, message, 'taconnect.team@gmail.com', [serializer.validated_data['instructor'].email], html_message=message)
        except Exception as email_error:
            print(f"Failed to send cancellation email to instructor: {str(email_error)}")

        return Response({
            'success': True,
            'message': f"Successfully cancelled booking for {serializer.validated_data['course_name']} on {serializer.validated_data['booking_date'].strftime('%B %d, %Y')} at {serializer.validated_data['booking_time'].strftime('%I:%M %p')}."
        }, status=200)

    except Exception as e:
        return Response({'error': f'An error occurred: {str(e)}'}, status=500)