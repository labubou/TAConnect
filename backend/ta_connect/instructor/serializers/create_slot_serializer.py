from requests import request
from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from instructor.models import OfficeHourSlot, BookingPolicy

class CreateSlotSerializer(serializers.Serializer):

    course_name = serializers.CharField(max_length=100)
    section = serializers.CharField(max_length=100, default=" ")
    day_of_week = serializers.ChoiceField(choices=['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    duration_minutes = serializers.IntegerField(default=10)
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    room = serializers.CharField(max_length=100)
    set_student_limit = serializers.IntegerField(default=1)

    def validate_set_student_limit(self, value):
        if value < 1:
            raise serializers.ValidationError("Student limit must be at least 1.")
        return value

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError({"time": "Start time must be before end time."})
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError({"date": "Start date must be on or before end date."})
        return data

    def create(self, validated_data):
        time_slot = OfficeHourSlot.objects.create(
            instructor=self.context['request'].user,
            course_name=validated_data['course_name'],
            section=validated_data['section'],
            start_time=validated_data['start_time'],
            end_time=validated_data['end_time'],
            day_of_week=validated_data['day_of_week'],
            duration_minutes=validated_data['duration_minutes'],
            start_date=validated_data['start_date'],
            end_date=validated_data['end_date'],
            room=validated_data['room'],
        )

        time_slot_policy = BookingPolicy.objects.create(
            office_hour_slot=time_slot,
            set_student_limit=validated_data['set_student_limit']
        )
        return time_slot, time_slot_policy
