"""
Tests for API views/endpoints in the instructor app.
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
from instructor.models import OfficeHourSlot, BookingPolicy
from student.models import Booking
from instructor.tests.base import BaseTestCase


class GetUserSlotsViewTestCase(BaseTestCase):
    """
    Test cases for the GetUserSlotsView endpoint.
    """
    
    def setUp(self):
        super().setUp()
        self.get_slots_url = reverse('get-user-slots')  # Fixed: use hyphen
    
    def test_get_slots_happy_path(self):
        """Test successful retrieval of instructor slots (200 OK)."""
        instructor, token = self.create_and_authenticate_instructor()
        
        # Create some slots
        slot1, _ = self.create_office_hour_slot(instructor=instructor, course_name='Course 1')
        slot2, _ = self.create_office_hour_slot(instructor=instructor, course_name='Course 2')
        
        response = self.client.get(self.get_slots_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('slots', response.data)
        self.assertEqual(len(response.data['slots']), 2)
    
    def test_get_slots_only_own_slots(self):
        """Test that instructors only see their own slots."""
        instructor1, token1 = self.create_and_authenticate_instructor(username='instructor1')
        instructor2 = self.create_instructor(username='instructor2', email='instructor2@example.com')
        
        # Create slots for both instructors
        slot1, _ = self.create_office_hour_slot(instructor=instructor1, course_name='Course 1')
        slot2, _ = self.create_office_hour_slot(instructor=instructor2, course_name='Course 2')
        
        response = self.client.get(self.get_slots_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['slots']), 1)
        self.assertEqual(response.data['slots'][0]['course_name'], 'Course 1')
    
    def test_get_slots_security_unauthenticated(self):
        """Test accessing slots without authentication (401 Unauthorized)."""
        self.client.credentials()
        
        response = self.client.get(self.get_slots_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_get_slots_security_student_access(self):
        """Test that students cannot access instructor slots endpoint (403 Forbidden)."""
        student, token = self.create_and_authenticate_student()
        
        response = self.client.get(self.get_slots_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class GetUserBookingsViewTestCase(BaseTestCase):
    """
    Test cases for the GetUserBookingsView endpoint.
    """
    
    def setUp(self):
        super().setUp()
        # Use the actual URL path instead of reverse
        self.get_bookings_url = '/api/instructor/get-user-bookings/'
    
    def test_get_bookings_happy_path(self):
        """Test successful retrieval of instructor bookings (200 OK)."""
        instructor, token = self.create_and_authenticate_instructor()
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        
        # Create bookings with unique students
        student1 = self.create_student(username='student1', email='student1@example.com')
        student2 = self.create_student(username='student2', email='student2@example.com')
        
        booking1 = self.create_booking(office_hour_slot=slot, student=student1)
        booking2 = self.create_booking(office_hour_slot=slot, student=student2)
        
        response = self.client.get(self.get_bookings_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('bookings', response.data)
        self.assertGreaterEqual(len(response.data['bookings']), 2)
    
    def test_get_bookings_filter_by_status_pending(self):
        """Test filtering bookings by pending status."""
        instructor, token = self.create_and_authenticate_instructor()
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        
        # Create bookings with different statuses and unique students
        student1 = self.create_student(username='student_pending', email='student_pending@example.com')
        student2 = self.create_student(username='student_confirmed', email='student_confirmed@example.com')
        
        pending_booking = self.create_booking(office_hour_slot=slot, student=student1)
        pending_booking.status = 'pending'
        pending_booking.save()
        
        confirmed_booking = self.create_booking(office_hour_slot=slot, student=student2)
        confirmed_booking.status = 'confirmed'
        confirmed_booking.save()
        
        response = self.client.get(self.get_bookings_url, {'status': 'pending'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only get pending bookings
        for booking in response.data['bookings']:
            self.assertEqual(booking['status'], 'pending')
    
    def test_get_bookings_filter_by_status_confirmed(self):
        """Test filtering bookings by confirmed status."""
        instructor, token = self.create_and_authenticate_instructor()
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        
        student1 = self.create_student(username='student_conf1', email='student_conf1@example.com')
        student2 = self.create_student(username='student_pend1', email='student_pend1@example.com')
        
        confirmed_booking = self.create_booking(office_hour_slot=slot, student=student1)
        confirmed_booking.status = 'confirmed'
        confirmed_booking.save()
        
        pending_booking = self.create_booking(office_hour_slot=slot, student=student2)
        pending_booking.status = 'pending'
        pending_booking.save()
        
        response = self.client.get(self.get_bookings_url, {'status': 'confirmed'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for booking in response.data['bookings']:
            self.assertEqual(booking['status'], 'confirmed')
    
    def test_get_bookings_filter_by_status_completed(self):
        """Test filtering bookings by completed status."""
        instructor, token = self.create_and_authenticate_instructor()
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        
        student = self.create_student(username='student_completed', email='student_completed@example.com')
        
        completed_booking = self.create_booking(office_hour_slot=slot, student=student)
        completed_booking.status = 'completed'
        completed_booking.is_completed = True
        completed_booking.save()
        
        response = self.client.get(self.get_bookings_url, {'status': 'completed'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for booking in response.data['bookings']:
            self.assertEqual(booking['status'], 'completed')
    
    def test_get_bookings_filter_by_status_cancelled(self):
        """Test filtering bookings by cancelled status."""
        instructor, token = self.create_and_authenticate_instructor()
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        
        student = self.create_student(username='student_cancelled', email='student_cancelled@example.com')
        
        cancelled_booking = self.create_booking(office_hour_slot=slot, student=student)
        cancelled_booking.cancel()
        cancelled_booking.save()
        
        response = self.client.get(self.get_bookings_url, {'status': 'cancelled'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for booking in response.data['bookings']:
            self.assertEqual(booking['status'], 'cancelled')
    
    def test_get_bookings_filter_by_date_range(self):
        """Test filtering bookings by date range."""
        instructor, token = self.create_and_authenticate_instructor()
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        
        today = datetime.date.today()
        
        student1 = self.create_student(username='student_range1', email='student_range1@example.com')
        student2 = self.create_student(username='student_range2', email='student_range2@example.com')
        
        booking_in_range = self.create_booking(
            office_hour_slot=slot,
            student=student1,
            date=today + datetime.timedelta(days=1)
        )
        booking_out_of_range = self.create_booking(
            office_hour_slot=slot,
            student=student2,
            date=today + datetime.timedelta(days=10)
        )
        
        start_date = today.isoformat()
        end_date = (today + datetime.timedelta(days=5)).isoformat()
        
        response = self.client.get(
            self.get_bookings_url,
            {'start_date': start_date, 'end_date': end_date}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only return bookings within range
        booking_dates = [b['date'] for b in response.data['bookings']]
        self.assertIn(str(booking_in_range.date), booking_dates)
    
    def test_get_bookings_filter_by_status_and_date(self):
        """Test filtering bookings by both status and date range."""
        instructor, token = self.create_and_authenticate_instructor()
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        
        today = datetime.date.today()
        
        student1 = self.create_student(username='student_pend_range', email='student_pend_range@example.com')
        student2 = self.create_student(username='student_conf_range', email='student_conf_range@example.com')
        
        pending_in_range = self.create_booking(
            office_hour_slot=slot,
            student=student1,
            date=today + datetime.timedelta(days=1)
        )
        pending_in_range.status = 'pending'
        pending_in_range.save()
        
        confirmed_in_range = self.create_booking(
            office_hour_slot=slot,
            student=student2,
            date=today + datetime.timedelta(days=2)
        )
        confirmed_in_range.status = 'confirmed'
        confirmed_in_range.save()
        
        response = self.client.get(
            self.get_bookings_url,
            {
                'status': 'pending',
                'start_date': today.isoformat(),
                'end_date': (today + datetime.timedelta(days=5)).isoformat()
            }
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for booking in response.data['bookings']:
            self.assertEqual(booking['status'], 'pending')
    
    def test_get_bookings_security_unauthenticated(self):
        """Test that unauthenticated users cannot access bookings (401)."""
        self.client.credentials()
        
        response = self.client.get(self.get_bookings_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_get_bookings_security_student_access(self):
        """Test that students cannot access instructor bookings endpoint (403)."""
        student, token = self.create_and_authenticate_student()
        
        response = self.client.get(self.get_bookings_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_bookings_invalid_status(self):
        """Test that invalid status returns error (400)."""
        instructor, token = self.create_and_authenticate_instructor()
        
        response = self.client.get(self.get_bookings_url, {'status': 'invalid'})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class InstructorConfirmBookingViewTestCase(BaseTestCase):
    """
    Test cases for the InstructorConfirmBookingView endpoint.
    """
    
    def test_confirm_booking_happy_path(self):
        """Test successful booking confirmation (200 OK)."""
        instructor, token = self.create_and_authenticate_instructor()
        student = self.create_student()
        slot, _ = self.create_office_hour_slot(instructor=instructor)
        
        booking = self.create_booking(student=student, office_hour_slot=slot)
        booking.status = 'pending'
        booking.save()
        
        url = reverse('instructor-confirm-booking', kwargs={'pk': booking.id})  # Fixed: use hyphen
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['booking_id'], booking.id)
        
        # Verify booking was confirmed
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'confirmed')
    
    def test_confirm_booking_already_confirmed(self):
        """Test confirming an already confirmed booking (400 Bad Request)."""
        instructor, token = self.create_and_authenticate_instructor()
        student = self.create_student()
        slot, _ = self.create_office_hour_slot(instructor=instructor)
        
        booking = self.create_booking(student=student, office_hour_slot=slot)
        booking.status = 'confirmed'
        booking.save()
        
        url = reverse('instructor-confirm-booking', kwargs={'pk': booking.id})  # Fixed: use hyphen
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_confirm_booking_cancelled_booking(self):
        """Test confirming a cancelled booking (400 Bad Request)."""
        instructor, token = self.create_and_authenticate_instructor()
        student = self.create_student()
        slot, _ = self.create_office_hour_slot(instructor=instructor)
        
        booking = self.create_booking(student=student, office_hour_slot=slot)
        booking.cancel()
        booking.save()
        
        url = reverse('instructor-confirm-booking', kwargs={'pk': booking.id})  # Fixed: use hyphen
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_confirm_booking_completed_booking(self):
        """Test confirming a completed booking (400 Bad Request)."""
        instructor, token = self.create_and_authenticate_instructor()
        student = self.create_student()
        slot, _ = self.create_office_hour_slot(instructor=instructor)
        
        booking = self.create_booking(student=student, office_hour_slot=slot)
        booking.status = 'completed'
        booking.is_completed = True
        booking.save()
        
        url = reverse('instructor-confirm-booking', kwargs={'pk': booking.id})  # Fixed: use hyphen
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_confirm_booking_not_found(self):
        """Test confirming a non-existent booking (404 Not Found)."""
        instructor, token = self.create_and_authenticate_instructor()
        
        url = reverse('instructor-confirm-booking', kwargs={'pk': 99999})  # Fixed: use hyphen
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_confirm_booking_other_instructor(self):
        """Test confirming booking belonging to another instructor (404 Not Found)."""
        instructor1, token1 = self.create_and_authenticate_instructor(username='instructor1')
        instructor2 = self.create_instructor(username='instructor2', email='instructor2@example.com')
        student = self.create_student()
        slot, _ = self.create_office_hour_slot(instructor=instructor2)
        
        booking = self.create_booking(student=student, office_hour_slot=slot)
        booking.status = 'pending'
        booking.save()
        
        url = reverse('instructor-confirm-booking', kwargs={'pk': booking.id})  # Fixed: use hyphen
        response = self.client.post(url)
        
        # Should return 404 because booking doesn't belong to instructor1
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_confirm_booking_security_unauthenticated(self):
        """Test confirming booking without authentication (401 Unauthorized)."""
        instructor = self.create_instructor()
        student = self.create_student()
        slot, _ = self.create_office_hour_slot(instructor=instructor)
        booking = self.create_booking(student=student, office_hour_slot=slot)
        
        self.client.credentials()
        url = reverse('instructor-confirm-booking', kwargs={'pk': booking.id})  # Fixed: use hyphen
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_confirm_booking_security_student_access(self):
        """Test that students cannot confirm bookings (403 Forbidden)."""
        instructor = self.create_instructor()
        student, token = self.create_and_authenticate_student()
        slot, _ = self.create_office_hour_slot(instructor=instructor)
        booking = self.create_booking(student=student, office_hour_slot=slot)
        
        url = reverse('instructor-confirm-booking', kwargs={'pk': booking.id})  # Fixed: use hyphen
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class InstructorCancelBookingViewTestCase(BaseTestCase):
    """
    Test cases for the InstructorCancelBookingView endpoint.
    """
    
    def test_cancel_booking_happy_path(self):
        """Test successful booking cancellation by instructor (200 OK)."""
        instructor, token = self.create_and_authenticate_instructor()
        student = self.create_student()
        slot, _ = self.create_office_hour_slot(instructor=instructor)
        
        booking = self.create_booking(student=student, office_hour_slot=slot)
        
        url = reverse('instructor-cancel-booking', kwargs={'pk': booking.id})  # Fixed: use hyphen
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        # Verify booking was cancelled
        booking.refresh_from_db()
        self.assertTrue(booking.is_cancelled)
    
    def test_cancel_booking_already_cancelled(self):
        """Test cancelling an already cancelled booking (400 Bad Request)."""
        instructor, token = self.create_and_authenticate_instructor()
        student = self.create_student()
        slot, _ = self.create_office_hour_slot(instructor=instructor)
        
        booking = self.create_booking(student=student, office_hour_slot=slot)
        booking.cancel()
        booking.save()
        
        url = reverse('instructor-cancel-booking', kwargs={'pk': booking.id})  # Fixed: use hyphen
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_cancel_booking_security_unauthenticated(self):
        """Test cancelling booking without authentication (401 Unauthorized)."""
        instructor = self.create_instructor()
        student = self.create_student()
        slot, _ = self.create_office_hour_slot(instructor=instructor)
        booking = self.create_booking(student=student, office_hour_slot=slot)
        
        self.client.credentials()
        url = reverse('instructor-cancel-booking', kwargs={'pk': booking.id})  # Fixed: use hyphen
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class SearchInstructorsViewTestCase(BaseTestCase):
    """
    Test cases for the SearchInstructorsView endpoint.
    """
    
    def setUp(self):
        super().setUp()
        self.search_url = reverse('search-instructors')  # Fixed: use hyphen
    
    def test_search_instructors_happy_path(self):
        """Test successful instructor search (200 OK)."""
        student, token = self.create_and_authenticate_student()
        
        # Create some instructors
        self.create_instructor(username='john_doe', first_name='John', last_name='Doe')
        self.create_instructor(username='jane_smith', email='jane@example.com', first_name='Jane', last_name='Smith')
        
        response = self.client.get(self.search_url, {'query': 'john'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('instructors', response.data)
        self.assertEqual(len(response.data['instructors']), 1)
        self.assertEqual(response.data['instructors'][0]['username'], 'john_doe')
    
    def test_search_instructors_no_query_returns_all(self):
        """Test search without query returns all instructors."""
        student, token = self.create_and_authenticate_student()
        
        self.create_instructor(username='instructor1', email='inst1@example.com')
        self.create_instructor(username='instructor2', email='inst2@example.com')
        
        response = self.client.get(self.search_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['instructors']), 2)
    
    def test_search_instructors_security_unauthenticated(self):
        """Test searching without authentication (401 Unauthorized)."""
        self.client.credentials()
        
        response = self.client.get(self.search_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class InstructorDataViewTestCase(BaseTestCase):
    """
    Test cases for the InstructorDataView endpoint.
    """
    
    def test_get_instructor_data_happy_path(self):
        """Test successful retrieval of instructor data (200 OK)."""
        instructor = self.create_instructor(username='test_instructor')
        slot, _ = self.create_office_hour_slot(instructor=instructor, course_name='Test Course')
        
        url = reverse('get-instructor-data', kwargs={'user_id': instructor.id})  # Fixed: use hyphen
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], instructor.id)
        self.assertEqual(response.data['username'], 'test_instructor')
        self.assertIn('slots', response.data)
        self.assertEqual(len(response.data['slots']), 1)
    
    def test_get_instructor_data_not_found(self):
        """Test getting non-existent instructor (404 Not Found)."""
        url = reverse('get-instructor-data', kwargs={'user_id': 99999})  # Fixed: use hyphen
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_instructor_data_student_id(self):
        """Test getting student as instructor returns 404."""
        student = self.create_student()
        
        url = reverse('get-instructor-data', kwargs={'user_id': student.id})  # Fixed: use hyphen
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

