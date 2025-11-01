from django.shortcuts import render
from accounts.permissions import IsStudent, IsInstructor
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from instructor.models import OfficeHourSlot, BookingPolicy
from student.models import Booking
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .schemas.slot_schemas import get_user_slots_response

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
        books = Booking.objects.filter(office_hour__in=slots)
        return Response({
            'slots': [
                {
                    'id': slot.id,
                    'course_name': slot.course_name,
                    'section': slot.section,
                    'day_of_week': slot.day_of_week,
                    'start_time': slot.start_time.strftime('%H:%M:%S') if slot.start_time else None,
                    'end_time': slot.end_time.strftime('%H:%M:%S') if slot.end_time else None,
                    'duration_minutes': slot.duration_minutes,
                    'start_date': slot.start_date.strftime('%Y-%m-%d') if slot.start_date else None,
                    'end_date': slot.end_date.strftime('%Y-%m-%d') if slot.end_date else None,
                    'room': slot.room,
                    'status': slot.status,
                    'created_at': slot.created_at.isoformat() if slot.created_at else None,
                    'require_specific_email': slot.policy.require_specific_email if hasattr(slot, 'policy') else False,
                    'set_student_limit': slot.policy.set_student_limit if hasattr(slot, 'policy') else None,
                } for slot in slots
            ],
            'bookings': [
                {
                    'id': book.id,
                    'student': {
                        'id': book.student.id,
                        'username': book.student.username,
                        'email': book.student.email,
                        'first_name': book.student.first_name,
                        'last_name': book.student.last_name,
                    },
                    'office_hour': {
                        'id': book.office_hour.id,
                        'course_name': book.office_hour.course_name,
                        'section': book.office_hour.section,
                        'day_of_week': book.office_hour.day_of_week,
                        'start_time': book.office_hour.start_time.strftime('%H:%M:%S') if book.office_hour.start_time else None,
                        'end_time': book.office_hour.end_time.strftime('%H:%M:%S') if book.office_hour.end_time else None,
                        'duration_minutes': book.office_hour.duration_minutes,
                        'room': book.office_hour.room,
                        'status': book.office_hour.status,
                    },
                    'date': book.date.strftime('%Y-%m-%d') if book.date else None,
                    'start_time': book.start_time.strftime('%Y-%m-%d %H:%M:%S') if book.start_time else None,
                    'is_cancelled': book.is_cancelled,
                    'created_at': book.created_at.isoformat() if book.created_at else None,
                } for book in books
            ]
        }, status=200)
    
    except Exception as e:
        return Response({'error': f'An error occurred: {str(e)}'}, status=500)