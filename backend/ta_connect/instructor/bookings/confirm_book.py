from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from student.models import Booking
from utils.email_sending.booking.send_booking_confirmation import send_booking_confirmation_email
from utils.push_notifications import send_booking_confirmed_push
from student.serializers.confirm_book_serializer import ConfirmBookingSerializer
from accounts.permissions import IsInstructor
from instructor.schemas.confirm_booking_schemas import confirm_booking_instructor_swagger
from utils.error_formatter import format_serializer_errors

class InstructorConfirmBookingView(GenericAPIView):
    """
    Confirm a student's booking as an instructor.
    Sends email notification to the student.
    """
    queryset = Booking.objects.all()
    permission_classes = [IsInstructor]
    serializer_class = ConfirmBookingSerializer
    lookup_field = 'pk'

    @swagger_auto_schema(**confirm_booking_instructor_swagger)
    def post(self, request, pk):
        """
        Confirm a pending booking.
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
        
        # Validate and confirm the booking
        serializer = self.get_serializer(
            instance=booking,
            data={'status': 'confirmed'},
            partial=True,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response(
                format_serializer_errors(serializer.errors),
                status=status.HTTP_400_BAD_REQUEST
            )

        confirmed_booking = serializer.save()

        # Send email notification to the student and the instructor
        try:
            send_booking_confirmation_email(
                student=booking.student,
                instructor=request.user,
                slot=booking.office_hour,
                booking_date=booking.date,
                booking_time=booking.start_time
            )
        except Exception as e:
            # Log error but don't fail the confirmation
            print(f"Failed to send confirmation email: {e}")

        # Send push notification to the student
        try:
            send_booking_confirmed_push(
                student=booking.student,
                instructor=request.user,
                slot=booking.office_hour,
                booking_date=booking.date,
                booking_time=booking.start_time,
                booking_id=booking.id
            )
        except Exception as e:
            print(f"Failed to send confirmation push notification: {e}")

        return Response({
            'success': True,
            'booking_id': confirmed_booking.id,
            'message': 'Booking confirmed successfully.'
        }, status=status.HTTP_200_OK)
