from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema

from student.models import Booking
from instructor.models import OfficeHourSlot
from accounts.permissions import IsStudent
from student.serializers.book_serializer import UnifiedBookingSerializer

# Define frontend_url (ensure this is in your settings.py or define it here)
from ta_connect.settings import frontend_url 

class BookingView(GenericAPIView):
    serializer_class = UnifiedBookingSerializer
    permission_classes = [IsStudent]

    def post(self, request):
        """Book a new reservation"""
        try:
            # 1. Get the slot ID from the request data
            slot_id = request.data.get('slot_id')
            if not slot_id:
                return Response({'error': 'slot_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            # 2. Retrieve the slot object
            slot = get_object_or_404(OfficeHourSlot, id=slot_id)
            
            # 3. Initialize serializer with data AND slot context
            serializer = self.get_serializer(data=request.data, context={'request': request, 'slot': slot})
            
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 4. Save the booking
            booking = serializer.save()

            # 5. Prepare email context data
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

            # 6. Send emails
            try:
                mail_subject = 'Booking Confirmation - TA Connect'
                message = render_to_string('booking_confirmation_email_Student.html', email_context)
                send_mail(mail_subject, message, 'taconnect.team@gmail.com', [request.user.email], html_message=message)
            except Exception as email_error:
                print(f"Failed to send booking confirmation email to student: {str(email_error)}")

            try:
                mail_subject = 'New Booking Received - TA Connect'
                message = render_to_string('booking_confirmation_email_TA.html', email_context)
                send_mail(mail_subject, message, 'taconnect.team@gmail.com', [slot.instructor.email], html_message=message)
            except Exception as email_error:
                print(f"Failed to send booking confirmation email to TA: {str(email_error)}")

            return Response({
                'slot_id': slot.id,
                'booking_id': booking.id,
                'date': serializer.validated_data['selected_date_str'],
                'start_time': serializer.validated_data['start_time_str'],
                'message': f"Successfully booked slot {slot.id} on {serializer.validated_data['selected_date_str']} at {serializer.validated_data['start_time_str']}."
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            print(f"Error in booking: {e}")
            return Response(
                {'error': 'An error occurred while creating the booking'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, pk):
        """
        Update an existing booking.
        'pk' here refers to the Booking ID, not the Slot ID.
        """
        if not pk:
            return Response({'error': 'Booking ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure the booking belongs to the requesting student
        booking = get_object_or_404(Booking, id=pk, student=request.user)

        # Initialize serializer with instance (triggers update logic in UnifiedBookingSerializer)
        serializer = self.get_serializer(instance=booking, data=request.data, context={'request': request})

        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        updated_booking = serializer.save()
        
        return Response({
            'success': True, 
            'booking_id': updated_booking.id, 
            'message': 'Booking updated successfully.'
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        """
        Cancel an existing booking.
        'pk' here refers to the Booking ID.
        """
        if not pk:
            return Response({'error': 'Booking ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        booking = get_object_or_404(Booking, id=pk, student=request.user)

        # Pass is_cancel=True to trigger cancellation logic in the serializer
        serializer = self.get_serializer(
            instance=booking, 
            data={'is_cancel': True}, 
            partial=True, 
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)