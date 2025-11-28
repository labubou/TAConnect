# yourapp/serializers/update_booking.py
from rest_framework import serializers
from django.utils import timezone
from student.utils.book_is_time_available import is_time_available

class UpdateBookingSerializer(serializers.Serializer):
    new_date = serializers.DateField()
    new_time = serializers.TimeField()

    def validate(self, attrs):
        booking = self.instance
        slot = booking.office_hour

        naive_dt = timezone.datetime.combine(attrs['new_date'], attrs['new_time'])
        new_start_dt = timezone.make_aware(naive_dt) if timezone.is_naive(naive_dt) else naive_dt

        booking_end = new_start_dt + timezone.timedelta(minutes=slot.duration_minutes)
        slot_end_dt = timezone.datetime.combine(attrs['new_date'], slot.end_time)
        slot_end_dt = timezone.make_aware(slot_end_dt) if timezone.is_naive(slot_end_dt) else slot_end_dt
        if booking_end > slot_end_dt:
            raise serializers.ValidationError("Booking ends after slot end time")

        if not is_time_available(slot, attrs['new_date'], new_start_dt, slot.duration_minutes, exclude_booking_id=booking.id):
            raise serializers.ValidationError("New time overlaps existing booking")

        attrs['new_start_datetime'] = new_start_dt
        return attrs

    def update(self, instance, validated_data):
        booking = instance
        booking.date = validated_data['new_date']
        booking.start_time = validated_data['new_start_datetime']
        # Clear end_time so it gets recalculated in the save() method
        booking.end_time = None
        booking.save()
        return booking