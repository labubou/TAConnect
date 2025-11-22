from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from student.models import Booking
from student.sendBookingEmail import send_booking_confirmation_email, send_booking_cancelled_email
from instructor.models import OfficeHourSlot
from accounts.permissions import IsStudent
from student.serializers.book_serializer import UnifiedBookingSerializer
from student.serializers.booking_schemas import (
    create_booking_response,
    update_booking_response,
    cancel_booking_response,
    error_response_400,
    error_response_404,
    error_response_500
)

class BookingView(GenericAPIView):
    serializer_class = UnifiedBookingSerializer
    permission_classes = [IsStudent]
    queryset = Booking.objects.all()

    @swagger_auto_schema(
        operation_description='Create a new booking for a given office hour slot.',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='OfficeHourSlot ID', example=1),
                'date_str': openapi.Schema(type=openapi.TYPE_STRING, description='Booking date in YYYY-MM-DD format', example='2025-12-01'),
                'start_time_str': openapi.Schema(type=openapi.TYPE_STRING, description='Start time in HH:MM format', example='14:30'),
            },
            required=['slot_id', 'date_str', 'start_time_str']
        ),
        responses={
            201: create_booking_response,
            400: error_response_400,
            500: error_response_500
        }
    )
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
            email_result = send_booking_confirmation_email(
                student=request.user,
                instructor=slot.instructor,
                slot=slot,
                booking_date=serializer.validated_data['selected_date_str'],
                booking_time=serializer.validated_data['start_time_str']
            )

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

    @swagger_auto_schema(
        operation_description="Update an existing booking's date and time.",
        manual_parameters=[
            openapi.Parameter('pk', openapi.IN_PATH, description='Booking ID', type=openapi.TYPE_INTEGER, required=True)
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'new_date': openapi.Schema(type=openapi.TYPE_STRING, description='New date in YYYY-MM-DD format', example='2025-12-02'),
                'new_time': openapi.Schema(type=openapi.TYPE_STRING, description='New time in HH:MM format', example='15:00'),
            },
            required=['new_date', 'new_time']
        ),
        responses={
            200: update_booking_response,
            400: error_response_400,
            404: error_response_404,
            500: error_response_500
        }
    )
    def patch(self, request, pk):
        """
        Update an existing booking.
        'pk' here refers to the Booking ID, not the Slot ID.
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

    @swagger_auto_schema(
        operation_description='Cancel an existing booking.',
        manual_parameters=[
            openapi.Parameter('pk', openapi.IN_PATH, description='Booking ID', type=openapi.TYPE_INTEGER, required=True)
        ],
        responses={
            200: cancel_booking_response,
            400: error_response_400,
            404: error_response_404,
            500: error_response_500
        }
    )
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
        email_result = send_booking_cancelled_email(
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