from rest_framework import serializers
from instructor.models import OfficeHourSlot, BookingPolicy

class TimeSlotSerializer(serializers.Serializer):

    course_name = serializers.CharField(max_length=100)
    section = serializers.CharField(max_length=100, default=" ", allow_blank=True, required=False)
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
    
    def update(self, instance, validated_data):
        # Track which critical time fields were changed
        critical_fields_changed = []
        critical_fields = ['start_time', 'end_time', 'day_of_week', 'duration_minutes', 'start_date', 'end_date']
        
        for field in critical_fields:
            if field in validated_data and getattr(instance, field) != validated_data[field]:
                critical_fields_changed.append(field)

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
        instance.policy.save()
        
        # Attach list of changed fields to instance for view to check
        instance.critical_fields_changed = critical_fields_changed
        return instance
