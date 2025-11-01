from django.shortcuts import render
from accounts.permissions import IsStudent, IsInstructor
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from instructor.models import OfficeHourSlot, BookingPolicy
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .schemas.slot_schemas import get_user_slots_response
from rest_framework.permissions import IsAuthenticated
# Create your views here.
@swagger_auto_schema(
    method='get',
    operation_description='Get all office hour slots for the logged-in instructor.',
    responses={
        200: get_user_slots_response,
        500: 'Internal server error'
    }
)
@api_view(['GET'])
@permission_classes([IsInstructor])
def get_user_slots(request):
    try:
        user = request.user

        slots = OfficeHourSlot.objects.filter(instructor=user)
        return Response({
            'slots': [
                {
                    'id': slot.id,
                    'course_name': slot.course_name,
                    'section': slot.section,
                    'day_of_week': slot.day_of_week,
                    'start_time': slot.start_time,
                    'end_time': slot.end_time,
                    'duration_minutes': slot.duration_minutes,
                    'start_date': slot.start_date,
                    'end_date': slot.end_date,
                    'room': slot.room,
                    'status': slot.status,
                    'created_at': slot.created_at,
                    'require_specific_email': slot.policy.require_specific_email if hasattr(slot, 'policy') else None,
                    'set_student_limit': slot.policy.set_student_limit if hasattr(slot, 'policy') else None,
                } for slot in slots
            ]
        }, status=200)
    
    except Exception as e:
        return Response({'error': f'An error occurred {str(e)}'}, status=500)

@swagger_auto_schema(
    method='get',
    operation_description='Search office hour slots by TA name and return matching TA names.',
    responses={
        200: get_user_slots_response,
        500: 'Internal server error'
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_ta(request):
    try:
        ta_name = request.query_params.get('ta_name', None)
        user = request.user

        if ta_name:
            ta_names = OfficeHourSlot.objects.filter(ta_name__icontains=ta_name).values_list('ta_name', flat=True).distinct()
        else:
            ta_names = []

        return Response({
            'matching_tas': list(ta_names)
        }, status=200)
    
    except Exception as e:
        return Response({'error': f'An error occurred {str(e)}'}, status=500)