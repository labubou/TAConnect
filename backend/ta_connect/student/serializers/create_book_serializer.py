# yourapp/serializers/create_booking.py
from rest_framework import serializers
from django.utils import timezone
from student.models import Booking
from django.db import transaction
from student.utils.book_is_time_available import is_time_available

class CreateBookingSerializer(serializers.Serializer):
    slot_id = serializers.IntegerField(write_only=True)
    date = serializers.DateField()
    start_time = serializers.TimeField()

    def validate(self, attrs):
        request = self.context.get('request')
        slot = self.context.get('slot')  # view should place slot in context
        if not slot:
            raise serializers.ValidationError("slot must be provided in context")

        # 1. range checks
        if slot.start_date > attrs['date'] or slot.end_date < attrs['date']:
            raise serializers.ValidationError("Date is outside the slot active range")

        # 2. make datetimes timezone-aware and combine date/time
        naive_dt = timezone.datetime.combine(attrs['date'], attrs['start_time'])
        start_dt = timezone.make_aware(naive_dt) if timezone.is_naive(naive_dt) else naive_dt

        # 3. check end time vs slot end
        booking_end = start_dt + timezone.timedelta(minutes=slot.duration_minutes)
        slot_end_dt = timezone.datetime.combine(attrs['date'], slot.end_time)
        slot_end_dt = timezone.make_aware(slot_end_dt) if timezone.is_naive(slot_end_dt) else slot_end_dt
        if booking_end > slot_end_dt:
            raise serializers.ValidationError("Booking ends after slot end time")

        # 4. check overlaps via a function in utils
        if not is_time_available(slot, attrs['date'], start_dt, slot.duration_minutes):
            raise serializers.ValidationError("Time overlaps existing booking")

        if slot.status is False:
            raise serializers.ValidationError("This slot is inactive")
        
        if slot.policy and slot.policy.require_specific_email:
            student_email = request.user.email
            is_allowed = slot.policy.allowed_students.filter(email=student_email).exists()
            if not is_allowed:
                raise serializers.ValidationError("Your email is not authorized to book this office hour slot")
        
        attrs['start_datetime'] = start_dt
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        slot = self.context['slot']
        user = self.context['request'].user

        booking = Booking.objects.create(
            office_hour=slot,
            student=user,
            date=validated_data['date'],
            start_time=validated_data['start_datetime'],
        )
        return booking