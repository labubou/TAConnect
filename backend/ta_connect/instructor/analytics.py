from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import IsInstructor
from student.models import Booking

from instructor.serializers.booking_analytics_serializer import BookingAnalyticsSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db.models import Count

class BookingAnalyticsView(GenericAPIView):

    permission_classes = [IsInstructor]
    

    @swagger_auto_schema(
        query_serializer=BookingAnalyticsSerializer,
        responses={
            200: openapi.Response(
                description='Booking analytics data',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'period': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'start_date': openapi.Schema(type=openapi.TYPE_STRING, format='date'),
                                'end_date': openapi.Schema(type=openapi.TYPE_STRING, format='date'),
                            }
                        ),
                        'most_booked_slot': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'slot_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'start_time': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                                'end_time': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                                'room': openapi.Schema(type=openapi.TYPE_STRING),
                                'booking_count': openapi.Schema(type=openapi.TYPE_INTEGER),
                            }
                        ),
                        'most_booked_time': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'hour': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'time': openapi.Schema(type=openapi.TYPE_STRING),
                                'booking_count': openapi.Schema(type=openapi.TYPE_INTEGER),
                            }
                        ),
                        'all_slots_analytics': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'slot_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'start_time': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                                    'end_time': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                                    'room': openapi.Schema(type=openapi.TYPE_STRING),
                                    'booking_count': openapi.Schema(type=openapi.TYPE_INTEGER),
                            }
                        )
                    ),
                        'all_times_analytics': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'hour': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'time': openapi.Schema(type=openapi.TYPE_STRING),
                                    'booking_count': openapi.Schema(type=openapi.TYPE_INTEGER),
                            }
                        )
                    ),
                        'total_bookings': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'summary': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'average_bookings_per_slot': openapi.Schema(type=openapi.TYPE_NUMBER),
                                'total_unique_slots': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'total_unique_times': openapi.Schema(type=openapi.TYPE_INTEGER),
                            }
                        ),
                    }
                )
            )
        }
    )
    
    def get(self, request):
        """
        Get booking analytics for instructor office hour slots.
        
        Query Parameters:
        - start_date (optional): YYYY-MM-DD format
        - end_date (optional): YYYY-MM-DD format
        
        If no dates provided, returns analytics for current month.
        """
        try:
            serializer = BookingAnalyticsSerializer(data=request.query_params)
            
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            start_date, end_date = serializer.get_date_range()
            user = request.user
            
            # Get all bookings for instructor's slots within date range
            bookings = Booking.objects.filter(
                office_hour__instructor=user,
                date__gte=start_date,
                date__lte=end_date,
                is_cancelled=False  # Exclude cancelled bookings
            ).select_related('office_hour', 'student')
            total_bookings = bookings.count()
            
            # Most booked slot
            most_booked_slot = bookings.values(
                'office_hour__id',
                'office_hour__start_time',
                'office_hour__end_time',
                'office_hour__room'
            ).annotate(
                booking_count=Count('id')
            ).order_by('-booking_count').first()
            
            # Most booked start time (hour of day)
            most_booked_time = bookings.values(
                'start_time__hour'
            ).annotate(
                booking_count=Count('id')
            ).order_by('-booking_count').first()

            
            response_data = {
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'total_bookings': total_bookings,
                'most_booked_slot': {
                    'slot_id': most_booked_slot['office_hour__id'],
                    'start_time': most_booked_slot['office_hour__start_time'],
                    'end_time': most_booked_slot['office_hour__end_time'],
                    'room': most_booked_slot['office_hour__room'],
                    'booking_count': most_booked_slot['booking_count']
                } if most_booked_slot else None,
                'most_booked_time': {
                    'hour': most_booked_time['start_time__hour'],
                    'time': f"{most_booked_time['start_time__hour']:02d}:00",
                    'booking_count': most_booked_time['booking_count']
                } if most_booked_time else None,
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in BookingAnalyticsView: {str(e)}")
            return Response(
                {'error': f'An error occurred while processing the request'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )