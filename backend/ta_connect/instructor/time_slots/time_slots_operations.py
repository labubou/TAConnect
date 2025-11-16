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

class TimeSlotView(GenericAPIView):
    serializer_class = TimeSlotSerializer
    permission_classes = [IsInstructor]

    @swagger_auto_schema(**create_time_slot_swagger)
    def post(self, request, slot_id=None):
        try:
            serializer = self.get_serializer(data=request.data, context={'request': request})
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            time_slot, time_slot_policy = serializer.save()

            return Response({'success': True, 'time_slot_id': time_slot.id}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Error in add_time_slot: {e}")
            return Response(
                {'error': 'An error occurred while creating the time slot'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @swagger_auto_schema(**update_time_slot_swagger)
    def patch(self, request, slot_id):
        """Handle update time slot for the logged-in user."""
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
        """Handle delete time slot for the logged-in user."""
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
