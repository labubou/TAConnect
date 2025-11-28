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
