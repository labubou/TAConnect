from rest_framework import serializers


class ConfirmBookingSerializer(serializers.Serializer):
    """
    Serializer for confirming a pending booking.
    Used by instructors to approve student booking requests.
    """
    
    def validate(self, attrs):
        booking = self.instance

        # Check if already cancelled
        if booking.is_cancelled:
            raise serializers.ValidationError("Cannot confirm a cancelled booking")
        
        # Check if already completed
        if booking.is_completed:
            raise serializers.ValidationError("Cannot confirm a completed booking")
        
        if booking.status == 'confirmed':
            raise serializers.ValidationError("Booking is already confirmed")
        
        return attrs
    
    def update(self, instance, validated_data):
        booking = instance
        booking.confirm()
        booking.save()
        return booking
