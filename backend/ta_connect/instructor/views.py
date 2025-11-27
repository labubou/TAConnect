from django.shortcuts import render
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsInstructor, IsStudent
from instructor.models import OfficeHourSlot
from accounts.models import User
from student.models import Booking
from instructor.serializers.get_user_booking_serializer import GetUserBookingSerializer
from instructor.serializers.booking_analytics_serializer import BookingAnalyticsSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .schemas.slot_schemas import (
    get_user_slots_swagger,
    get_user_bookings_swagger,
    search_instructors_swagger,
    get_instructor_data_swagger
)
from django.db.models import Q, Count
from student.utils.complete_book import complete_booking

# Create your views here.
class GetUserSlotsView(GenericAPIView):
    permission_classes = [IsInstructor]

    @swagger_auto_schema(**get_user_slots_swagger)
    def get(self, request):
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
            }, status=200)
        
        except Exception as e:
            return Response({'error': f'An error occurred {str(e)}'}, status=500)

class GetUserBookingView(GenericAPIView):
    permission_classes = [IsInstructor]
    serializer_class = GetUserBookingSerializer

    @swagger_auto_schema(**get_user_bookings_swagger)
    def get(self, request):
        try:
            user = request.user

            # Use query_params for GET request instead of request.data
            serializer = self.get_serializer(data=request.query_params, context={'request': request})
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            start_date = serializer.validated_data.get('start_date')
            end_date = serializer.validated_data.get('end_date')

            # Get all slots for the instructor
            slots = OfficeHourSlot.objects.filter(instructor=user)

            # Filter bookings based on date range if provided
            if start_date and end_date:
                books = Booking.objects.filter(
                    office_hour__in=slots,
                    date__range=(start_date, end_date)
                )
            elif start_date:
                books = Booking.objects.filter(
                    office_hour__in=slots,
                    date__gte=start_date
                )
            elif end_date:
                books = Booking.objects.filter(
                    office_hour__in=slots,
                    date__lte=end_date
                )
            else:
                books = Booking.objects.filter(office_hour__in=slots)
            
            for book in books:
                if not book.is_completed:
                    success, msg = complete_booking(book)
                
            return Response({
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
            print(f"Error: {str(e)}")
            return Response({'error': f'An error occurred'}, status=500)

class SearchInstructorsView(GenericAPIView):
    permission_classes = [IsStudent]

    @swagger_auto_schema(**search_instructors_swagger)
    def get(self, request):
        """
        Search for instructors by name (first name, last name, or username).
        Returns a list of matching instructors with
        their ID and name or list all instructors in alphabetical order.
        """
        try:
            query = request.GET.get('query', '').strip()
            instructors = User.objects.filter(
                user_type='instructor',
                is_superuser=False,
                is_staff=False
            )

            if query:
                instructors = instructors.filter(
                    Q(first_name__icontains=query) | 
                    Q(last_name__icontains=query) | 
                    Q(username__icontains=query)
                )

            instructors = instructors.order_by('first_name', 'last_name')[:50]
    
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

class InstructorDataView(GenericAPIView):
    permission_classes = [IsStudent]

    @swagger_auto_schema(**get_instructor_data_swagger)
    def get(self, request, user_id):
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
                        'period': openapi.Schema(type=openapi.TYPE_OBJECT),
                        'most_booked_slot': openapi.Schema(type=openapi.TYPE_OBJECT),
                        'most_booked_time': openapi.Schema(type=openapi.TYPE_OBJECT),
                        'all_slots_analytics': openapi.Schema(type=openapi.TYPE_ARRAY),
                        'all_times_analytics': openapi.Schema(type=openapi.TYPE_ARRAY),
                        'total_bookings': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'summary': openapi.Schema(type=openapi.TYPE_OBJECT),
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
                office_hour_slot__instructor=user,
                office_hour_slot__start_time__date__gte=start_date,
                office_hour_slot__start_time__date__lte=end_date,
                status__in=['confirmed', 'completed']  # Only confirmed/completed bookings
            ).select_related('office_hour_slot', 'student')
            
            total_bookings = bookings.count()
            
            # Most booked slot
            most_booked_slot = bookings.values(
                'office_hour_slot__id',
                'office_hour_slot__start_time',
                'office_hour_slot__end_time',
                'office_hour_slot__room'
            ).annotate(
                booking_count=Count('id')
            ).order_by('-booking_count').first()
            
            # Most booked start time (hour of day)
            most_booked_time = bookings.values(
                'office_hour_slot__start_time__hour'
            ).annotate(
                booking_count=Count('id')
            ).order_by('-booking_count').first()
            
            # All slots with booking counts
            all_slots_analytics = bookings.values(
                'office_hour_slot__id',
                'office_hour_slot__start_time',
                'office_hour_slot__end_time',
                'office_hour_slot__room'
            ).annotate(
                booking_count=Count('id')
            ).order_by('-booking_count')
            
            # All times with booking counts
            all_times_analytics = bookings.values(
                'office_hour_slot__start_time__hour'
            ).annotate(
                booking_count=Count('id'),
                time_display=Count('id')  # We'll format this in response
            ).order_by('-booking_count')
            
            # Format times for display
            formatted_times = []
            for time_data in all_times_analytics:
                hour = time_data['office_hour_slot__start_time__hour']
                formatted_times.append({
                    'hour': hour,
                    'time': f"{hour:02d}:00",
                    'booking_count': time_data['booking_count']
                })
            
            # Format slot data
            formatted_slots = []
            for slot_data in all_slots_analytics:
                formatted_slots.append({
                    'slot_id': slot_data['office_hour_slot__id'],
                    'start_time': slot_data['office_hour_slot__start_time'],
                    'end_time': slot_data['office_hour_slot__end_time'],
                    'room': slot_data['office_hour_slot__room'],
                    'booking_count': slot_data['booking_count']
                })
            
            response_data = {
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'total_bookings': total_bookings,
                'most_booked_slot': {
                    'slot_id': most_booked_slot['office_hour_slot__id'],
                    'start_time': most_booked_slot['office_hour_slot__start_time'],
                    'end_time': most_booked_slot['office_hour_slot__end_time'],
                    'room': most_booked_slot['office_hour_slot__room'],
                    'booking_count': most_booked_slot['booking_count']
                } if most_booked_slot else None,
                'most_booked_time': {
                    'hour': most_booked_time['office_hour_slot__start_time__hour'],
                    'time': f"{most_booked_time['office_hour_slot__start_time__hour']:02d}:00",
                    'booking_count': most_booked_time['booking_count']
                } if most_booked_time else None,
                'all_slots_analytics': formatted_slots,
                'all_times_analytics': formatted_times,
                'summary': {
                    'average_bookings_per_slot': round(total_bookings / len(formatted_slots), 2) if formatted_slots else 0,
                    'total_unique_slots': len(formatted_slots),
                    'total_unique_times': len(formatted_times)
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )