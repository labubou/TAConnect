"""
Tests for serializers (forms) in the student app.
Since this is a Django REST Framework project, we test serializers instead of forms.
Tests cover:
- Happy Path: Successful validation and data creation
- Validation: Invalid data returns validation errors
"""
from django.test import TestCase
from django.utils import timezone
import datetime
from student.models import Booking
from student.serializers.create_book_serializer import CreateBookingSerializer
from student.serializers.update_book_serializer import UpdateBookingSerializer
from student.serializers.cancel_book_serializer import CancelBookingSerializer
from student.tests.base import BaseTestCase


class CreateBookingSerializerTestCase(BaseTestCase):
    """
    Test cases for the CreateBookingSerializer.
    """
    
    def test_serializer_validation_happy_path(self):
        """Test serializer validation with valid booking data."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot()
        
        booking_date = datetime.date.today() + datetime.timedelta(days=1)
        start_time = slot.start_time
        
        data = {
            'slot_id': slot.id,
            'date': booking_date.isoformat(),
            'start_time': start_time.strftime('%H:%M:%S')
        }
        
        serializer = CreateBookingSerializer(
            data=data,
            context={
                'request': type('Request', (), {'user': student})(),
                'slot': slot
            }
        )
        
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
        
        # Test create method
        booking = serializer.save()
        self.assertIsNotNone(booking.id)
        self.assertEqual(booking.student, student)
        self.assertEqual(booking.office_hour, slot)
    
    def test_serializer_validation_date_outside_range(self):
        """Test serializer validation with date outside slot range."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot(
            start_date=datetime.date.today(),
            end_date=datetime.date.today() + datetime.timedelta(days=7)
        )
        
        # Date outside range
        booking_date = datetime.date.today() + datetime.timedelta(days=10)
        
        data = {
            'slot_id': slot.id,
            'date': booking_date.isoformat(),
            'start_time': slot.start_time.strftime('%H:%M:%S')
        }
        
        serializer = CreateBookingSerializer(
            data=data,
            context={
                'request': type('Request', (), {'user': student})(),
                'slot': slot
            }
        )
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_serializer_validation_booking_ends_after_slot(self):
        """Test serializer validation when booking ends after slot end time."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot(
            start_time='09:00:00',
            end_time='10:00:00',
            duration_minutes=30  # Booking would be 30 minutes
        )
        
        # Start time that would make booking end after slot end
        booking_date = datetime.date.today() + datetime.timedelta(days=1)
        start_time = datetime.time(9, 45)  # 9:45, ends at 10:15, but slot ends at 10:00
        
        data = {
            'slot_id': slot.id,
            'date': booking_date.isoformat(),
            'start_time': start_time.strftime('%H:%M:%S')
        }
        
        serializer = CreateBookingSerializer(
            data=data,
            context={
                'request': type('Request', (), {'user': student})(),
                'slot': slot
            }
        )
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_serializer_validation_inactive_slot(self):
        """Test serializer validation with inactive slot."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot(status=False)  # Inactive
        
        booking_date = datetime.date.today() + datetime.timedelta(days=1)
        
        data = {
            'slot_id': slot.id,
            'date': booking_date.isoformat(),
            'start_time': slot.start_time.strftime('%H:%M:%S')
        }
        
        serializer = CreateBookingSerializer(
            data=data,
            context={
                'request': type('Request', (), {'user': student})(),
                'slot': slot
            }
        )
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)


class ConfirmBookingSerializerTestCase(BaseTestCase):
    """
    Test cases for the ConfirmBookingSerializer.
    """
    
    def test_serializer_validation_happy_path(self):
        """Test serializer validation with valid confirm data."""
        from student.serializers.confirm_book_serializer import ConfirmBookingSerializer
        
        booking = self.create_booking()
        booking.status = 'pending'
        booking.save()
        
        serializer = ConfirmBookingSerializer(
            instance=booking,
            data={'status': 'confirmed'},
            partial=True
        )
        
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
        
        # Test update method
        confirmed_booking = serializer.save()
        self.assertEqual(confirmed_booking.status, 'confirmed')
    
    def test_serializer_validation_already_confirmed(self):
        """Test serializer validation when booking is already confirmed."""
        from student.serializers.confirm_book_serializer import ConfirmBookingSerializer
        
        booking = self.create_booking()
        booking.status = 'confirmed'
        booking.save()
        
        serializer = ConfirmBookingSerializer(
            instance=booking,
            data={'status': 'confirmed'},
            partial=True
        )
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_serializer_validation_cancelled_booking(self):
        """Test serializer validation when booking is cancelled."""
        from student.serializers.confirm_book_serializer import ConfirmBookingSerializer
        
        booking = self.create_booking()
        booking.cancel()
        booking.save()
        
        serializer = ConfirmBookingSerializer(
            instance=booking,
            data={'status': 'confirmed'},
            partial=True
        )
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_serializer_validation_completed_booking(self):
        """Test serializer validation when booking is completed."""
        from student.serializers.confirm_book_serializer import ConfirmBookingSerializer
        
        booking = self.create_booking()
        booking.status = 'completed'
        booking.is_completed = True
        booking.save()
        
        serializer = ConfirmBookingSerializer(
            instance=booking,
            data={'status': 'confirmed'},
            partial=True
        )
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)


class UpdateBookingSerializerTestCase(BaseTestCase):
    """
    Test cases for the UpdateBookingSerializer.
    """
    
    def test_serializer_validation_happy_path(self):
        """Test serializer validation with valid update data."""
        booking = self.create_booking()
        
        new_date = booking.date + datetime.timedelta(days=1)
        new_time = booking.office_hour.start_time
        
        data = {
            'new_date': new_date.isoformat(),
            'new_time': new_time.strftime('%H:%M:%S')
        }
        
        serializer = UpdateBookingSerializer(
            instance=booking,
            data=data
        )
        
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
        
        # Test update method
        updated_booking = serializer.save()
        self.assertEqual(updated_booking.date, new_date)
    
    def test_serializer_validation_booking_ends_after_slot(self):
        """Test serializer validation when updated booking ends after slot end time."""
        slot, policy = self.create_office_hour_slot(
            start_time='09:00:00',
            end_time='10:00:00',
            duration_minutes=30
        )
        booking = self.create_booking(office_hour_slot=slot)
        
        # New time that would make booking end after slot end
        new_date = booking.date
        new_time = datetime.time(9, 45)  # Ends at 10:15, but slot ends at 10:00
        
        data = {
            'new_date': new_date.isoformat(),
            'new_time': new_time.strftime('%H:%M:%S')
        }
        
        serializer = UpdateBookingSerializer(
            instance=booking,
            data=data
        )
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_serializer_update_clears_end_time(self):
        """Test that update clears end_time so it gets recalculated."""
        booking = self.create_booking()
        original_end_time = booking.end_time
        
        new_date = booking.date + datetime.timedelta(days=1)
        new_time = booking.office_hour.start_time
        
        data = {
            'new_date': new_date.isoformat(),
            'new_time': new_time.strftime('%H:%M:%S')
        }
        
        serializer = UpdateBookingSerializer(
            instance=booking,
            data=data
        )
        
        self.assertTrue(serializer.is_valid())
        updated_booking = serializer.save()
        
        # End time should be recalculated
        self.assertIsNotNone(updated_booking.end_time)
        self.assertNotEqual(updated_booking.end_time, original_end_time)
    
    def test_serializer_sets_pending_status(self):
        """Test that update sets booking status to pending."""
        booking = self.create_booking()
        booking.status = 'confirmed'
        booking.save()
        
        new_date = booking.date + datetime.timedelta(days=1)
        new_time = booking.office_hour.start_time
        
        data = {
            'new_date': new_date.isoformat(),
            'new_time': new_time.strftime('%H:%M:%S')
        }
        
        serializer = UpdateBookingSerializer(
            instance=booking,
            data=data
        )
        
        self.assertTrue(serializer.is_valid())
        updated_booking = serializer.save()
        
        # Verify status is set to pending
        self.assertEqual(updated_booking.status, 'pending')


class CancelBookingSerializerTestCase(BaseTestCase):
    """
    Test cases for the CancelBookingSerializer.
    """
    
    def test_serializer_validation_happy_path(self):
        """Test serializer validation with valid cancel data."""
        booking = self.create_booking()
        
        data = {
            'confirm': True
        }
        
        serializer = CancelBookingSerializer(
            instance=booking,
            data=data
        )
        
        self.assertTrue(serializer.is_valid())
        
        # Test update method
        cancelled_booking = serializer.save()
        self.assertTrue(cancelled_booking.is_cancelled)
    
    def test_serializer_validation_past_booking(self):
        """Test serializer validation when trying to cancel a past booking."""
        slot, policy = self.create_office_hour_slot()
        # Create booking in the past
        past_date = datetime.date.today() - datetime.timedelta(days=1)
        booking = self.create_booking(
            office_hour_slot=slot,
            date=past_date
        )
        
        data = {
            'confirm': True
        }
        
        serializer = CancelBookingSerializer(
            instance=booking,
            data=data
        )
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_serializer_validation_default_confirm(self):
        """Test that confirm defaults to True."""
        booking = self.create_booking()
        
        data = {}  # No confirm field
        
        serializer = CancelBookingSerializer(
            instance=booking,
            data=data
        )
        
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['confirm'], True)

