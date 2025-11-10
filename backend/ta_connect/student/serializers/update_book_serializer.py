from rest_framework import serializers
from instructor.models import OfficeHourSlot
from student.models import Booking
import datetime


class UpdateBookingSerializer(serializers.Serializer):
    new_date = serializers.CharField(max_length=100)
    new_time = serializers.CharField(max_length=100)

    def validate_new_date(self, value):
        try:
            new_date = datetime.datetime.strptime(value, '%Y-%m-%d').date()
        except ValueError:
            raise serializers.ValidationError("Invalid date format. Use YYYY-MM-DD.")
        
        # Check if the new date is in the past
        today = datetime.date.today()
        if new_date < today:
            raise serializers.ValidationError('Cannot update booking to a past date')
        
        return new_date

    def validate_new_time(self, value):
        try:
            new_time = datetime.datetime.strptime(value, '%H:%M').time()
        except ValueError:
            raise serializers.ValidationError("Invalid time format. Use HH:MM.")
        return new_time

    def validate(self, data):
        # Get booking and slot from context
        existing_booking = self.context['booking']
        slot = existing_booking.office_hour
        
        new_date = data['new_date']
        new_time = data['new_time']
        
        # Check if updating to today and the time has already passed
        if new_date == datetime.date.today():
            current_time = datetime.datetime.now().time()
            if new_time < current_time:
                raise serializers.ValidationError({'new_time': 'Cannot update booking to a past time'})

        # Validate new booking time against slot constraints
        if slot.start_date > new_date or slot.end_date < new_date:
            raise serializers.ValidationError({'new_date': 'The new date is outside the valid range for this slot'})

        if not slot.status:
            raise serializers.ValidationError({'error': 'This slot is currently inactive'})

        # Check if new time is already booked
        new_start_datetime = datetime.datetime.combine(new_date, new_time)
        
        time_conflict = Booking.objects.filter(
            office_hour=slot,
            date=new_date,
            start_time=new_start_datetime,
            is_cancelled=False
        ).exclude(id=existing_booking.id).exists()

        if time_conflict:
            raise serializers.ValidationError({'error': 'The new time slot is already booked'})
        
        # Store computed values
        data['new_start_datetime'] = new_start_datetime
        data['old_date'] = existing_booking.date
        data['old_time'] = existing_booking.start_time.time() if isinstance(existing_booking.start_time, datetime.datetime) else existing_booking.start_time
        
        return data

    def update(self, instance, validated_data):
        instance.date = validated_data['new_date']
        instance.start_time = validated_data['new_start_datetime']
        instance.save()
        return instance
