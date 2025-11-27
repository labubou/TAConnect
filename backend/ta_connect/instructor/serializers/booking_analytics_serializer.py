from rest_framework import serializers
from instructor.models import Booking
from datetime import datetime,date
from dateutil.relativedelta import relativedelta

class BookingAnalyticsSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=False, allow_null=True)
    end_date = serializers.DateField(required=False, allow_null=True)

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        # If both dates provided, ensure start is before or equal to end
        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError("start_date must be before or equal to end_date")

        today = date.today()
        if start_date and start_date > today:
            raise serializers.ValidationError("start_date cannot be in the future")
        if end_date and end_date > today:
            raise serializers.ValidationError("end_date cannot be in the future")
        return attrs
    def get_date_range(self):
        start_date = self.validated_data.get('start_date')
        end_date = self.validated_data.get('end_date')
        today = date.today()

        # If no dates provided, use current month
        if not start_date and not end_date:
            end_date = today
            start_date = today.replace(day=1)
            end_date = (today + relativedelta(months=1)).replace(day=1) - relativedelta(days=1)
        
        # If only start_date provided
        elif start_date and not end_date:
            end_date = (start_date + relativedelta(months=1)).replace(day=1) - relativedelta(days=1)
        
        # If only end_date provided
        elif end_date and not start_date:
            start_date = end_date.replace(day=1)

        return start_date, end_date
