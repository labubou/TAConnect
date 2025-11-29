"""
Tests for serializers (forms) in the instructor app.
Since this is a Django REST Framework project, we test serializers instead of forms.
Tests cover:
- Happy Path: Successful validation and data creation
- Validation: Invalid data returns validation errors
"""
from django.test import TestCase
import datetime
from instructor.models import OfficeHourSlot, BookingPolicy
from instructor.serializers.time_slots_serializer import TimeSlotSerializer
from instructor.tests.base import BaseTestCase


class TimeSlotSerializerTestCase(BaseTestCase):
    """
    Test cases for the TimeSlotSerializer.
    """
    
    def test_serializer_validation_happy_path(self):
        """Test serializer validation with valid time slot data."""
        instructor = self.create_instructor()
        
        data = {
            'course_name': 'Test Course',
            'section': 'A',
            'day_of_week': 'Mon',
            'start_time': '09:00:00',
            'end_time': '10:00:00',
            'duration_minutes': 15,
            'start_date': str(datetime.date.today()),
            'end_date': str(datetime.date.today() + datetime.timedelta(days=30)),
            'room': 'Room 101',
            'set_student_limit': 2
        }
        
        serializer = TimeSlotSerializer(
            data=data,
            context={'request': type('Request', (), {'user': instructor})()}
        )
        
        self.assertTrue(serializer.is_valid())
        
        # Test create method
        time_slot, time_slot_policy = serializer.save()
        self.assertIsNotNone(time_slot.id)
        self.assertEqual(time_slot.course_name, 'Test Course')
        self.assertEqual(time_slot.instructor, instructor)
        self.assertTrue(hasattr(time_slot, 'policy'))
        self.assertEqual(time_slot_policy.set_student_limit, 2)
    
    def test_serializer_validation_start_time_after_end_time(self):
        """Test serializer validation with start_time >= end_time."""
        instructor = self.create_instructor()
        
        data = {
            'course_name': 'Test Course',
            'day_of_week': 'Mon',
            'start_time': '10:00:00',
            'end_time': '09:00:00',  # End before start
            'start_date': str(datetime.date.today()),
            'end_date': str(datetime.date.today() + datetime.timedelta(days=30)),
            'room': 'Room 101',  # Required field
        }
        
        serializer = TimeSlotSerializer(
            data=data,
            context={'request': type('Request', (), {'user': instructor})()}
        )
        
        self.assertFalse(serializer.is_valid())
        # The error from validate() method is at top level
        # Check if 'time' key exists in errors (from validate() method)
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

