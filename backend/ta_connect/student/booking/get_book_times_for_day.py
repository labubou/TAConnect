from django.shortcuts import render
from accounts.permissions import IsStudent, IsInstructor
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from instructor.models import OfficeHourSlot, BookingPolicy
from student.models import Booking
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import datetime
from student.serializers.get_book_times_for_day_serializer import GetBookTimesSerializer

# Create your views here.
@swagger_auto_schema(
    method='get',
    operation_description='Get available booking times for a specific date and slot.',
    manual_parameters=[
        openapi.Parameter(
            'slot_id',
            openapi.IN_PATH,
            description='ID of the office hour slot',
            type=openapi.TYPE_INTEGER,
            required=True
        ),
        openapi.Parameter(
            'date',
            openapi.IN_QUERY,
            description='Date in YYYY-MM-DD format',
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        200: 'List of available time slots',
        400: 'Invalid request or slot not active',
        403: 'Student email not allowed to book this slot',
        404: 'Slot not found',
        500: 'Internal server error'
    }
)
@api_view(['GET'])
@permission_classes([IsStudent])
def get_book_times_for_day(request, slot_id):
    try:
        slot = OfficeHourSlot.objects.filter(id=slot_id).first()

        if not slot:
            return Response({'error': 'Slot not found'}, status=404)
        
        # Get date from query parameters
        date_str = request.query_params.get("date")
        
        if not date_str:
            return Response({'error': 'No date provided'}, status=400)

        serializer = GetBookTimesSerializer(
            data={'date': date_str},
            context={'slot': slot, 'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=400
            )

        #generate available times in the view
        selected_date = serializer.validated_data['selected_date']
        
        #get already booked appointments for this date
        booked_times = Booking.objects.filter(
            office_hour=slot,
            date=selected_date,
            is_cancelled=False
        ).values_list('start_time', flat=True)

        booked_times_set = set(bt.time() if hasattr(bt, 'time') else bt for bt in booked_times)
        
        available_times = []
        separation_minutes = slot.duration_minutes
        current_time = datetime.datetime.combine(datetime.date.today(), slot.start_time)
        end_time = datetime.datetime.combine(datetime.date.today(), slot.end_time)
        
        #generate all possible time slots between start_time and end_time
        while current_time < end_time:
            time_obj = current_time.time()
            
            #check if this time is already booked
            if time_obj not in booked_times_set:
                available_times.append({
                    'value': time_obj.strftime('%H:%M:%S'),
                    'display': time_obj.strftime('%I:%M %p')
                })
            
            #move to the next time slot based on duration_minutes
            current_time += datetime.timedelta(minutes=int(separation_minutes))

        return Response({
            'slot_id': slot.id,
            'date': date_str,
            'available_times': available_times
        }, status=200)
    
    except Exception as e:
        return Response({'error': f'An error occurred {str(e)}'}, status=500)