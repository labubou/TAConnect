from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from student.models import Booking
from student.sendBookingEmail import send_booking_cancelled_email #the same email function used in student cancel booking
from student.serializers.cancel_book_serializer import CancelBookingSerializer #the same serializer used in student cancel booking
from accounts.permissions import IsInstructor
from instructor.schemas.cancel_booking_schemas import cancel_booking_instructor_swagger
from utils.error_formatter import format_serializer_errors
from utils.push_notifications.booking.send_booking_cancelled import send_booking_cancelled_push
from utils.google_calendar import remove_booking_from_calendars

class InstructorCancelBookingView(GenericAPIView):
    """
    Cancel a student's booking as an instructor.
    Sends email notification to the student.
    Removes calendar events from both student's and instructor's Google Calendars.
    """
    queryset = Booking.objects.all()
    permission_classes = [IsInstructor]
    serializer_class = CancelBookingSerializer
    lookup_field = 'pk'

    @swagger_auto_schema(**cancel_booking_instructor_swagger)
    def delete(self, request, pk):
        """
        Cancel an existing booking.
        'pk' here refers to the Booking ID.
        """
        if not pk:
            return Response(
                {'error': 'Booking ID is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get booking and verify it belongs to this instructor's slot
        booking = get_object_or_404(
            Booking,
            id=pk,
            office_hour__instructor=request.user
        )

        # Check if already cancelled
        if booking.is_cancelled:
            return Response(
                {'error': 'Booking is already cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already completed
        if booking.is_completed:
            return Response(
                {'error': 'Booking is already completed and cannot be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Remove calendar events before cancellation
        try:
            student_deleted, instructor_deleted = remove_booking_from_calendars(booking)
            if student_deleted or instructor_deleted:
                print(f"Calendar events removed - Student: {student_deleted}, Instructor: {instructor_deleted}")
        except Exception as e:
            # Log error but don't fail the cancellation
            print(f"Failed to remove calendar events: {e}")

        # Validate and cancel the booking
        serializer = self.get_serializer(
            instance=booking,
            data={'is_cancelled': True},
            partial=True,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response(
                format_serializer_errors(serializer.errors),
                status=status.HTTP_400_BAD_REQUEST
            )

        cancelled_booking = serializer.save()

        # Send email notification to the student and the instructor
        try:
            send_booking_cancelled_email(
                student=booking.student,
                instructor=request.user,
                slot=booking.office_hour,
                booking_date=booking.date,
                booking_time=booking.start_time
            )
        except Exception as e:
            # Log error but don't fail the cancellation
            print(f"Failed to send cancellation email: {e}")

        # Send push notification (cancelled by instructor)
        try:
            send_booking_cancelled_push(
                student=booking.student,
                instructor=request.user,
                slot=booking.office_hour,
                booking_date=booking.date,
                booking_time=booking.start_time,
                booking_id=booking.id,
                cancelled_by='instructor'
            )
        except Exception as e:
            # Log error but don't fail the cancellation
            print(f"Failed to send cancellation push notification: {e}")

        return Response({
            'success': True,
            'booking_id': cancelled_booking.id,
            'message': 'Booking cancelled successfully.'
        }, status=status.HTTP_200_OK)
