from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from rest_framework import serializers
from instructor.models import OfficeHourSlot
from instructor.schemas.allowed_students_schemas import update_allowed_students_status_swagger
from accounts.permissions import IsInstructor

# Simple serializer for Swagger schema generation
class AllowedStudentsStatusSerializer(serializers.Serializer):
    """Serializer for allowed students status toggle - used for Swagger docs only"""
    pass

class UpdateAllowedStudentsStatusView(GenericAPIView):
    permission_classes = [IsInstructor]
    serializer_class = AllowedStudentsStatusSerializer

    @swagger_auto_schema(**update_allowed_students_status_swagger)
    def patch(self, request, slot_id):
        """Toggle email requirement status for allowed students"""
        user = request.user

        if not slot_id:
            return Response(
                {'error': 'Slot ID is required.'},
                status=status.HTTP_400_BAD_REQUEST)

        slot = get_object_or_404(OfficeHourSlot, id=slot_id, instructor=user)

        try:  # making a try and except to handle database errors       
            slot.policy.require_specific_email = not slot.policy.require_specific_email
            slot.policy.save()
        except Exception as e:
            return Response({'error': f'Failed to update time slot'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'success': True, 'time_slot_id': slot.id}, status=status.HTTP_200_OK)

