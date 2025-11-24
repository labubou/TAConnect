from rest_framework import serializers
from instructor.models import OfficeHourSlot, BookingPolicy, AllowedStudents

class AllowedStudentsSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    first_name = serializers.CharField(max_length=100, default=" ")
    last_name = serializers.CharField(max_length=100, default=" ")
    id_number = serializers.CharField(max_length=100)
    email = serializers.EmailField()

    def validate_email(self, value):
        booking_policy = self.context['slot'].policy
        queryset = AllowedStudents.objects.filter(booking_policy=booking_policy, email=value)
        # Exclude current instance if updating
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("This email is already allowed for the given policy.")
        return value

    def validate_id_number(self, value):
        booking_policy = self.context['slot'].policy
        queryset = AllowedStudents.objects.filter(booking_policy=booking_policy, id_number=value)
        # Exclude current instance if updating
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("This ID number is already allowed for the given policy.")
        return value

    def create(self, validated_data):
        allowed_student = AllowedStudents.objects.create(
            booking_policy=self.context['slot'].policy,
            email=validated_data.get('email'),
            first_name=validated_data.get('first_name', ' '),
            last_name=validated_data.get('last_name', ' '),
            id_number=validated_data.get('id_number'),
        )

        return allowed_student
    
    def update(self, instance, validated_data):

        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.id_number = validated_data.get('id_number', instance.id_number)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance
