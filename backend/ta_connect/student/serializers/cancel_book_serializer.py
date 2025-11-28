# yourapp/serializers/cancel_booking.py
from rest_framework import serializers
import datetime

class CancelBookingSerializer(serializers.Serializer):
    confirm = serializers.BooleanField(default=True)
    send_email = serializers.BooleanField(default=True, required=False)

    def validate(self, attrs):
        booking = self.instance
        today = datetime.date.today()
        if booking.date < today:
            raise serializers.ValidationError("Cannot cancel a past booking")
        return attrs

    def update(self, instance, validated_data):
        booking = instance
        booking.is_cancelled = True
        booking.save()
        return booking
