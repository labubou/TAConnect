"""
Tests for serializers (forms) in the instructor app.
Since this is a Django REST Framework project, we test serializers instead of forms.
Tests cover:
- Happy Path: Successful validation and data creation
- Validation: Invalid data returns validation errors
"""
from django.test import TestCase
from django.utils import timezone
import datetime
from instructor.models import OfficeHourSlot, BookingPolicy
from instructor.serializers.get_user_booking_serializer import GetUserBookingSerializer
from instructor.serializers.time_slots_serializer import TimeSlotSerializer  # Updated import path
from instructor.tests.base import BaseTestCase


class GetUserBookingSerializerTestCase(BaseTestCase):
    """
    Test cases for the GetUserBookingSerializer.
    """
    
    def test_serializer_validation_happy_path_no_params(self):
        """Test serializer validation with no parameters."""
        serializer = GetUserBookingSerializer(data={})
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
    
    def test_serializer_validation_happy_path_with_dates(self):
        """Test serializer validation with valid date range."""
        data = {
            'start_date': '2025-01-01',
            'end_date': '2025-01-31'
        }
        serializer = GetUserBookingSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
    
    def test_serializer_validation_happy_path_with_status_pending(self):
        """Test serializer validation with pending status."""
        data = {'status': 'pending'}
        serializer = GetUserBookingSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
        self.assertEqual(serializer.validated_data['status'], 'pending')
    
    def test_serializer_validation_happy_path_with_status_confirmed(self):
        """Test serializer validation with confirmed status."""
        data = {'status': 'confirmed'}
        serializer = GetUserBookingSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
        self.assertEqual(serializer.validated_data['status'], 'confirmed')
    
    def test_serializer_validation_happy_path_with_status_completed(self):
        """Test serializer validation with completed status."""
        data = {'status': 'completed'}
        serializer = GetUserBookingSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
        self.assertEqual(serializer.validated_data['status'], 'completed')
    
    def test_serializer_validation_happy_path_with_status_cancelled(self):
        """Test serializer validation with cancelled status."""
        data = {'status': 'cancelled'}
        serializer = GetUserBookingSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
        self.assertEqual(serializer.validated_data['status'], 'cancelled')
    
    def test_serializer_validation_happy_path_all_params(self):
        """Test serializer validation with all parameters."""
        data = {
            'start_date': '2025-01-01',
            'end_date': '2025-01-31',
            'status': 'pending'
        }
        serializer = GetUserBookingSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
    
    def test_serializer_validation_invalid_status(self):
        """Test serializer validation with invalid status."""
        data = {'status': 'invalid_status'}
        serializer = GetUserBookingSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('status', serializer.errors)
    
    def test_serializer_validation_invalid_date_range(self):
        """Test serializer validation with start_date after end_date."""
        data = {
            'start_date': '2025-01-31',
            'end_date': '2025-01-01'
        }
        serializer = GetUserBookingSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_serializer_validation_null_status(self):
        """Test serializer validation with null status (allowed)."""
        data = {'status': None}
        serializer = GetUserBookingSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
        self.assertIsNone(serializer.validated_data.get('status'))
    
    def test_serializer_validation_only_start_date(self):
        """Test serializer validation with only start_date."""
        data = {'start_date': '2025-01-01'}
        serializer = GetUserBookingSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
    
    def test_serializer_validation_only_end_date(self):
        """Test serializer validation with only end_date."""
        data = {'end_date': '2025-01-31'}
        serializer = GetUserBookingSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")


class TimeSlotSerializerTestCase(BaseTestCase):
    """
    Test cases for the TimeSlotSerializer.
    """
    
    def test_serializer_validation_happy_path(self):
        """Test serializer validation with valid time slot data."""
        instructor = self.create_instructor()
        
        data = {
            'course_name': 'Test Course',
            'day_of_week': 'Mon',
            'start_time': '09:00:00',
            'end_time': '10:00:00',
            'duration_minutes': 15,
            'start_date': (datetime.date.today() + datetime.timedelta(days=1)).isoformat(),
            'end_date': (datetime.date.today() + datetime.timedelta(days=30)).isoformat(),
            'room': 'Room 101'
        }
        
        serializer = TimeSlotSerializer(
            data=data,
            context={'request': type('Request', (), {'user': instructor})()}
        )
        
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
    
    def test_serializer_validation_invalid_day_of_week(self):
        """Test serializer validation with invalid day of week."""
        instructor = self.create_instructor()
        
        data = {
            'course_name': 'Test Course',
            'day_of_week': 'InvalidDay',
            'start_time': '09:00:00',
            'end_time': '10:00:00',
            'duration_minutes': 15,
            'start_date': datetime.date.today().isoformat(),
            'end_date': (datetime.date.today() + datetime.timedelta(days=30)).isoformat(),
            'room': 'Room 101'
        }
        
        serializer = TimeSlotSerializer(
            data=data,
            context={'request': type('Request', (), {'user': instructor})()}
        )
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('day_of_week', serializer.errors)
    
    def test_serializer_validation_end_time_before_start_time(self):
        """Test serializer validation when end_time is before start_time."""
        instructor = self.create_instructor()
        
        data = {
            'course_name': 'Test Course',
            'day_of_week': 'Mon',
            'start_time': '10:00:00',
            'end_time': '09:00:00',  # Before start_time
            'duration_minutes': 15,
            'start_date': datetime.date.today().isoformat(),
            'end_date': (datetime.date.today() + datetime.timedelta(days=30)).isoformat(),
            'room': 'Room 101'
        }
        
        serializer = TimeSlotSerializer(
            data=data,
            context={'request': type('Request', (), {'user': instructor})()}
        )
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('time', serializer.errors)
    
    def test_serializer_validation_start_date_after_end_date(self):
        """Test serializer validation with start_date > end_date."""
        instructor = self.create_instructor()
        
        data = {
            'course_name': 'Test Course',
            'day_of_week': 'Mon',
            'start_time': '09:00:00',
            'end_time': '10:00:00',
            'start_date': str(datetime.date.today() + datetime.timedelta(days=30)),
            'end_date': str(datetime.date.today()),  # End before start
            'room': 'Room 101',  # Required field
        }
        
        serializer = TimeSlotSerializer(
            data=data,
            context={'request': type('Request', (), {'user': instructor})()}
        )
        
        self.assertFalse(serializer.is_valid())
        # The error from validate() method is at top level
        # Check if 'date' key exists in errors (from validate() method)
        self.assertIn('date', serializer.errors)
    
    def test_serializer_validation_invalid_student_limit(self):
        """Test serializer validation with invalid student limit."""
        instructor = self.create_instructor()
        
        data = {
            'course_name': 'Test Course',
            'day_of_week': 'Mon',
            'start_time': '09:00:00',
            'end_time': '10:00:00',
            'start_date': str(datetime.date.today()),
            'end_date': str(datetime.date.today() + datetime.timedelta(days=30)),
            'room': 'Room 101',  # Required field
            'set_student_limit': 0  # Invalid: must be at least 1
        }
        
        serializer = TimeSlotSerializer(
            data=data,
            context={'request': type('Request', (), {'user': instructor})()}
        )
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('set_student_limit', serializer.errors)
    
    def test_serializer_validation_optional_fields(self):
        """Test serializer with optional fields (section is optional, but room is required)."""
        instructor = self.create_instructor()
        
        data = {
            'course_name': 'Test Course',
            'day_of_week': 'Mon',
            'start_time': '09:00:00',
            'end_time': '10:00:00',
            'start_date': str(datetime.date.today()),
            'end_date': str(datetime.date.today() + datetime.timedelta(days=30)),
            'room': 'Room 101',  # Required field
            # section is optional
        }
        
        serializer = TimeSlotSerializer(
            data=data,
            context={'request': type('Request', (), {'user': instructor})()}
        )
        
        self.assertTrue(serializer.is_valid())
        
        time_slot, policy = serializer.save()
        self.assertEqual(time_slot.section, ' ')  # Default value
        self.assertEqual(time_slot.room, 'Room 101')
    
    def test_serializer_update_happy_path(self):
        """Test serializer update method with valid data."""
        slot, policy = self.create_office_hour_slot(
            course_name='Original Course',
            room='Original Room'
        )
        
        data = {
            'course_name': 'Updated Course',
            'room': 'Updated Room',
            'day_of_week': 'Tue',  # Keep other required fields
            'start_time': '09:00:00',
            'end_time': '10:00:00',
            'start_date': str(slot.start_date),
            'end_date': str(slot.end_date),
        }
        
        serializer = TimeSlotSerializer(
            instance=slot,
            data=data,
            partial=True
        )
        
        self.assertTrue(serializer.is_valid())
        
        updated_slot = serializer.save()
        self.assertEqual(updated_slot.course_name, 'Updated Course')
        self.assertEqual(updated_slot.room, 'Updated Room')
    
    def test_serializer_update_tracks_critical_fields(self):
        """Test that serializer update tracks critical field changes."""
        slot, policy = self.create_office_hour_slot(
            day_of_week='Mon',
            start_time='09:00:00',
            end_time='10:00:00'
        )
        
        # Format times and dates properly for the serializer
        # Note: We need to ensure start_time < end_time for validation to pass
        data = {
            'day_of_week': 'Tue',  # Critical field change
            'start_time': '10:00:00',  # Critical field change
            'end_time': '11:00:00',  # Must be after start_time for validation
            'start_date': slot.start_date.isoformat() if hasattr(slot.start_date, 'isoformat') else str(slot.start_date),
            'end_date': slot.end_date.isoformat() if hasattr(slot.end_date, 'isoformat') else str(slot.end_date),
            'course_name': slot.course_name,  # Non-critical
            'room': slot.room,  # Required field
        }
        
        serializer = TimeSlotSerializer(
            instance=slot,
            data=data,
            partial=True
        )
        
        self.assertTrue(serializer.is_valid(), f"Serializer validation failed: {serializer.errors}")
        
        updated_slot = serializer.save()
        self.assertTrue(hasattr(updated_slot, 'critical_fields_changed'))
        self.assertIn('day_of_week', updated_slot.critical_fields_changed)
        self.assertIn('start_time', updated_slot.critical_fields_changed)
        self.assertIn('end_time', updated_slot.critical_fields_changed)  # Also changed
        self.assertNotIn('course_name', updated_slot.critical_fields_changed)

