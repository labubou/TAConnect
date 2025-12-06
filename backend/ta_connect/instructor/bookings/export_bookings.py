from rest_framework.generics import GenericAPIView
from drf_yasg.utils import swagger_auto_schema
from student.models import Booking
from accounts.permissions import IsInstructor
from instructor.serializers.get_user_booking_serializer import GetUserBookingSerializer
from instructor.schemas.export_bookings_csv_schema import export_bookings_csv_params
import csv
from django.http import HttpResponse
    
class BookingsExport(GenericAPIView):
    serializer_class = GetUserBookingSerializer
    permission_classes = [IsInstructor]

    @swagger_auto_schema(
        manual_parameters=export_bookings_csv_params,
        operation_description='Export bookings in CSV for the logged-in instructor. Optionally filter by date range.',
        responses={
            200: 'CSV file',
            400: 'Invalid query params',
            500: 'Internal server error',
        }
    )
    def get(self, request):
        # Export bookings as a CSV file for the logged-in instructor.
        try:
            # Use the serializer to validate date range
            serializer = self.get_serializer(data=request.query_params, context={'request': request})
            if serializer.is_valid():
                start_date = serializer.validated_data.get('start_date')
                end_date = serializer.validated_data.get('end_date')
            else:
                start_date = None
                end_date = None

            # Filter bookings by instructor's office hours
            bookings_query = Booking.objects.filter(
                office_hour__instructor=request.user,
            )

            # Apply date filters if provided
            if start_date and end_date:
                bookings_query = bookings_query.filter(date__range=(start_date, end_date))
            elif start_date:
                bookings_query = bookings_query.filter(date__gte=start_date)
            elif end_date:
                bookings_query = bookings_query.filter(date__lte=end_date)

            bookings = bookings_query.order_by('-date', '-start_time')

            # Create the HTTP response with CSV content
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="bookings_{request.user.username}.csv"'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
            
            # Write CSV data
            writer = csv.writer(response)
            writer.writerow([
                'Booking ID', 'Student Name', 'Student Email', 'Student Username',
                'Office Hour ID', 'Course Name', 'Section', 'Room', 
                'Date', 'Start Time', 'End Time', 'Day of Week',
                'Status', 'Created At'
            ])  # CSV Header
            
            for booking in bookings:
                writer.writerow([
                    booking.id,
                    f"{booking.student.first_name} {booking.student.last_name}",
                    booking.student.email,
                    booking.student.username,
                    booking.office_hour.id,
                    booking.office_hour.course_name,
                    booking.office_hour.section or '',
                    booking.office_hour.room,
                    booking.date,
                    booking.start_time.strftime('%Y-%m-%d %H:%M:%S') if booking.start_time else '',
                    booking.end_time.strftime('%Y-%m-%d %H:%M:%S') if booking.end_time else '',
                    booking.office_hour.day_of_week,
                    booking.status,
                    booking.created_at.strftime('%Y-%m-%d %H:%M:%S') if booking.created_at else ''
                ])
            
            return response
        except Exception as e:
            print(f"Error exporting bookings: {e}")
            return HttpResponse(f"Error occurred while exporting bookings", status=500)