from datetime import datetime, date
from calendar import monthrange
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from student.utils.complete_book import complete_booking
from student.models import Booking
from student.sendBookingEmail import send_booking_cancelled_email,send_booking_update_email, send_booking_pending_email
from utils.push_notifications.booking.send_booking_cancelled import send_booking_cancelled_push
from utils.push_notifications.booking.send_booking_pending import send_booking_pending_push
from utils.google_calendar import remove_booking_from_calendars
from instructor.models import OfficeHourSlot
from accounts.permissions import IsStudent
from student.serializers.create_book_serializer import CreateBookingSerializer
from student.serializers.update_book_serializer import UpdateBookingSerializer
from student.serializers.cancel_book_serializer import CancelBookingSerializer
from student.serializers.available_times_serializer import AvailableTimesSerializer
from student.utils.calculate_available_times import get_available_times
from utils.error_formatter import format_serializer_errors
from student.schemas.booking_schemas import (
    create_booking_swagger,
    update_booking_swagger,
    cancel_booking_swagger,
    available_times_swagger,
    get_bookings_swagger
)

class BookingCreateView(GenericAPIView):
    queryset = Booking.objects.all()
    permission_classes = [IsStudent]
    serializer_class = CreateBookingSerializer

    @swagger_auto_schema(**get_bookings_swagger)
    def get(self, request):
        """Get all bookings for the current student"""
        try:
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')

            if date_from == None or date_to == None:
                today = timezone.now().date()
                # First day of current month
                date_from = today.replace(day=1)
                # Last day of current month
                last_day = monthrange(today.year, today.month)[1]
                date_to = today.replace(day=last_day)
            else:
                # Convert ISO string to date object
                date_from = date.fromisoformat(date_from)
                date_to = date.fromisoformat(date_to)

            bookings = Booking.objects.filter(student=request.user, date__range=[date_from, date_to]).order_by('-date', '-start_time')

            for booking in bookings:
                if not booking.is_completed:
                    success, message = complete_booking(booking)

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
                        'book_description': booking.book_description,
                        'is_cancelled': booking.is_cancelled,
                        'is_completed': booking.is_completed,
                        'status': booking.status,
                        'office_hour': {
                            'id': booking.office_hour.id,
                            'start_date': booking.office_hour.start_date,
                            'end_date': booking.office_hour.end_date,
                            'day_of_week': booking.office_hour.day_of_week,
                        }
                    } for booking in bookings
                ]
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error fetching bookings: {e}")
            return Response({'error': "something went wrong!"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                    format_serializer_errors(serializer.errors),
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            booking = serializer.save()

            # Send booking pending emails
            send_booking_pending_email(
                student=request.user,
                instructor=slot.instructor,
                slot=slot,
                booking_date=serializer.validated_data['date'],
                booking_time=serializer.validated_data['start_time'],
                booking_id=booking.id
            )

            # Send push notifications
            try:
                send_booking_pending_push(
                    student=request.user,
                    instructor=slot.instructor,
                    slot=slot,
                    booking_date=serializer.validated_data['date'],
                    booking_time=serializer.validated_data['start_time'],
                    booking_id=booking.id
                )
            except Exception as e:
                # Log but don't fail the booking
                print(f"Failed to send push notification: {e}")

            return Response({
                'slot_id': slot.id,
                'booking_id': booking.id,
                'date': serializer.validated_data['date'],
                'start_time': serializer.validated_data['start_time'],
                'book_description': booking.book_description,
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

        #!these old values before update are not used currently but may be useful in the future
        old_date = booking.date
        old_time = booking.start_time

        serializer = self.get_serializer(instance=booking, data=request.data, context={'request': request})

        if not serializer.is_valid():
            return Response(format_serializer_errors(serializer.errors), status=status.HTTP_400_BAD_REQUEST)

        updated_booking = serializer.save()

        #send email notifications
        send_booking_pending_email(
            student=request.user,
            instructor=booking.office_hour.instructor,
            slot=booking.office_hour,
            booking_date=updated_booking.date,
            booking_time=updated_booking.start_time,
            booking_id=updated_booking.id
        )

        # Send push notifications
        try:
            send_booking_pending_push(
                student=request.user,
                instructor=booking.office_hour.instructor,
                slot=booking.office_hour,
                booking_date=updated_booking.date,
                booking_time=updated_booking.start_time,
                booking_id=updated_booking.id
            )
        except Exception as e:
            print(f"Failed to send push notification: {e}")
        
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

        # Remove calendar events before cancellation
        try:
            student_deleted, instructor_deleted = remove_booking_from_calendars(booking)
            if student_deleted or instructor_deleted:
                print(f"Calendar events removed - Student: {student_deleted}, Instructor: {instructor_deleted}")
        except Exception as e:
            # Log error but don't fail the cancellation
            print(f"Failed to remove calendar events: {e}")

        serializer = self.get_serializer(
            instance=booking, 
            data={'is_cancelled': True}, 
            partial=True, 
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(format_serializer_errors(serializer.errors), status=status.HTTP_400_BAD_REQUEST)

        cancelled_booking = serializer.save()

        #send email notifications
        send_booking_cancelled_email(
            student=request.user,
            instructor=booking.office_hour.instructor,
            slot=booking.office_hour,
            booking_date=booking.date,
            booking_time=booking.start_time
        )

        # Send push notifications (cancelled by student)
        try:
            send_booking_cancelled_push(
                student=request.user,
                instructor=booking.office_hour.instructor,
                slot=booking.office_hour,
                booking_date=booking.date,
                booking_time=booking.start_time,
                booking_id=booking.id,
                cancelled_by='student'
            )
        except Exception as e:
            print(f"Failed to send push notification: {e}")

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
            # Fix: use timezone.now() for timezone-aware datetime
            today = timezone.now().date()

            if not slot:
                return Response({'error': 'Slot not found'}, status=404)
            
            # Use query_params for GET requests
            serializer = self.get_serializer(data=request.query_params, context={'request': request, 'slot': slot, 'today': today})

            if not serializer.is_valid():
                return Response(
                    format_serializer_errors(serializer.errors),
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
            return Response({'error': 'An error occurred'}, status=500)

