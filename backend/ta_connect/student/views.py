from django.shortcuts import render
from accounts.permissions import IsStudent, IsInstructor
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from instructor.models import OfficeHourSlot, BookingPolicy
import datetime

# Create your views here.
@api_view(['GET'])
@permission_classes([IsStudent])
def url_data_slots(request,slot_id):
    try:
        today = datetime.date.today()
        slot = OfficeHourSlot.objects.filter(id=slot_id).first()

        if not slot:
            return Response({'error': 'Slot not found'}, status=404)
        
        if not slot.instructor:
            return Response({'error': 'Instructor not assigned to this slot'}, status=400)

        if not slot.day_of_week or not slot.start_time or not slot.end_time:
            return Response({'error': f'Slot timing details are incomplete'}, status=400)
        
        if slot.start_date>today or slot.end_date<today:
            return Response({'error': 'This slot is not active today'}, status=400)
        
        if slot.status==False:
            return Response({'error': 'This slot is inactive'}, status=400)
        
        return Response({
            'id': slot.id,
            'instructor': slot.instructor.username,
            'course_name': slot.course_name,
            'section': slot.section,
            'day_of_week': slot.day_of_week,
            'start_time': slot.start_time,
            'end_time': slot.end_time,
            'duration_minutes': slot.duration_minutes,
            'start_date': slot.start_date,
            'end_date': slot.end_date,
            'status': slot.status,
        }, status=200)
    
    except Exception as e:
        return Response({'error': f'An error occurred {str(e)}'}, status=500)