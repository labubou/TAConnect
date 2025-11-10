from rest_framework import serializers
from instructor.models import OfficeHourSlot
from student.models import Booking
import datetime

class GetBookTimesSerializer(serializers.Serializer):
    date = serializers.CharField(max_length=100)

    def validate_date(self, value):
        try:
            selected_date = datetime.datetime.strptime(value, '%Y-%m-%d').date()
        except ValueError:
            raise serializers.ValidationError('Invalid date format. Use YYYY-MM-DD')
        
        # Check if the date is in the past
        today = datetime.date.today()
        if selected_date < today:
            raise serializers.ValidationError('Cannot view or book appointments for past dates.')
        
        return selected_date

    def validate(self, data):
        #get slot from context
        slot = self.context['slot']
        selected_date = data['date']
        
        # Validate slot has instructor assigned
        if not slot.instructor:
            raise serializers.ValidationError({'error': 'Instructor not assigned to this slot'})

        # Validate slot has timing details
        if not slot.day_of_week or not slot.start_time or not slot.end_time:
            raise serializers.ValidationError({'error': 'Slot timing details are incomplete'})
        
        # Check if slot is within the active date range
        if slot.start_date > selected_date or slot.end_date < selected_date:
            raise serializers.ValidationError({'error': 'This slot is not active on the selected date'})
        
        # Check if slot is active
        if not slot.status:
            raise serializers.ValidationError({'error': 'This slot is inactive'})
        
        # Check if student email is allowed (if policy requires specific emails)
        student_email = self.context['request'].user.email
        if hasattr(slot, 'policy') and slot.policy.require_specific_email:
            is_allowed = slot.policy.allowed_students.filter(email=student_email).exists()
            if not is_allowed:
                raise serializers.ValidationError({
                    'error': 'Your email is not authorized to book this office hour slot'
                })
        
        # Verify the selected date matches the slot's day of week
        day_of_the_week = selected_date.strftime('%a')  # Mon, Tue, etc.
        if day_of_the_week != slot.day_of_week:
            raise serializers.ValidationError({'error': 'Selected date does not match slot day of week'})
        
        # Store validated date
        data['selected_date'] = selected_date
        
        return data
