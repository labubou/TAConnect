from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from instructor.models import OfficeHourSlot
from instructor.schemas.time_slot_schemas import (
    create_time_slot_swagger,
    update_time_slot_swagger,
    delete_time_slot_swagger
)
from accounts.permissions import IsInstructor
from instructor.serializers.time_slots_serializer import TimeSlotSerializer
from utils.error_formatter import format_serializer_errors
from student.utils.cancel_student_bookings import cancel_student_bookings
from student.models import Booking
import datetime

class TimeSlotCreateView(GenericAPIView):
    serializer_class = TimeSlotSerializer
    permission_classes = [IsInstructor]

    @swagger_auto_schema(**create_time_slot_swagger)
    def post(self, request):
        """Create a new time slot"""
        try:
            serializer = self.get_serializer(data=request.data, context={'request': request})
            if not serializer.is_valid():
                return Response(
                    format_serializer_errors(serializer.errors),
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            time_slot, time_slot_policy = serializer.save()

            return Response({
                'success': True, 
                'time_slot_id': time_slot.id,
                'message': 'Time slot created successfully'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Error in add_time_slot: {e}")
            return Response(
                {
                    'error': 'An unexpected error occurred while creating the time slot',
                    'message': 'Please try again or contact support if the problem persists.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
class TimeSlotDetailView(GenericAPIView):
    serializer_class = TimeSlotSerializer
    permission_classes = [IsInstructor]

    def _cancel_affected_bookings(self, time_slot, critical_fields_changed):
        """
        Identify and return bookings that should be cancelled based on which critical fields were changed.
        Returns a queryset of bookings to cancel.
        """
        if not critical_fields_changed:
            return Booking.objects.none()

        # Get all non-cancelled bookings for this slot
        bookings = Booking.objects.filter(office_hour=time_slot, is_cancelled=False)
        
        bookings_to_cancel = []

        # If day_of_week or duration_minutes changed, cancel all bookings
        if 'day_of_week' in critical_fields_changed or 'duration_minutes' in critical_fields_changed:
            return bookings
        else:
            # For other field changes, selectively cancel affected bookings
            for booking in bookings:
                should_cancel = False
                
                # Check if booking date is outside new date range
                if 'start_date' in critical_fields_changed or 'end_date' in critical_fields_changed:
                    if booking.date < time_slot.start_date or booking.date > time_slot.end_date:
                        should_cancel = True
                
                # Check if booking time is outside new time range
                if 'start_time' in critical_fields_changed or 'end_time' in critical_fields_changed:
                    booking_time = booking.start_time.time() if isinstance(booking.start_time, datetime.datetime) else booking.start_time
                    booking_end_time = booking.end_time.time() if isinstance(booking.end_time, datetime.datetime) else booking.end_time
                    
                    # Cancel if booking starts before new start_time or ends after new end_time
                    if booking_time < time_slot.start_time or booking_end_time > time_slot.end_time:
                        should_cancel = True
                
                if should_cancel:
                    bookings_to_cancel.append(booking.id)
        
        # Return queryset of affected bookings
        if bookings_to_cancel:
            return Booking.objects.filter(id__in=bookings_to_cancel)
        return Booking.objects.none()

    @swagger_auto_schema(**update_time_slot_swagger)
    def patch(self, request, slot_id):
        """Update an existing time slot"""
        user = request.user

        if not slot_id:
            return Response(
                {
                    'error': 'Slot ID is required.',
                    'message': 'Please provide a valid slot ID to update.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        time_slot = get_object_or_404(OfficeHourSlot, id=slot_id, instructor=user)
        serializer = self.get_serializer(instance=time_slot, data=request.data)

        if not serializer.is_valid():
            return Response(
                    format_serializer_errors(serializer.errors),
                    status=status.HTTP_400_BAD_REQUEST
                )

        updated_slot = serializer.save()

        # Cancel affected bookings based on which critical fields were changed
        critical_fields_changed = getattr(updated_slot, 'critical_fields_changed', [])
        if critical_fields_changed:
            try:
                affected_bookings = self._cancel_affected_bookings(updated_slot, critical_fields_changed)
                if affected_bookings.exists():
                    cancel_student_bookings(updated_slot, bookings=affected_bookings)
            except Exception as e:
                print(f"Error cancelling affected bookings for slot {slot_id}: {e}")
        
        return Response({
            'success': True, 
            'time_slot_id': updated_slot.id, 
            'message': 'Time slot updated successfully.'
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(**delete_time_slot_swagger)
    def delete(self, request, slot_id):
        """Delete an existing time slot"""
        user = request.user
        
        if not slot_id:
            return Response(
                {
                    'error': 'Slot ID is required.',
                    'message': 'Please provide a valid slot ID to delete.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        time_slot = get_object_or_404(OfficeHourSlot, id=slot_id, instructor=user)

        try:
            cancel_student_bookings(time_slot)
            time_slot.delete()
        except Exception as e:
            print(f"Error deleting time slot {slot_id}: {e}")
            return Response(
                {
                    'error': 'Failed to delete time slot',
                    'message': 'An error occurred while deleting the time slot. Please try again.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            'success': True, 
            'time_slot_id': slot_id,
            'message': 'Time slot deleted successfully'
        }, status=status.HTTP_200_OK)
