from rest_framework import serializers
import datetime

class ConfirmBookingSerializer(serializers.Serializer):
    
    def validate(self, attrs):
        booking = self.instance

        # Check if already cancelled
        if booking.is_cancelled:
            raise serializers.ValidationError('Booking is already cancelled.')
        
        # Check if already completed
        if booking.is_completed:
            raise serializers.ValidationError('Booking is already completed and cannot be cancelled.')

        if booking.status == 'confirmed':
            raise serializers.ValidationError('Booking is already confirmed.')
        
        today = datetime.date.today()
        if booking.date < today:
            raise serializers.ValidationError("Cannot confirm a past booking")
        return attrs

    def update(self, instance, validated_data):
        booking = instance
        booking.confirm()
        booking.save()
        return booking
