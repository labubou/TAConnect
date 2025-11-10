from rest_framework import serializers
from student.models import Booking
import datetime


class CancelBookingSerializer(serializers.Serializer):
    
    def validate(self, data):
        # Get booking from context
        booking = self.context['booking']
        
        # Check if the booking date has already passed
        today = datetime.date.today()
        if booking.date < today:
            raise serializers.ValidationError({'error': 'Cannot cancel a booking for a past date'})
        
        # Check if canceling today and the time has already passed
        if booking.date == today:
            current_time = datetime.datetime.now().time()
            booking_time = booking.start_time.time()
            if booking_time < current_time:
                raise serializers.ValidationError({'error': 'Cannot cancel a booking that has already passed'})
        
        # Store booking details for email context
        data['booking_date'] = booking.date
        data['booking_time'] = booking.start_time
        data['course_name'] = booking.office_hour.course_name
        data['instructor'] = booking.office_hour.instructor
        data['room'] = booking.office_hour.room
        
        return data
    
    def update(self, instance, validated_data):
        instance.is_cancelled = True
        instance.save()
        return instance
