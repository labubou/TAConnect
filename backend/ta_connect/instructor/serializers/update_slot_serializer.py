from requests import request
from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from instructor.models import OfficeHourSlot, BookingPolicy

class UpdateSlotSerializer(serializers.Serializer):

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

    def update(self, instance, validated_data):
        instance.course_name = validated_data.get('course_name', instance.course_name)
        instance.section = validated_data.get('section', instance.section)
        instance.start_time = validated_data.get('start_time', instance.start_time)
        instance.end_time = validated_data.get('end_time', instance.end_time)
        instance.day_of_week = validated_data.get('day_of_week', instance.day_of_week)
        instance.duration_minutes = validated_data.get('duration_minutes', instance.duration_minutes)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        instance.room = validated_data.get('room', instance.room)
        instance.policy.set_student_limit = validated_data.get('set_student_limit', instance.policy.set_student_limit)
        instance.save()
        return instance
