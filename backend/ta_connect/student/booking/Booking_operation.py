from datetime import datetime
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema

from student.models import Booking
from student.sendBookingEmail import send_booking_confirmation_email, send_booking_cancelled_email
from instructor.models import OfficeHourSlot
from accounts.permissions import IsStudent
from student.serializers.create_book_serializer import CreateBookingSerializer
from student.serializers.update_book_serializer import UpdateBookingSerializer
from student.serializers.cancel_book_serializer import CancelBookingSerializer
from student.serializers.available_times_serializer import AvailableTimesSerializer
from student.utils.calculate_available_times import get_available_times
from student.schemas.booking_schemas import (
    create_booking_swagger,
    update_booking_swagger,
    cancel_booking_swagger,
    available_times_swagger
)

class BookingCreateView(GenericAPIView):
    queryset = Booking.objects.all()
    permission_classes = [IsStudent]
    serializer_class = CreateBookingSerializer

    @swagger_auto_schema(
        operation_description="Get all bookings for the current student",
        responses={200: "List of bookings"}
    )
    def get(self, request):
        """Get all bookings for the current student"""
        try:
            bookings = Booking.objects.filter(student=request.user).order_by('-date', '-start_time')
            
            return Response({
                'bookings': [
                    {
                        'id': booking.id,
                        'instructor': {
                            'id': booking.office_hour.instructor.id,
                            'full_name': booking.office_hour.instructor.full_name,
                            'email': booking.office_hour.instructor.email,
                        },
                        'course_name': booking.office_hour.course_name,
                        'section': booking.office_hour.section,
                        'room': booking.office_hour.room,
                        'date': booking.date,
                        'start_time': booking.start_time,
                        'end_time': booking.end_time,
                        'is_cancelled': booking.is_cancelled,
                    } for booking in bookings
                ]
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(**create_booking_swagger)
    def post(self, request):
        """Book a new reservation"""
        try:
            slot_id = request.data.get('slot_id')
            if not slot_id:
                return Response({'error': 'slot_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            slot = get_object_or_404(OfficeHourSlot, id=slot_id)
            
            serializer = self.get_serializer(data=request.data, context={'request': request, 'slot': slot})
            
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            booking = serializer.save()

            # Send emails using utility function
            send_booking_confirmation_email(
                student=request.user,
                instructor=slot.instructor,
                slot=slot,
                booking_date=serializer.validated_data['date'],
                booking_time=serializer.validated_data['start_time']
            )

            return Response({
                'slot_id': slot.id,
                'booking_id': booking.id,
                'date': serializer.validated_data['date'],
                'start_time': serializer.validated_data['start_time'],
                'message': f"Successfully booked slot {slot.id} on {serializer.validated_data['date']} at {serializer.validated_data['start_time']}."
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            print(f"Error in booking: {e}")
            return Response(
                {'error': 'An error occurred while creating the booking'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BookingDetailView(GenericAPIView):
    queryset = Booking.objects.all()
    permission_classes = [IsStudent]
    pagination_class = None  # Disable pagination to remove 'page' param from Swagger
    lookup_field = 'pk'

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return UpdateBookingSerializer
        if self.request.method == 'DELETE':
            return CancelBookingSerializer
        if self.request.method == 'GET':
            return AvailableTimesSerializer
        return super().get_serializer_class()

    @swagger_auto_schema(**update_booking_swagger)
    def patch(self, request, pk):
        """
        Update an existing booking.
        'pk' here refers to the Booking ID.
        """
        if not pk:
            return Response({'error': 'Booking ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        booking = get_object_or_404(Booking, id=pk, student=request.user)

        serializer = self.get_serializer(instance=booking, data=request.data, context={'request': request})

        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        updated_booking = serializer.save()
        
        return Response({
            'success': True, 
            'booking_id': updated_booking.id, 
            'message': 'Booking updated successfully.'
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(**cancel_booking_swagger)
    def delete(self, request, pk):
        """
        Cancel an existing booking.
        'pk' here refers to the Booking ID.
        """
        if not pk:
            return Response({'error': 'Booking ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        booking = get_object_or_404(Booking, id=pk, student=request.user)

        serializer = self.get_serializer(
            instance=booking, 
            data={'is_cancel': True}, 
            partial=True, 
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        cancelled_booking = serializer.save()

        # Send cancellation emails using utility function
        send_booking_cancelled_email(
            student=request.user,
            instructor=booking.office_hour.instructor,
            slot=booking.office_hour,
            booking_date=booking.date,
            booking_time=booking.start_time
        )

        return Response({
            'success': True,
            'booking_id': cancelled_booking.id,
            'message': 'Booking cancelled successfully.'
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(**available_times_swagger)
    def get(self, request, pk):
        '''
        Get available times for a specific office hour slot with a date input
        'pk' here refers to the OfficeHourSlot ID.
        '''
        try:
            if not pk:
                return Response({'error': 'Slot ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
            slot = OfficeHourSlot.objects.filter(id=pk).first()
            # Fix: datetime is imported as the class, so use now().date()
            today = datetime.now().date()

            if not slot:
                return Response({'error': 'Slot not found'}, status=404)
            
            # Use query_params for GET requests
            serializer = self.get_serializer(data=request.query_params, context={'request': request, 'slot': slot, 'today': today})

            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Use utility function to get available times
            selected_date = serializer.validated_data.get('date')
            available_times = get_available_times(slot, selected_date)

            return Response({
                'slot_id': slot.id,
                'date': selected_date,
                'available_times': available_times
            }, status=200)
        
        except Exception as e:
            return Response({'error': f'An error occurred {str(e)}'}, status=500)