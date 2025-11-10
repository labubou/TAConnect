from requests import Response, request
from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from instructor.models import OfficeHourSlot, BookingPolicy
import datetime
from student.models import Booking

class BookSerializer(serializers.Serializer):

    date_str = serializers.CharField(max_length=100)
    start_time_str = serializers.CharField(max_length=100)

    def validate_date_str(self, value):
        try:
            date_str = datetime.datetime.strptime(value, '%Y-%m-%d').date()
        except ValueError:
            raise serializers.ValidationError("Invalid date format. Use YYYY-MM-DD.")
        return date_str

    def validate_start_time_str(self, value):
        # Check the format of the time
        try:
            start_time_str = datetime.datetime.strptime(value, '%H:%M').time()
        except ValueError:
            raise serializers.ValidationError("Invalid time format. Use HH:MM.")
        return start_time_str
            
    def validate(self, data):
        #gets the slot from the context passed in the view
        slot = self.context['slot']
        
        #if there is not instructor assigned to the slot, raise an error
        if not slot.instructor:
            raise serializers.ValidationError({'error': 'Instructor not assigned to this slot'})

        #if there is missing timing details, raise an error
        if not slot.day_of_week or not slot.start_time or not slot.end_time:
            raise serializers.ValidationError({'error': 'Slot timing details are incomplete'})

        #if the selected date is outside the slot's active date range, raise an error
        if slot.start_date > data['date_str'] or slot.end_date < data['date_str']:
            raise serializers.ValidationError({'error': 'This slot is not active on the selected date'})

        #is the status is false raise an error
        if not slot.status:
            raise serializers.ValidationError({'error': f'This slot is inactive'})
        
        # Check if student email is allowed (if policy requires specific emails)
        student_email = self.context['request'].user.email
        if hasattr(slot, 'policy') and slot.policy.require_specific_email:
            is_allowed = slot.policy.allowed_students.filter(email=student_email).exists()
            if not is_allowed:
                raise serializers.ValidationError({
                    'error': 'Your email is not authorized to book this office hour slot'
                })

        #make sure the student has not exceeded booking limit per student
        existing_booking_per_student = Booking.objects.filter(
            office_hour=slot,
            student=self.context['request'].user,
            date=data['date_str'],
        ).count()
        if existing_booking_per_student >= slot.policy.set_student_limit:
            raise serializers.ValidationError({'error': f'You have already booked a slot for this date and the maximum is {slot.policy.set_student_limit}'})
        
        # Combine date and time into datetime for duplicate check
        start_datetime = datetime.datetime.combine(data['date_str'], data['start_time_str'])
        
        # Check if this time is already booked
        existing_booking = Booking.objects.filter(
            office_hour=slot,
            date=data['date_str'],
            start_time=start_datetime
        ).exists()

        if existing_booking:
            raise serializers.ValidationError({'error': 'This time is already booked'})
        
        # Store computed datetime for use in create()
        data['selected_date_str'] = data.pop('date_str')
        data['start_time_str'] = data.pop('start_time_str')
        data['start_datetime'] = start_datetime
        
        return data

    def create(self, validated_data):
        book_time = Booking.objects.create(
            office_hour=self.context['slot'],
            student=self.context['request'].user,
            date=validated_data['selected_date_str'],
            start_time=validated_data['start_datetime'],
        )
        return book_time
