from datetime import timezone
from rest_framework import serializers
from student.utils.book_is_time_available import is_time_available

class AvailableTimesSerializer(serializers.Serializer):
    date = serializers.DateField()

    def validate(self, attrs):
        request = self.context.get('request')
        slot = self.context.get('slot')
        today = self.context.get('today')

        if not slot:
            raise serializers.ValidationError("slot must be provided in context")

        # 1. range checks
        if slot.start_date > attrs['date'] or slot.end_date < attrs['date']:
            raise serializers.ValidationError("Date is outside the slot active range")

        # 2. day of the week check
        if attrs['date'].strftime('%A')[:3] != slot.day_of_week:
            raise serializers.ValidationError("Date is not on an active weekday for this slot")
        
        if today > attrs['date']:
            raise serializers.ValidationError("Date cannot be in the past")
        
        if not slot.status:
            raise serializers.ValidationError("This slot is inactive")
        
        # Check if student email is allowed (if policy requires specific emails)
        student_email = request.user.email
        if hasattr(slot, 'policy') and slot.policy.require_specific_email:
            is_allowed = slot.policy.allowed_students.filter(email=student_email).exists()
            if not is_allowed:
                raise serializers.ValidationError("Your email is not authorized to book this office hour slot")

        return attrs