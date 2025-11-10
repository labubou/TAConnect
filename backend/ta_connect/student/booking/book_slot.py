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
from student.schemas.booking_schemas import book_slot_request, book_slot_response
from student.serializers.book_serializer import BookSerializer

# Create your views here.
@swagger_auto_schema(
    method='post',
    operation_description='Book an office hour slot for a specific date and time.',
    manual_parameters=[
        openapi.Parameter(
            'slot_id',
            openapi.IN_PATH,
            description='ID of the office hour slot',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    request_body=book_slot_request,
    responses={
        200: book_slot_response,
        400: 'Invalid request or slot not active',
        403: 'Student email not allowed to book this slot or booking limit reached',
        404: 'Slot not found',
        500: 'Internal server error'
    }
)
@api_view(['POST'])
@permission_classes([IsStudent])
def book_slot(request, slot_id):
    try:

        slot = OfficeHourSlot.objects.filter(id=slot_id).first()

        if not slot:
            return Response({'error': 'Slot not found'}, status=404)
        
        serializer = BookSerializer(data=request.data, context={'request': request, 'slot': slot})
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=400
            )

        # Create the booking through the serializer
        booking = serializer.save()
            
        # Prepare email context data
        email_context = {
            'student_name': f"{request.user.first_name} {request.user.last_name}" if request.user.first_name else request.user.username,
            'student_email': request.user.email,
            'instructor_name': f"{slot.instructor.first_name} {slot.instructor.last_name}" if slot.instructor.first_name else slot.instructor.username,
            'course_name': slot.course_name if slot.course_name else 'N/A',
            'booking_date': serializer.validated_data['selected_date_str'].strftime('%B %d, %Y'),
            'booking_time': serializer.validated_data['start_time_str'].strftime('%I:%M %p'),
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
            'date': serializer.validated_data['selected_date_str'],
            'start_time': serializer.validated_data['start_time_str'],
            'message' : f"Successfully booked slot {slot.id} on {serializer.validated_data['selected_date_str']} at {serializer.validated_data['start_time_str']}."
        }, status=200)
    
    except Exception as e:
        return Response({'error': f'An error occurred {str(e)}'}, status=500)