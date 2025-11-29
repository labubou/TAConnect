"""
Tests for API views/endpoints in the student app.
Tests cover:
- Happy Path: Successful requests (200/201 status codes)
- Validation: Invalid data returns 400 Bad Request
- Security: Unauthenticated users or wrong user types receive 401/403 errors
"""
from rest_framework import status
from django.urls import reverse
from django.utils import timezone
import datetime
from accounts.models import User
from instructor.models import OfficeHourSlot
from student.models import Booking
from student.tests.base import BaseTestCase


class BookingCreateViewTestCase(BaseTestCase):
    """
    Test cases for the BookingCreateView endpoint.
    """
    
    def setUp(self):
        super().setUp()
        self.create_booking_url = reverse('booking_create')
        self.get_bookings_url = reverse('booking_create')  # Same URL, different method
    
    def test_get_bookings_happy_path(self):
        """Test successful retrieval of student bookings (200 OK)."""
        student, token = self.create_and_authenticate_student()
        
        # Create some bookings
        booking1 = self.create_booking(student=student)
        booking2 = self.create_booking(student=student)
        
        response = self.client.get(self.get_bookings_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('bookings', response.data)
        self.assertGreaterEqual(len(response.data['bookings']), 2)
    
    def test_get_bookings_with_date_range(self):
        """Test getting bookings with date range parameters."""
        student, token = self.create_and_authenticate_student()
        
        today = datetime.date.today()
        booking1 = self.create_booking(
            student=student,
            date=today + datetime.timedelta(days=1)
        )
        booking2 = self.create_booking(
            student=student,
            date=today + datetime.timedelta(days=10)
        )
        
        date_from = (today + datetime.timedelta(days=1)).isoformat()
        date_to = (today + datetime.timedelta(days=5)).isoformat()
        
        response = self.client.get(
            self.get_bookings_url,
            {'date_from': date_from, 'date_to': date_to}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only get booking1 (within range)
        self.assertEqual(len(response.data['bookings']), 1)
    
    def test_create_booking_happy_path(self):
        """Test successful booking creation (201 Created)."""
        student, token = self.create_and_authenticate_student()
        slot, policy = self.create_office_hour_slot()
        
        booking_date = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
        start_time = slot.start_time.strftime('%H:%M:%S')
        
        data = {
            'slot_id': slot.id,
            'date': booking_date,
            'start_time': start_time
        }
        
        response = self.client.post(self.create_booking_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('booking_id', response.data)
        self.assertIn('message', response.data)
        
        # Verify booking was created
        booking = Booking.objects.get(id=response.data['booking_id'])
        self.assertEqual(booking.student, student)
        self.assertEqual(booking.office_hour, slot)
    
    def test_create_booking_validation_missing_slot_id(self):
        """Test booking creation with missing slot_id (400 Bad Request)."""
        student, token = self.create_and_authenticate_student()
        
        data = {
            'date': (datetime.date.today() + datetime.timedelta(days=1)).isoformat(),
            'start_time': '09:00:00'
        }
        
        response = self.client.post(self.create_booking_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_booking_validation_date_outside_range(self):
        """Test booking creation with date outside slot range (400 Bad Request)."""
        student, token = self.create_and_authenticate_student()
        slot, policy = self.create_office_hour_slot(
            start_date=datetime.date.today(),
            end_date=datetime.date.today() + datetime.timedelta(days=7)
        )
        
        # Try to book on a date outside the range
        booking_date = (datetime.date.today() + datetime.timedelta(days=10)).isoformat()
        start_time = slot.start_time.strftime('%H:%M:%S')
        
        data = {
            'slot_id': slot.id,
            'date': booking_date,
            'start_time': start_time
        }
        
        response = self.client.post(self.create_booking_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_booking_security_unauthenticated(self):
        """Test creating booking without authentication (401 Unauthorized)."""
        self.client.credentials()
        
        slot, policy = self.create_office_hour_slot()
        data = {
            'slot_id': slot.id,
            'date': (datetime.date.today() + datetime.timedelta(days=1)).isoformat(),
            'start_time': '09:00:00'
        }
        
        response = self.client.post(self.create_booking_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_booking_security_instructor_access(self):
        """Test that instructors cannot create bookings (403 Forbidden)."""
        instructor, token = self.create_and_authenticate_instructor()
        
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        data = {
            'slot_id': slot.id,
            'date': (datetime.date.today() + datetime.timedelta(days=1)).isoformat(),
            'start_time': '09:00:00'
        }
        
        response = self.client.post(self.create_booking_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class BookingDetailViewTestCase(BaseTestCase):
    """
    Test cases for the BookingDetailView endpoint.
    """
    
    def test_update_booking_happy_path(self):
        """Test successful booking update (200 OK)."""
        student, token = self.create_and_authenticate_student()
        booking = self.create_booking(student=student)
        
        new_date = (booking.date + datetime.timedelta(days=1)).isoformat()
        new_time = booking.office_hour.start_time.strftime('%H:%M:%S')
        
        data = {
            'new_date': new_date,
            'new_time': new_time
        }
        
        url = reverse('booking_detail', kwargs={'pk': booking.id})
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('success', response.data)
        self.assertTrue(response.data['success'])
        
        # Verify booking was updated
        booking.refresh_from_db()
        self.assertEqual(booking.date.isoformat(), new_date)
    
    def test_cancel_booking_happy_path(self):
        """Test successful booking cancellation (200 OK)."""
        student, token = self.create_and_authenticate_student()
        booking = self.create_booking(student=student)
        
        url = reverse('booking_detail', kwargs={'pk': booking.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('success', response.data)
        self.assertTrue(response.data['success'])
        
        # Verify booking was cancelled
        booking.refresh_from_db()
        self.assertTrue(booking.is_cancelled)
    
    def test_get_available_times_happy_path(self):
        """Test successful retrieval of available times (200 OK)."""
        student, token = self.create_and_authenticate_student()
        
        # Create a slot and find a date that matches the slot's day of week
        slot, policy = self.create_office_hour_slot(day_of_week='Mon')
        
        # Find the next Monday
        today = datetime.date.today()
        days_ahead = (0 - today.weekday()) % 7  # Monday is 0
        if days_ahead == 0:  # If today is Monday, use next Monday
            days_ahead = 7
        next_monday = today + datetime.timedelta(days=days_ahead)
        
        date = next_monday.isoformat()
        
        url = reverse('booking_detail', kwargs={'pk': slot.id})
        response = self.client.get(url, {'date': date})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('available_times', response.data)
        self.assertIn('slot_id', response.data)
    
    def test_update_booking_security_other_student(self):
        """Test that students cannot update other students' bookings (404 Not Found)."""
        student1, token1 = self.create_and_authenticate_student(username='student1')
        student2 = self.create_student(username='student2')
        
        booking = self.create_booking(student=student2)
        
        url = reverse('booking_detail', kwargs={'pk': booking.id})
        data = {
            'new_date': (datetime.date.today() + datetime.timedelta(days=1)).isoformat(),
            'new_time': '09:00:00'
        }
        
        response = self.client.patch(url, data, format='json')
        
        # Should return 404 because booking doesn't belong to student1
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_update_booking_security_unauthenticated(self):
        """Test updating booking without authentication (401 Unauthorized)."""
        booking = self.create_booking()
        
        self.client.credentials()
        url = reverse('booking_detail', kwargs={'pk': booking.id})
        data = {
            'new_date': (datetime.date.today() + datetime.timedelta(days=1)).isoformat(),
            'new_time': '09:00:00'
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_cancel_booking_security_other_student(self):
        """Test that students cannot cancel other students' bookings (404 Not Found)."""
        student1, token1 = self.create_and_authenticate_student(username='student1')
        student2 = self.create_student(username='student2')
        
        booking = self.create_booking(student=student2)
        
        url = reverse('booking_detail', kwargs={'pk': booking.id})
        response = self.client.delete(url)
        
        # Should return 404 because booking doesn't belong to student1
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

