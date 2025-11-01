from django.shortcuts import render
from accounts.permissions import IsStudent, IsInstructor
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from instructor.models import OfficeHourSlot, BookingPolicy
from accounts.models import User
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .schemas.slot_schemas import get_user_slots_response, get_instructor_data_response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

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
    operation_description='Search for instructors by name (first name, last name, or username).',
    manual_parameters=[
        openapi.Parameter(
            'query',
            openapi.IN_QUERY,
            description='Search query for instructor name',
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        200: openapi.Response(
            description='List of matching instructors',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'instructors': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Instructor ID', example=1),
                                'username': openapi.Schema(type=openapi.TYPE_STRING, description='Username', example='john_doe'),
                                'full_name': openapi.Schema(type=openapi.TYPE_STRING, description='Full name', example='John Doe'),
                                'email': openapi.Schema(type=openapi.TYPE_STRING, description='Email', example='john.doe@example.com'),
                            }
                        )
                    )
                }
            )
        ),
        400: 'Search query parameter is required',
        500: 'Internal server error'
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_instructors(request):
    """
    Search for instructors by name (first name, last name, or username).
    Returns a list of matching instructors with their ID and name.
    """
    try:
        query = request.GET.get('query', '').strip()

        if not query:
            return Response({'error': 'Search query parameter is required'}, status=400)
        
        # Search for instructors matching the query
        instructors = User.objects.filter(
            Q(user_type='instructor') &
            (Q(first_name__icontains=query) | 
             Q(last_name__icontains=query) | 
             Q(username__icontains=query))
        ).distinct()[:10]  # Limit to 10 results
        
        return Response({
            'instructors': [
                {
                    'id': instructor.id,
                    'username': instructor.username,
                    'full_name': instructor.full_name,
                    'email': instructor.email,
                } for instructor in instructors
            ]
        }, status=200)
    
    except Exception as e:
        return Response({'error': f'An error occurred: {str(e)}'}, status=500)

@swagger_auto_schema(
    method='get',
    operation_description='Get detailed information about a specific instructor including their office hour slots.',
    manual_parameters=[
        openapi.Parameter(
            'user_id',
            openapi.IN_PATH,
            description='ID of the instructor',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    responses={
        200: get_instructor_data_response,
        404: 'Instructor not found',
        500: 'Internal server error'
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_instructor_data(request, user_id):
    """
    Get detailed information about a specific instructor.
    """
    try:
        instructor = User.objects.get(id=user_id, user_type='instructor')
        data = {
            'id': instructor.id,
            'username': instructor.username,
            'full_name': instructor.full_name,
            'email': instructor.email,
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
                } for slot in OfficeHourSlot.objects.filter(instructor=instructor)
            ]
        }
        return Response(data, status=200)

    except User.DoesNotExist:
        return Response({'error': 'Instructor not found'}, status=404)
    except Exception as e:
        return Response({'error': f'An error occurred: {str(e)}'}, status=500)
