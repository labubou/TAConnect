"""
Tests for utility functions in the student app.
Tests cover:
- complete_booking: Marks bookings as completed based on timezone-aware comparison
- cancel_student_bookings: Cancels bookings with status filtering
"""
from django.test import TestCase
from django.utils import timezone
import datetime
import uuid
from student.models import Booking
from student.utils.complete_book import complete_booking
from student.utils.cancel_student_bookings import cancel_student_bookings
from student.tests.base import BaseTestCase


class CompleteBookingTestCase(BaseTestCase):
    """
    Test cases for the complete_booking utility function.
    Tests timezone-aware datetime comparisons.
    """
    
    def test_complete_booking_happy_path_confirmed(self):
        """Test completing a confirmed booking that has ended."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot()
        
        # Create a booking in the past (ended)
        past_date = datetime.date.today() - datetime.timedelta(days=1)
        past_time = timezone.now() - datetime.timedelta(hours=2)
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=past_date,
            start_time=past_time,
            status='confirmed'
        )
        # Manually set end_time to be in the past
        booking.end_time = past_time + datetime.timedelta(minutes=slot.duration_minutes)
        booking.save()
        
        success, message = complete_booking(booking)
        
        self.assertTrue(success)
        self.assertEqual(message, "Booking marked as completed.")
        booking.refresh_from_db()
        self.assertTrue(booking.is_completed)
        self.assertEqual(booking.status, 'completed')
    
    def test_complete_booking_happy_path_pending_cancelled(self):
        """Test that pending booking that has ended is cancelled."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot()
        
        # Create a booking in the past (ended)
        past_date = datetime.date.today() - datetime.timedelta(days=1)
        past_time = timezone.now() - datetime.timedelta(hours=2)
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=past_date,
            start_time=past_time,
            status='pending'
        )
        # Manually set end_time to be in the past
        booking.end_time = past_time + datetime.timedelta(minutes=slot.duration_minutes)
        booking.save()
        
        success, message = complete_booking(booking)
        
        self.assertTrue(success)
        self.assertEqual(message, "Booking was pending and is now cancelled.")
        booking.refresh_from_db()
        self.assertTrue(booking.is_cancelled)
        self.assertEqual(booking.status, 'cancelled')
    
    def test_complete_booking_not_ended_yet(self):
        """Test that booking that hasn't ended yet is not completed."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot()
        
        # Create a booking in the future
        future_date = datetime.date.today() + datetime.timedelta(days=1)
        future_time = timezone.now() + datetime.timedelta(hours=2)
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=future_date,
            start_time=future_time,
            status='confirmed'
        )
        # End time is also in the future
        booking.end_time = future_time + datetime.timedelta(minutes=slot.duration_minutes)
        booking.save()
        
        success, message = complete_booking(booking)
        
        self.assertFalse(success)
        self.assertEqual(message, "Booking has not ended yet.")
        booking.refresh_from_db()
        self.assertFalse(booking.is_completed)
        self.assertEqual(booking.status, 'confirmed')
    
    def test_complete_booking_already_cancelled(self):
        """Test that cancelled booking cannot be completed."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot()
        
        # Create a booking in the past (ended)
        past_date = datetime.date.today() - datetime.timedelta(days=1)
        past_time = timezone.now() - datetime.timedelta(hours=2)
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=past_date,
            start_time=past_time,
            status='pending'
        )
        # Set end_time to be in the past
        booking.end_time = past_time + datetime.timedelta(minutes=slot.duration_minutes)
        booking.save()
        
        # Now cancel it
        booking.cancel()
        booking.save()
        
        success, message = complete_booking(booking)
        
        self.assertFalse(success)
        self.assertEqual(message, "Booking status invalid.")
    
    def test_complete_booking_already_completed(self):
        """Test that completed booking cannot be completed again."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot()
        
        # Create a booking in the past (ended)
        past_date = datetime.date.today() - datetime.timedelta(days=1)
        past_time = timezone.now() - datetime.timedelta(hours=2)
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=past_date,
            start_time=past_time,
            status='confirmed'
        )
        # Set end_time to be in the past
        booking.end_time = past_time + datetime.timedelta(minutes=slot.duration_minutes)
        booking.save()
        
        # Mark it as completed
        booking.status = 'completed'
        booking.is_completed = True
        booking.save()
        
        success, message = complete_booking(booking)
        
        self.assertFalse(success)
        self.assertEqual(message, "Booking status invalid.")
    
    def test_complete_booking_no_end_time(self):
        """Test that booking without end_time returns error."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot()
        
        past_time = timezone.now() - datetime.timedelta(hours=2)
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=datetime.date.today() - datetime.timedelta(days=1),
            start_time=past_time,
            status='confirmed'
        )
        # Force end_time to None
        Booking.objects.filter(id=booking.id).update(end_time=None)
        booking.refresh_from_db()
        
        success, message = complete_booking(booking)
        
        self.assertFalse(success)
        # When end_time is None, is_ended returns False, so message is "Booking has not ended yet."
        self.assertEqual(message, "Booking has not ended yet.")
    
    def test_complete_booking_timezone_aware_comparison(self):
        """Test that timezone-aware datetimes are compared correctly."""
        student = self.create_student()
        slot, policy = self.create_office_hour_slot()
        
        # Create a booking that just ended (1 minute ago)
        now = timezone.now()
        past_time = now - datetime.timedelta(minutes=slot.duration_minutes + 1)
        
        booking = Booking.objects.create(
            student=student,
            office_hour=slot,
            date=datetime.date.today(),
            start_time=past_time,
            status='confirmed'
        )
        # End time should be in the past
        booking.end_time = past_time + datetime.timedelta(minutes=slot.duration_minutes)
        booking.save()
        
        # Verify end_time is timezone-aware
        self.assertTrue(timezone.is_aware(booking.end_time))
        
        success, message = complete_booking(booking)
        
        self.assertTrue(success)
        booking.refresh_from_db()
        self.assertTrue(booking.is_completed)


class CancelStudentBookingsTestCase(BaseTestCase):
    """
    Test cases for the cancel_student_bookings utility function.
    Tests status filtering for cancellation.
    """
    
    def _unique_id(self):
        """Generate a unique identifier for test data."""
        return str(uuid.uuid4())[:8]
    
    def test_cancel_bookings_happy_path(self):
        """Test cancelling all active bookings for a slot."""
        instructor = self.create_instructor()
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        
        # Create multiple bookings with unique students
        uid1 = self._unique_id()
        uid2 = self._unique_id()
        
        student1 = self.create_student(username=f'student_{uid1}', email=f'student_{uid1}@example.com')
        student2 = self.create_student(username=f'student_{uid2}', email=f'student_{uid2}@example.com')
        
        booking1 = self.create_booking(office_hour_slot=slot, student=student1)
        booking1.status = 'pending'
        booking1.save()
        
        booking2 = self.create_booking(office_hour_slot=slot, student=student2)
        booking2.status = 'confirmed'
        booking2.save()
        
        message, error = cancel_student_bookings(slot, cancellation_reason='manual')
        
        self.assertIsNone(error)
        self.assertIn('Cancelled 2 bookings', message)
        
        booking1.refresh_from_db()
        booking2.refresh_from_db()
        self.assertTrue(booking1.is_cancelled)
        self.assertTrue(booking2.is_cancelled)
    
    def test_cancel_bookings_excludes_completed(self):
        """Test that completed bookings are not cancelled."""
        instructor = self.create_instructor()
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        
        uid = self._unique_id()
        student = self.create_student(username=f'student_{uid}', email=f'student_{uid}@example.com')
        
        # Create a completed booking
        booking = self.create_booking(office_hour_slot=slot, student=student)
        booking.status = 'completed'
        booking.is_completed = True
        booking.save()
        
        message, error = cancel_student_bookings(slot, cancellation_reason='manual')
        
        self.assertIsNone(error)
        self.assertEqual(message, "No bookings to cancel.")
        
        booking.refresh_from_db()
        self.assertFalse(booking.is_cancelled)
        self.assertEqual(booking.status, 'completed')
    
    def test_cancel_bookings_excludes_already_cancelled(self):
        """Test that already cancelled bookings are not affected."""
        instructor = self.create_instructor()
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        
        uid = self._unique_id()
        student = self.create_student(username=f'student_{uid}', email=f'student_{uid}@example.com')
        
        # Create an already cancelled booking
        booking = self.create_booking(office_hour_slot=slot, student=student)
        booking.cancel()
        booking.save()
        
        message, error = cancel_student_bookings(slot, cancellation_reason='manual')
        
        self.assertIsNone(error)
        self.assertEqual(message, "No bookings to cancel.")
    
    def test_cancel_bookings_filters_by_status(self):
        """Test that only pending and confirmed bookings are cancelled."""
        instructor = self.create_instructor()
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        
        # Create bookings with various statuses and unique students
        uid1, uid2, uid3, uid4 = self._unique_id(), self._unique_id(), self._unique_id(), self._unique_id()
        
        student1 = self.create_student(username=f'student_{uid1}', email=f'student_{uid1}@example.com')
        student2 = self.create_student(username=f'student_{uid2}', email=f'student_{uid2}@example.com')
        student3 = self.create_student(username=f'student_{uid3}', email=f'student_{uid3}@example.com')
        student4 = self.create_student(username=f'student_{uid4}', email=f'student_{uid4}@example.com')
        
        pending_booking = self.create_booking(office_hour_slot=slot, student=student1)
        pending_booking.status = 'pending'
        pending_booking.save()
        
        confirmed_booking = self.create_booking(office_hour_slot=slot, student=student2)
        confirmed_booking.status = 'confirmed'
        confirmed_booking.save()
        
        completed_booking = self.create_booking(office_hour_slot=slot, student=student3)
        completed_booking.status = 'completed'
        completed_booking.is_completed = True
        completed_booking.save()
        
        cancelled_booking = self.create_booking(office_hour_slot=slot, student=student4)
        cancelled_booking.status = 'cancelled'
        cancelled_booking.is_cancelled = True
        cancelled_booking.save()
        
        message, error = cancel_student_bookings(slot, cancellation_reason='manual')
        
        self.assertIsNone(error)
        self.assertIn('Cancelled 2 bookings', message)
        
        pending_booking.refresh_from_db()
        confirmed_booking.refresh_from_db()
        completed_booking.refresh_from_db()
        cancelled_booking.refresh_from_db()
        
        self.assertTrue(pending_booking.is_cancelled)
        self.assertTrue(confirmed_booking.is_cancelled)
        self.assertEqual(completed_booking.status, 'completed')  # Unchanged
        self.assertEqual(cancelled_booking.status, 'cancelled')  # Already cancelled
    
    def test_cancel_bookings_with_custom_queryset(self):
        """Test cancelling specific bookings passed as queryset."""
        instructor = self.create_instructor()
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        
        uid1, uid2 = self._unique_id(), self._unique_id()
        
        student1 = self.create_student(username=f'student_{uid1}', email=f'student_{uid1}@example.com')
        student2 = self.create_student(username=f'student_{uid2}', email=f'student_{uid2}@example.com')
        
        booking1 = self.create_booking(office_hour_slot=slot, student=student1)
        booking2 = self.create_booking(office_hour_slot=slot, student=student2)
        
        # Pass only booking1 as queryset
        bookings = Booking.objects.filter(id=booking1.id)
        
        message, error = cancel_student_bookings(slot, bookings=bookings, cancellation_reason='manual')
        
        self.assertIsNone(error)
        self.assertIn('Cancelled 1 bookings', message)
        
        booking1.refresh_from_db()
        booking2.refresh_from_db()
        
        self.assertTrue(booking1.is_cancelled)
        self.assertFalse(booking2.is_cancelled)
    
    def test_cancel_bookings_no_slot_with_bookings(self):
        """Test cancelling bookings without a slot (using bookings queryset only)."""
        uid = self._unique_id()
        student = self.create_student(username=f'student_{uid}', email=f'student_{uid}@example.com')
        booking = self.create_booking(student=student)
        booking.status = 'pending'
        booking.save()
        
        bookings = Booking.objects.filter(id=booking.id)
        
        message, error = cancel_student_bookings(None, bookings=bookings, cancellation_reason='manual')
        
        self.assertIsNone(error)
        self.assertIn('Cancelled 1 bookings', message)
        
        booking.refresh_from_db()
        self.assertTrue(booking.is_cancelled)
