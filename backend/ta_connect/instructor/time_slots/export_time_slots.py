from rest_framework.generics import GenericAPIView
from drf_yasg.utils import swagger_auto_schema
from instructor.models import OfficeHourSlot
from accounts.permissions import IsInstructor
from instructor.serializers.time_slots_serializer import TimeSlotSerializer
from instructor.schemas.export_instructor_csv_schema import export_csv_params
import csv
from django.http import HttpResponse
    
class TimeSlotsExport(GenericAPIView):
    serializer_class = TimeSlotSerializer
    permission_classes = [IsInstructor]

    @swagger_auto_schema(
        manual_parameters=export_csv_params,
        operation_description='Export office hour slots in CSV for the logged-in instructor.',
        responses={
            200: 'CSV file',
            400: 'Invalid query params',
            500: 'Internal server error',
        }
    )
    def get(self, request):
        # Export office hours as a CSV file for the logged-in user.
        try:
            # Filter office hours by instructor
            office_hours = OfficeHourSlot.objects.filter(
                instructor=request.user,
            ).order_by('-start_date', '-start_time', '-end_time')

            # Create the HTTP response with CSV content
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="office_hours_{request.user.username}.csv"'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
            
            # Write CSV data
            writer = csv.writer(response)
            writer.writerow(['Course Name', 'Section', 'Day of Week', 'Start Time', 'End Time', 'Duration (mins)', 'Start Date', 'End Date', 'Room', 'Status'])  # CSV Header
            for slot in office_hours:
                writer.writerow([
                    slot.course_name,
                    slot.section or '',
                    slot.day_of_week,
                    slot.start_time,
                    slot.end_time,
                    slot.duration_minutes,
                    slot.start_date,
                    slot.end_date,
                    slot.room,
                    'Active' if slot.status else 'Inactive'
                ])
            
            return response
        except Exception as e:
            return HttpResponse(f"Error occurred while exporting office hours", status=500)