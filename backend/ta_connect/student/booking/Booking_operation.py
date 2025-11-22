from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from student.models import Booking
'''
from instructor.schemas.time_slot_schemas import (
    create_time_slot_swagger,
    update_time_slot_swagger,
    delete_time_slot_swagger
)
'''
from accounts.permissions import IsStudent
class BookingView(GenericAPIView):
    serializer_class = TimeSlotSerializer
    permission_classes = [IsStudent]

    # @swagger_auto_schema(**create_time_slot_swagger)
    def post(self, request):
        """Book a new reservation """
        try:
            serializer = self.get_serializer(data=request.data, context={'request': request})
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            book_time = serializer.save()

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
            print(f"Error in add_time_slot: {e}")
            return Response(
                {'error': 'An error occurred while creating the time slot'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
# @swagger_auto_schema(**update_time_slot_swagger)
    def patch(self, request, slot_id):
        """Update an existing time slot"""
        user = request.user

        if not slot_id:
            return Response(
                {'error': 'Slot ID is required.'},
                status=status.HTTP_400_BAD_REQUEST)

        time_slot = get_object_or_404(OfficeHourSlot, id=slot_id, instructor=user)

        serializer = self.get_serializer(instance=time_slot, data=request.data)

        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        updated_slot = serializer.save()
        return Response({'success': True, 'time_slot_id': updated_slot.id, 'message': 'Time slot updated successfully.'}, status=status.HTTP_200_OK)

@swagger_auto_schema(**delete_time_slot_swagger)
def delete(self, request, slot_id):
    """Delete an existing time slot"""
    user = request.user
    
    if not slot_id:
        return Response(
            {'error': 'Slot ID is required.'},
            status=status.HTTP_400_BAD_REQUEST)

    time_slot = get_object_or_404(OfficeHourSlot, id=slot_id, instructor=user)

    try:
        time_slot.delete()
    except Exception as e:
        return Response({'error': 'Failed to delete time slot'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'success': True, 'time_slot_id': time_slot.id}, status=status.HTTP_200_OK)


