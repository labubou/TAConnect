from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from instructor.models import AllowedStudents, OfficeHourSlot
from instructor.schemas.allowed_students_schemas import (
    add_allowed_student_swagger,
    get_allowed_students_swagger,
    update_allowed_student_swagger,
    delete_allowed_student_swagger
)
from accounts.permissions import IsInstructor
from instructor.serializers.allowed_students_serializer import AllowedStudentsSerializer

class AllowedStudentsAddGetView(GenericAPIView):
    serializer_class = AllowedStudentsSerializer
    permission_classes = [IsInstructor]

    @swagger_auto_schema(**add_allowed_student_swagger)
    def post(self, request, slot_id):
        """Add allowed students"""
        try:
            if not slot_id:
                return Response(
                    {'error': 'Slot ID is required.'},
                    status=status.HTTP_400_BAD_REQUEST)
            
            slot = get_object_or_404(OfficeHourSlot, id=slot_id, instructor=request.user)

            serializer = self.get_serializer(data=request.data, context={'request': request, "slot": slot})
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            allowed_students = serializer.save()

            return Response({'success': True, 'allowed_students_id': allowed_students.id}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Error in add_allowed_student: {e}")
            return Response(
                {'error': 'An error occurred while adding the allowed student'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @swagger_auto_schema(**get_allowed_students_swagger)
    def get(self, request, slot_id):
        """Retrieve details of all allowed students"""
        user = request.user

        if not slot_id:
            return Response(
                {'error': 'Slot ID is required.'},
                status=status.HTTP_400_BAD_REQUEST)

        slot = get_object_or_404(OfficeHourSlot, id=slot_id, instructor=user)
        allowed_students = AllowedStudents.objects.filter(
            booking_policy__office_hour_slot__id=slot_id, 
            booking_policy__office_hour_slot__instructor=user
        )

        serializer = self.get_serializer(allowed_students, many=True, context={'request': request, 'slot': slot})

        return Response({'allowed_students': serializer.data}, status=status.HTTP_200_OK)
    
class AllowedStudentsUpdateDeleteView(GenericAPIView):
    serializer_class = AllowedStudentsSerializer
    permission_classes = [IsInstructor]

    @swagger_auto_schema(**update_allowed_student_swagger)
    def patch(self, request, allowed_student_id):
        """Update an existing allowed student"""
        user = request.user

        if not allowed_student_id:
            return Response(
                {'error': 'Allowed Student ID is required.'},
                status=status.HTTP_400_BAD_REQUEST)

        allowed_student = get_object_or_404(AllowedStudents, id=allowed_student_id, booking_policy__office_hour_slot__instructor=user)
        
        # Get the slot from the allowed_student's booking_policy
        slot = allowed_student.booking_policy.office_hour_slot

        serializer = self.get_serializer(instance=allowed_student, data=request.data, context={'request': request, 'slot': slot})

        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        updated_student = serializer.save()
        return Response({'success': True, 'time_slot_id': updated_student.id, 'message': 'Allowed student updated successfully.'}, status=status.HTTP_200_OK)

    @swagger_auto_schema(**delete_allowed_student_swagger)
    def delete(self, request, allowed_student_id):
        """Delete an existing allowed student"""
        user = request.user
        
        if not allowed_student_id:
            return Response(
                {'error': 'Allowed Student ID is required.'},
                status=status.HTTP_400_BAD_REQUEST)

        allowed_student = get_object_or_404(AllowedStudents, id=allowed_student_id, booking_policy__office_hour_slot__instructor=user)

        try:
            allowed_student.delete()
        except Exception as e:
            return Response({'error': 'Failed to delete allowed student'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'success': True, 'allowed_student_id': allowed_student.id}, status=status.HTTP_200_OK)
