"""
Tests for Booking model in the student app.
Tests cover:
- Happy path: Successful creation and retrieval
- Validation: Model field validation
- Relationships: Foreign key relationships
- Business logic: End time calculation
"""
from django.test import TestCase
from django.db import IntegrityError
from django.utils import timezone
import datetime
from accounts.models import User, StudentProfile
from instructor.models import OfficeHourSlot, BookingPolicy
from student.models import Booking
from student.tests.base import BaseTestCase


class BookingModelTestCase(BaseTestCase):
    """
    Test cases for the Booking model.
    """
    
    def test_booking_creation_happy_path(self):
        """Test successful Booking creation with all required fields."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot()
        
        booking_date = datetime.date.today() + datetime.timedelta(days=1)
        start_time = datetime.datetime.combine(booking_date, slot.start_time)
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=booking_date,
            start_time=start_time
        )
        
        self.assertIsNotNone(booking.id)
        self.assertEqual(booking.student, student)
        self.assertEqual(booking.office_hour, slot)
        self.assertEqual(booking.date, booking_date)
        self.assertFalse(booking.is_cancelled)  # Default
        self.assertFalse(booking.is_completed)  # Default
    
    def test_booking_end_time_auto_calculation(self):
        """Test that end_time is automatically calculated from start_time and slot duration."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot(duration_minutes=15)
        
        booking_date = datetime.date.today() + datetime.timedelta(days=1)
        start_time = datetime.datetime.combine(booking_date, slot.start_time)
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=booking_date,
            start_time=start_time
        )
        
        # End time should be calculated automatically
        expected_end_time = start_time + datetime.timedelta(minutes=slot.duration_minutes)
        self.assertIsNotNone(booking.end_time)
        self.assertEqual(booking.end_time, expected_end_time)
    
    def test_booking_end_time_manual_setting(self):
        """Test that manually set end_time is preserved."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot(duration_minutes=10)
        
        booking_date = datetime.date.today() + datetime.timedelta(days=1)
        start_time = datetime.datetime.combine(booking_date, slot.start_time)
        manual_end_time = start_time + datetime.timedelta(minutes=20)
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=booking_date,
            start_time=start_time,
            end_time=manual_end_time
        )
        
        self.assertEqual(booking.end_time, manual_end_time)
    
    def test_booking_retrieval(self):
        """Test retrieving a booking from the database."""
        booking = self.create_booking()
        
        retrieved_booking = Booking.objects.get(id=booking.id)
        
        self.assertEqual(retrieved_booking.id, booking.id)
        self.assertEqual(retrieved_booking.student, booking.student)
        self.assertEqual(retrieved_booking.office_hour, booking.office_hour)
    
    def test_booking_student_foreign_key(self):
        """Test the student foreign key relationship."""
        student = self.create_student(username='teststudent')
        booking = self.create_booking(student=student)
        
        self.assertEqual(booking.student, student)
        self.assertIn(booking, student.bookings.all())
    
    def test_booking_office_hour_foreign_key(self):
        """Test the office_hour foreign key relationship."""
        slot, policy = self.create_office_hour_slot(course_name='Test Course')
        booking = self.create_booking(office_hour_slot=slot)
        
        self.assertEqual(booking.office_hour, slot)
        self.assertIn(booking, slot.bookings.all())
    
    def test_booking_cascade_delete_student(self):
        """Test that deleting a student deletes their bookings (CASCADE)."""
        student = self.create_student()
        booking = self.create_booking(student=student)
        booking_id = booking.id
        
        student.delete()
        
        # Booking should be deleted
        self.assertFalse(Booking.objects.filter(id=booking_id).exists())
    
    def test_booking_cascade_delete_office_hour(self):
        """Test that deleting an office hour slot deletes its bookings (CASCADE)."""
        slot, policy = self.create_office_hour_slot()
        booking = self.create_booking(office_hour_slot=slot)
        booking_id = booking.id
        
        slot.delete()
        
        # Booking should be deleted
        self.assertFalse(Booking.objects.filter(id=booking_id).exists())
    
    def test_booking_default_date(self):
        """Test that booking date defaults to today if not specified."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot()
        
        start_time = datetime.datetime.combine(
            datetime.date.today(),
            slot.start_time
        )
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            start_time=start_time
            # date not specified, should default to today
        )
        
        self.assertEqual(booking.date, datetime.date.today())
    
    def test_booking_str_representation(self):
        """Test the __str__ method of Booking."""
        student = self.create_student(username='teststudent')
        slot, policy = self.create_office_hour_slot(
            course_name='CS101',
            section='A'
        )
        
        booking = self.create_booking(
            student=student,
            office_hour_slot=slot
        )
        
        expected_str = f"teststudent -> CS101 A"
        self.assertEqual(str(booking), expected_str)
    
    def test_booking_is_cancelled_flag(self):
        """Test the is_cancelled flag."""
        booking = self.create_booking()
        
        self.assertFalse(booking.is_cancelled)
        
        booking.is_cancelled = True
        booking.save()
        
        booking.refresh_from_db()
        self.assertTrue(booking.is_cancelled)
    
    def test_booking_is_completed_flag(self):
        """Test the is_completed flag."""
        booking = self.create_booking()
        
        self.assertFalse(booking.is_completed)
        
        booking.is_completed = True
        booking.save()
        
        booking.refresh_from_db()
        self.assertTrue(booking.is_completed)
    
    def test_booking_created_at_auto_set(self):
        """Test that created_at is automatically set."""
        booking = self.create_booking()
        
        self.assertIsNotNone(booking.created_at)
        # Should be close to now (within 1 second)
        time_diff = abs((timezone.now() - booking.created_at).total_seconds())
        self.assertLess(time_diff, 1)
    
    def test_booking_end_time_timezone_aware(self):
        """Test that end_time is timezone-aware when auto-calculated."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot(duration_minutes=15)
        
        booking_date = datetime.date.today() + datetime.timedelta(days=1)
        start_time = datetime.datetime.combine(booking_date, slot.start_time)
        
        # Make start_time timezone-aware
        if timezone.is_naive(start_time):
            start_time = timezone.make_aware(start_time)
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=booking_date,
            start_time=start_time
        )
        
        # Verify end_time is timezone-aware
        self.assertIsNotNone(booking.end_time)
        self.assertTrue(timezone.is_aware(booking.end_time))
    
    def test_booking_start_time_timezone_aware(self):
        """Test that start_time remains timezone-aware after save."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot()
        
        booking_date = datetime.date.today() + datetime.timedelta(days=1)
        start_time = timezone.now() + datetime.timedelta(days=1)
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=booking_date,
            start_time=start_time
        )
        
        booking.refresh_from_db()
        self.assertTrue(timezone.is_aware(booking.start_time))
    
    def test_booking_status_sync_with_is_cancelled(self):
        """Test that status syncs correctly with is_cancelled flag."""
        booking = self.create_booking()
        
        # Set is_cancelled to True
        booking.is_cancelled = True
        booking.save()
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'cancelled')
        self.assertTrue(booking.is_cancelled)
    
    def test_booking_status_sync_with_is_completed(self):
        """Test that status syncs correctly with is_completed flag."""
        booking = self.create_booking()
        
        # Set is_completed to True
        booking.is_completed = True
        booking.save()
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'completed')
        self.assertTrue(booking.is_completed)
    
    def test_booking_pending_method(self):
        """Test the pending() helper method."""
        booking = self.create_booking()
        booking.status = 'confirmed'
        booking.save()
        
        booking.pending()
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'pending')
        self.assertFalse(booking.is_cancelled)
        self.assertFalse(booking.is_completed)
    
    def test_booking_confirm_method(self):
        """Test the confirm() helper method."""
        booking = self.create_booking()
        
        booking.confirm()
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'confirmed')
        self.assertFalse(booking.is_cancelled)
        self.assertFalse(booking.is_completed)
    
    def test_booking_cancel_method(self):
        """Test the cancel() helper method."""
        booking = self.create_booking()
        
        booking.cancel()
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'cancelled')
        self.assertTrue(booking.is_cancelled)
    
    def test_booking_complete_method(self):
        """Test the complete() helper method."""
        booking = self.create_booking()
        
        booking.complete()
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'completed')
        self.assertTrue(booking.is_completed)
    
    def test_booking_book_description_field(self):
        """Test the book_description field."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot()
        
        booking_date = datetime.date.today() + datetime.timedelta(days=1)
        start_time = datetime.datetime.combine(booking_date, slot.start_time)
        
        # Make timezone-aware
        if timezone.is_naive(start_time):
            start_time = timezone.make_aware(start_time)
        
        description = "Need help with homework assignment 3"
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=booking_date,
            start_time=start_time,
            book_description=description
        )
        
        self.assertEqual(booking.book_description, description)
    
    def test_booking_book_description_default_empty(self):
        """Test that book_description defaults to empty string."""
        booking = self.create_booking()
        
        # book_description should default to empty string
        self.assertEqual(booking.book_description, "")
    
    def test_booking_book_description_nullable(self):
        """Test that book_description can be blank or null."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot()
        
        booking_date = datetime.date.today() + datetime.timedelta(days=1)
        start_time = datetime.datetime.combine(booking_date, slot.start_time)
        
        if timezone.is_naive(start_time):
            start_time = timezone.make_aware(start_time)
        
        # Test with blank string
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=booking_date,
            start_time=start_time,
            book_description=""
        )
        
        self.assertEqual(booking.book_description, "")
    
    def test_booking_book_description_update(self):
        """Test updating the book_description field."""
        booking = self.create_booking()
        
        new_description = "Updated: Need help with midterm prep"
        booking.book_description = new_description
        booking.save()
        
        booking.refresh_from_db()
        self.assertEqual(booking.book_description, new_description)

