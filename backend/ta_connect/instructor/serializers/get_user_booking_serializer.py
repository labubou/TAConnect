from rest_framework import serializers
from instructor.models import OfficeHourSlot, BookingPolicy
import datetime

class GetUserBookingSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=False, allow_null=True)
    end_date = serializers.DateField(required=False, allow_null=True)

    status = serializers.ChoiceField(
        choices=['pending', 'confirmed', 'completed', 'cancelled'],
        required=False, allow_null=True
    )

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        status = attrs.get('status')

        if status and status not in ['pending', 'confirmed', 'completed', 'cancelled']:
            raise serializers.ValidationError("Invalid status value.")

        # If both dates provided, ensure start is before or equal to end
        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError("start_date must be before or equal to end_date")

        return attrs