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
from instructor.tests.base import BaseTestCase


class GetUserSlotsViewTestCase(BaseTestCase):
    """
    Test cases for the GetUserSlotsView endpoint.
    """
    
    def setUp(self):
        super().setUp()
        self.get_user_slots_url = reverse('get-user-slots')
    
    def test_get_user_slots_happy_path(self):
        """Test successful retrieval of user slots (200 OK)."""
        instructor, token = self.create_and_authenticate_instructor()
        
        # Create some slots
        slot1, policy1 = self.create_office_hour_slot(
            instructor=instructor,
            course_name='Course 1'
        )
        slot2, policy2 = self.create_office_hour_slot(
            instructor=instructor,
            course_name='Course 2'
        )
        
        response = self.client.get(self.get_user_slots_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('slots', response.data)
        self.assertEqual(len(response.data['slots']), 2)
        
        # Verify slot data structure
        slot_data = response.data['slots'][0]
        self.assertIn('id', slot_data)
        self.assertIn('course_name', slot_data)
        self.assertIn('day_of_week', slot_data)
    
    def test_get_user_slots_security_unauthenticated(self):
        """Test accessing user slots without authentication (401 Unauthorized)."""
        self.client.credentials()  # Clear any credentials
        
        response = self.client.get(self.get_user_slots_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_get_user_slots_security_student_access(self):
        """Test that students cannot access instructor slots (403 Forbidden)."""
        student, token = self.create_and_authenticate_student()
        
        response = self.client.get(self.get_user_slots_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_user_slots_only_own_slots(self):
        """Test that instructor only sees their own slots."""
        instructor1, token1 = self.create_and_authenticate_instructor(username='instructor1')
        instructor2 = self.create_instructor(username='instructor2')
        
        # Create slots for both instructors
        slot1, policy1 = self.create_office_hour_slot(
            instructor=instructor1,
            course_name='Instructor 1 Course'
        )
        slot2, policy2 = self.create_office_hour_slot(
            instructor=instructor2,
            course_name='Instructor 2 Course'
        )
        
        response = self.client.get(self.get_user_slots_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['slots']), 1)
        self.assertEqual(response.data['slots'][0]['course_name'], 'Instructor 1 Course')


class TimeSlotCreateViewTestCase(BaseTestCase):
    """
    Test cases for the TimeSlotCreateView endpoint.
    """
    
    def setUp(self):
        super().setUp()
        self.create_time_slot_url = reverse('time-slots-create')
    
    def test_create_time_slot_happy_path(self):
        """Test successful time slot creation (201 Created)."""
        instructor, token = self.create_and_authenticate_instructor()
        
        data = {
            'course_name': 'New Course',
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
        
        response = self.client.post(self.create_time_slot_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('time_slot_id', response.data)
        self.assertIn('success', response.data)
        self.assertTrue(response.data['success'])
        
        # Verify slot was created
        slot = OfficeHourSlot.objects.get(id=response.data['time_slot_id'])
        self.assertEqual(slot.course_name, 'New Course')
        self.assertEqual(slot.instructor, instructor)
        
        # Verify policy was created
        self.assertTrue(hasattr(slot, 'policy'))
        self.assertEqual(slot.policy.set_student_limit, 2)
    
    def test_create_time_slot_validation_start_time_after_end_time(self):
        """Test time slot creation with start_time >= end_time (400 Bad Request)."""
        instructor, token = self.create_and_authenticate_instructor()
        
        data = {
            'course_name': 'Test Course',
            'day_of_week': 'Mon',
            'start_time': '10:00:00',
            'end_time': '09:00:00',  # End before start
            'start_date': str(datetime.date.today()),
            'end_date': str(datetime.date.today() + datetime.timedelta(days=30)),
        }
        
        response = self.client.post(self.create_time_slot_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_time_slot_validation_start_date_after_end_date(self):
        """Test time slot creation with start_date > end_date (400 Bad Request)."""
        instructor, token = self.create_and_authenticate_instructor()
        
        data = {
            'course_name': 'Test Course',
            'day_of_week': 'Mon',
            'start_time': '09:00:00',
            'end_time': '10:00:00',
            'start_date': str(datetime.date.today() + datetime.timedelta(days=30)),
            'end_date': str(datetime.date.today()),  # End before start
        }
        
        response = self.client.post(self.create_time_slot_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_time_slot_validation_invalid_student_limit(self):
        """Test time slot creation with invalid student limit (400 Bad Request)."""
        instructor, token = self.create_and_authenticate_instructor()
        
        data = {
            'course_name': 'Test Course',
            'day_of_week': 'Mon',
            'start_time': '09:00:00',
            'end_time': '10:00:00',
            'start_date': str(datetime.date.today()),
            'end_date': str(datetime.date.today() + datetime.timedelta(days=30)),
            'set_student_limit': 0  # Invalid: must be at least 1
        }
        
        response = self.client.post(self.create_time_slot_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_time_slot_security_unauthenticated(self):
        """Test creating time slot without authentication (401 Unauthorized)."""
        self.client.credentials()
        
        data = {
            'course_name': 'Test Course',
            'day_of_week': 'Mon',
            'start_time': '09:00:00',
            'end_time': '10:00:00',
            'start_date': str(datetime.date.today()),
            'end_date': str(datetime.date.today() + datetime.timedelta(days=30)),
        }
        
        response = self.client.post(self.create_time_slot_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_time_slot_security_student_access(self):
        """Test that students cannot create time slots (403 Forbidden)."""
        student, token = self.create_and_authenticate_student()
        
        data = {
            'course_name': 'Test Course',
            'day_of_week': 'Mon',
            'start_time': '09:00:00',
            'end_time': '10:00:00',
            'start_date': str(datetime.date.today()),
            'end_date': str(datetime.date.today() + datetime.timedelta(days=30)),
        }
        
        response = self.client.post(self.create_time_slot_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class SearchInstructorsViewTestCase(BaseTestCase):
    """
    Test cases for the SearchInstructorsView endpoint.
    """
    
    def setUp(self):
        super().setUp()
        self.search_instructors_url = reverse('search-instructors')
    
    def test_search_instructors_happy_path(self):
        """Test successful instructor search (200 OK)."""
        student, token = self.create_and_authenticate_student()
        
        # Create some instructors
        instructor1 = self.create_instructor(
            username='instructor1',
            first_name='John',
            last_name='Doe'
        )
        instructor2 = self.create_instructor(
            username='instructor2',
            first_name='Jane',
            last_name='Smith'
        )
        
        response = self.client.get(self.search_instructors_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('instructors', response.data)
        self.assertGreaterEqual(len(response.data['instructors']), 2)
    
    def test_search_instructors_with_query(self):
        """Test instructor search with query parameter (200 OK)."""
        student, token = self.create_and_authenticate_student()
        
        instructor1 = self.create_instructor(
            username='instructor1',
            first_name='John',
            last_name='Doe'
        )
        instructor2 = self.create_instructor(
            username='instructor2',
            first_name='Jane',
            last_name='Smith'
        )
        
        response = self.client.get(self.search_instructors_url, {'query': 'John'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('instructors', response.data)
        # Should find instructor with first name 'John'
        instructor_names = [inst['full_name'] for inst in response.data['instructors']]
        self.assertTrue(any('John' in name for name in instructor_names))
    
    def test_search_instructors_security_unauthenticated(self):
        """Test searching instructors without authentication (401 Unauthorized)."""
        self.client.credentials()
        
        response = self.client.get(self.search_instructors_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class InstructorDataViewTestCase(BaseTestCase):
    """
    Test cases for the InstructorDataView endpoint.
    """
    
    def test_get_instructor_data_happy_path(self):
        """Test successful retrieval of instructor data (200 OK)."""
        student, token = self.create_and_authenticate_student()
        
        instructor = self.create_instructor(
            username='testinstructor',
            first_name='Test',
            last_name='Instructor'
        )
        
        slot, policy = self.create_office_hour_slot(
            instructor=instructor,
            course_name='Test Course'
        )
        
        url = reverse('get-instructor-data', kwargs={'user_id': instructor.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], instructor.id)
        self.assertEqual(response.data['username'], 'testinstructor')
        self.assertIn('slots', response.data)
        self.assertEqual(len(response.data['slots']), 1)
    
    def test_get_instructor_data_not_found(self):
        """Test getting data for non-existent instructor (404 Not Found)."""
        student, token = self.create_and_authenticate_student()
        
        url = reverse('get-instructor-data', kwargs={'user_id': 99999})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)
    
    def test_get_instructor_data_security_unauthenticated(self):
        """Test accessing instructor data without authentication (401 Unauthorized)."""
        instructor = self.create_instructor()
        
        self.client.credentials()
        url = reverse('get-instructor-data', kwargs={'user_id': instructor.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

