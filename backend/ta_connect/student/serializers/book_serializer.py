from rest_framework import serializers
from instructor.models import OfficeHourSlot, BookingPolicy
from student.models import Booking
import datetime

class UnifiedBookingSerializer(serializers.Serializer):
    # --- Fields for Booking (Create) ---
    date_str = serializers.CharField(max_length=100, required=False)
    start_time_str = serializers.CharField(max_length=100, required=False)
    
    # --- Fields for Update ---
    new_date = serializers.CharField(max_length=100, required=False)
    new_time = serializers.CharField(max_length=100, required=False)
    
    # --- Fields for Get Times ---
    date = serializers.CharField(max_length=100, required=False)

    # --- Field for Cancel ---
    is_cancel = serializers.BooleanField(required=False, default=False)

    # --- Field Validators (Run automatically if field is present) ---

    def validate_date_generic(self, value):
        """Helper for date validation"""
        try:
            date_obj = datetime.datetime.strptime(value, '%Y-%m-%d').date()
        except ValueError:
            raise serializers.ValidationError("Invalid date format. Use YYYY-MM-DD.")
        
        if date_obj < datetime.date.today():
            raise serializers.ValidationError("Cannot perform this action for a past date.")
        return date_obj

    def validate_time_generic(self, value):
        """Helper for time validation"""
        try:
            return datetime.datetime.strptime(value, '%H:%M').time()
        except ValueError:
            raise serializers.ValidationError("Invalid time format. Use HH:MM.")

    def validate_date_str(self, value): return self.validate_date_generic(value)
    def validate_new_date(self, value): return self.validate_date_generic(value)
    def validate_date(self, value): return self.validate_date_generic(value)
    
    def validate_start_time_str(self, value): return self.validate_time_generic(value)
    def validate_new_time(self, value): return self.validate_time_generic(value)

    # --- Main Validation Logic ---

    def validate(self, data):
        # 1. UPDATE or CANCEL (Instance exists)
        if self.instance:
            # Check if this is a cancellation request
            if data.get('is_cancel') is True:
                return self._validate_cancel(data)
            
            # Otherwise, it is an update request
            if 'new_date' in data and 'new_time' in data:
                return self._validate_update(data)
            
            raise serializers.ValidationError("For updates, 'new_date' and 'new_time' are required.")

        # 2. CREATE or GET TIMES (No Instance)
        else:
            if 'date_str' in data and 'start_time_str' in data:
                return self._validate_book(data)
            elif 'date' in data:
                return self._validate_get_times(data)
            
            raise serializers.ValidationError("Invalid inputs. Provide 'date_str' & 'start_time_str' for booking, or 'date' for viewing times.")

    # --- Specific Logic Blocks ---

    def _validate_book(self, data):
        slot = self.context.get('slot')
        if not slot:
            raise serializers.ValidationError("Slot context is missing.")

        # ... (Logic from BookSerializer) ...
        if not slot.instructor:
            raise serializers.ValidationError({'error': 'Instructor not assigned to this slot'})
        
        if not slot.status:
            raise serializers.ValidationError({'error': 'This slot is inactive'})

        if slot.day_of_week != data['date_str'].strftime('%a'):
            raise serializers.ValidationError({'error': 'Selected date does not match slot day of week'})

        slot_start = slot.start_time if isinstance(slot.start_time, datetime.time) else slot.start_time.time()
        slot_end = slot.end_time if isinstance(slot.end_time, datetime.time) else slot.end_time.time()

        if data['start_time_str'] < slot_start or data['start_time_str'] >= slot_end:
            raise serializers.ValidationError({'error': 'Selected time is outside the slot time range'})

        # Check duplicate
        start_datetime = datetime.datetime.combine(data['date_str'], data['start_time_str'])
        if Booking.objects.filter(office_hour=slot, date=data['date_str'], start_time=start_datetime, is_cancelled=False).exists():
            raise serializers.ValidationError({'error': 'This time is already booked'})

        # Prepare final data
        data['selected_date_str'] = data['date_str']
        data['start_datetime'] = start_datetime
        return data

    def _validate_update(self, data):
        existing_booking = self.instance # In update, instance is the Booking object
        slot = existing_booking.office_hour
        
        new_date = data['new_date']
        new_time = data['new_time']

        if slot.start_date > new_date or slot.end_date < new_date:
            raise serializers.ValidationError({'new_date': 'The new date is outside the valid range for this slot'})

        new_start_datetime = datetime.datetime.combine(new_date, new_time)
        
        # Check conflict excluding current booking
        time_conflict = Booking.objects.filter(
            office_hour=slot, date=new_date, start_time=new_start_datetime, is_cancelled=False
        ).exclude(id=existing_booking.id).exists()

        if time_conflict:
            raise serializers.ValidationError({'error': 'The new time slot is already booked'})

        data['new_start_datetime'] = new_start_datetime
        return data

    def _validate_cancel(self, data):
        booking = self.instance
        today = datetime.date.today()
        
        if booking.date < today:
            raise serializers.ValidationError({'error': 'Cannot cancel a booking for a past date'})
        
        # Add context for email if needed
        data['booking_date'] = booking.date
        return data

    def _validate_get_times(self, data):
        slot = self.context.get('slot')
        selected_date = data['date']
        
        if slot.start_date > selected_date or slot.end_date < selected_date:
            raise serializers.ValidationError({'error': 'This slot is not active on the selected date'})
        
        data['selected_date'] = selected_date
        return data

    # --- CRUD Operations ---

    def create(self, validated_data):
        # Handles Booking Creation
        return Booking.objects.create(
            office_hour=self.context['slot'],
            student=self.context['request'].user,
            date=validated_data['selected_date_str'],
            start_time=validated_data['start_datetime'],
        )

    def update(self, instance, validated_data):
        # Handles Update and Cancel
        if validated_data.get('is_cancel'):
            instance.is_cancelled = True
            instance.save()
            return instance
        
        # Normal Update
        instance.date = validated_data['new_date']
        instance.start_time = validated_data['new_start_datetime']
        instance.save()
        return instance