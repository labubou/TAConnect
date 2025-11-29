"""
Tests for instructor models (OfficeHourSlot, BookingPolicy, AllowedStudents).
Tests cover:
- Happy path: Successful creation and retrieval
- Validation: Model field validation
- Relationships: Foreign key and one-to-one relationships
"""
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils import timezone
import datetime
from accounts.models import User, InstructorProfile
from instructor.models import OfficeHourSlot, BookingPolicy, AllowedStudents
from instructor.tests.base import BaseTestCase


class OfficeHourSlotModelTestCase(BaseTestCase):
    """
    Test cases for the OfficeHourSlot model.
    """
    
    def test_office_hour_slot_creation_happy_path(self):
        """Test successful OfficeHourSlot creation with all required fields."""
        instructor = self.create_instructor()
        slot = OfficeHourSlot.objects.create(
            instructor=instructor,
            course_name='Test Course',
            section='A',
            day_of_week='Mon',
            start_time=datetime.time(9, 0),
            end_time=datetime.time(10, 0),
            duration_minutes=10,
            start_date=datetime.date.today(),
            end_date=datetime.date.today() + datetime.timedelta(days=30),
            room='Room 101',
            status=True
        )
        
        self.assertIsNotNone(slot.id)
        self.assertEqual(slot.course_name, 'Test Course')
        self.assertEqual(slot.section, 'A')
        self.assertEqual(slot.day_of_week, 'Mon')
        self.assertEqual(slot.duration_minutes, 10)
        self.assertEqual(slot.room, 'Room 101')
        self.assertTrue(slot.status)
        self.assertEqual(slot.instructor, instructor)
    
    def test_office_hour_slot_creation_minimal_fields(self):
        """Test OfficeHourSlot creation with minimal required fields."""
        instructor = self.create_instructor()
        slot = OfficeHourSlot.objects.create(
            instructor=instructor,
            course_name='Minimal Course',
            day_of_week='Tue',
            start_time=datetime.time(10, 0),
            end_time=datetime.time(11, 0),
            start_date=datetime.date.today(),
            end_date=datetime.date.today() + datetime.timedelta(days=7)
        )
        
        self.assertIsNotNone(slot.id)
        self.assertEqual(slot.course_name, 'Minimal Course')
        self.assertEqual(slot.duration_minutes, 10)  # Default value
        self.assertEqual(slot.room, 'TBA')  # Default value
        self.assertTrue(slot.status)  # Default value
    
    def test_office_hour_slot_retrieval(self):
        """Test retrieving an OfficeHourSlot from the database."""
        slot, policy = self.create_office_hour_slot(
            course_name='Retrieve Course',
            day_of_week='Wed'
        )
        
        retrieved_slot = OfficeHourSlot.objects.get(id=slot.id)
        
        self.assertEqual(retrieved_slot.course_name, 'Retrieve Course')
        self.assertEqual(retrieved_slot.day_of_week, 'Wed')
    
    def test_office_hour_slot_day_of_week_choices(self):
        """Test that day_of_week must be one of the valid choices."""
        instructor = self.create_instructor(username='instructor_mon')
        slot, policy = self.create_office_hour_slot(instructor=instructor, day_of_week='Mon')
        self.assertEqual(slot.day_of_week, 'Mon')
        
        instructor2 = self.create_instructor(username='instructor_sun')
        slot2, policy2 = self.create_office_hour_slot(instructor=instructor2, day_of_week='Sun')
        self.assertEqual(slot2.day_of_week, 'Sun')
    
    def test_office_hour_slot_instructor_foreign_key(self):
        """Test the instructor foreign key relationship."""
        instructor = self.create_instructor(username='instructor1')
        slot, policy = self.create_office_hour_slot(instructor=instructor)
        
        self.assertEqual(slot.instructor, instructor)
        self.assertIn(slot, instructor.office_hours.all())
    
    def test_office_hour_slot_instructor_can_be_null(self):
        """Test that instructor can be null (on_delete=models.SET_NULL)."""
        slot = OfficeHourSlot.objects.create(
            instructor=None,
            course_name='No Instructor',
            day_of_week='Thu',
            start_time=datetime.time(14, 0),
            end_time=datetime.time(15, 0),
            start_date=datetime.date.today(),
            end_date=datetime.date.today() + datetime.timedelta(days=7)
        )
        
        self.assertIsNone(slot.instructor)
    
    def test_office_hour_slot_is_time_available_no_bookings(self):
        """Test is_time_available method when there are no bookings."""
        slot, policy = self.create_office_hour_slot()
        
        check_date = datetime.date.today() + datetime.timedelta(days=1)
        check_start_time = datetime.datetime.combine(check_date, datetime.time(9, 0))
        
        self.assertTrue(slot.is_time_available(check_date, check_start_time))
    
    def test_office_hour_slot_str_representation(self):
        """Test the __str__ method of OfficeHourSlot."""
        slot, policy = self.create_office_hour_slot(
            course_name='CS101',
            section='A',
            day_of_week='Fri',
            start_time='09:00:00',
            end_time='10:00:00'
        )
        
        expected_str = "CS101 - A Fri 09:00:00-10:00:00"
        self.assertEqual(str(slot), expected_str)


class BookingPolicyModelTestCase(BaseTestCase):
    """
    Test cases for the BookingPolicy model.
    """
    
    def test_booking_policy_creation_happy_path(self):
        """Test successful BookingPolicy creation."""
        slot, policy = self.create_office_hour_slot()
        
        self.assertIsNotNone(policy.id)
        self.assertEqual(policy.office_hour_slot, slot)
        self.assertFalse(policy.require_specific_email)  # Default
        self.assertEqual(policy.set_student_limit, 1)  # Default
    
    def test_booking_policy_one_to_one_relationship(self):
        """Test that one slot can only have one policy."""
        slot, policy = self.create_office_hour_slot()
        
        # Try to create another policy for the same slot (should fail)
        with self.assertRaises(IntegrityError):
            BookingPolicy.objects.create(office_hour_slot=slot)
    
    def test_booking_policy_retrieval(self):
        """Test retrieving a BookingPolicy."""
        slot, policy = self.create_office_hour_slot()
        
        retrieved_policy = BookingPolicy.objects.get(office_hour_slot=slot)
        self.assertEqual(retrieved_policy.id, policy.id)
    
    def test_booking_policy_cascade_delete(self):
        """Test that deleting a slot deletes its policy."""
        slot, policy = self.create_office_hour_slot()
        policy_id = policy.id
        
        slot.delete()
        
        # Policy should be deleted
        self.assertFalse(BookingPolicy.objects.filter(id=policy_id).exists())
    
    def test_booking_policy_str_representation(self):
        """Test the __str__ method of BookingPolicy."""
        slot, policy = self.create_office_hour_slot(course_name='Test Course')
        
        expected_str = f"Policy for {slot}"
        self.assertEqual(str(policy), expected_str)


class AllowedStudentsModelTestCase(BaseTestCase):
    """
    Test cases for the AllowedStudents model.
    """
    
    def test_allowed_students_creation_happy_path(self):
        """Test successful AllowedStudents creation."""
        slot, policy = self.create_office_hour_slot()
        
        allowed_student = AllowedStudents.objects.create(
            booking_policy=policy,
            first_name='John',
            last_name='Doe',
            id_number='12345',
            email='john.doe@example.com'
        )
        
        self.assertIsNotNone(allowed_student.id)
        self.assertEqual(allowed_student.booking_policy, policy)
        self.assertEqual(allowed_student.first_name, 'John')
        self.assertEqual(allowed_student.last_name, 'Doe')
        self.assertEqual(allowed_student.id_number, '12345')
        self.assertEqual(allowed_student.email, 'john.doe@example.com')
    
    def test_allowed_students_retrieval(self):
        """Test retrieving an AllowedStudents record."""
        slot, policy = self.create_office_hour_slot()
        allowed_student = AllowedStudents.objects.create(
            booking_policy=policy,
            first_name='Jane',
            last_name='Smith',
            id_number='67890',
            email='jane.smith@example.com'
        )
        
        retrieved = AllowedStudents.objects.get(id=allowed_student.id)
        self.assertEqual(retrieved.email, 'jane.smith@example.com')
    
    def test_allowed_students_unique_together_constraint(self):
        """Test that the same email cannot be added twice to the same policy."""
        slot, policy = self.create_office_hour_slot()
        
        AllowedStudents.objects.create(
            booking_policy=policy,
            first_name='Test',
            last_name='User',
            id_number='11111',
            email='test@example.com'
        )
        
        # Try to create another with same email and policy (should fail)
        with self.assertRaises(IntegrityError):
            AllowedStudents.objects.create(
                booking_policy=policy,
                first_name='Another',
                last_name='User',
                id_number='22222',
                email='test@example.com'
            )
    
    def test_allowed_students_same_email_different_policies(self):
        """Test that the same email can be in different policies."""
        instructor1 = self.create_instructor(username='instructor1')
        instructor2 = self.create_instructor(username='instructor2')
        slot1, policy1 = self.create_office_hour_slot(instructor=instructor1, course_name='Course 1')
        slot2, policy2 = self.create_office_hour_slot(instructor=instructor2, course_name='Course 2')
        
        AllowedStudents.objects.create(
            booking_policy=policy1,
            first_name='Test',
            last_name='User',
            id_number='11111',
            email='test@example.com'
        )
        
        # Should be able to create with same email but different policy
        allowed2 = AllowedStudents.objects.create(
            booking_policy=policy2,
            first_name='Test',
            last_name='User',
            id_number='22222',
            email='test@example.com'
        )
        
        self.assertIsNotNone(allowed2.id)
    
    def test_allowed_students_cascade_delete(self):
        """Test that deleting a policy deletes its allowed students."""
        slot, policy = self.create_office_hour_slot()
        
        allowed_student = AllowedStudents.objects.create(
            booking_policy=policy,
            first_name='Test',
            last_name='User',
            id_number='11111',
            email='test@example.com'
        )
        allowed_student_id = allowed_student.id
        
        policy.delete()
        
        # Allowed student should be deleted
        self.assertFalse(AllowedStudents.objects.filter(id=allowed_student_id).exists())
    
    def test_allowed_students_str_representation(self):
        """Test the __str__ method of AllowedStudents."""
        slot, policy = self.create_office_hour_slot()
        
        allowed_student = AllowedStudents.objects.create(
            booking_policy=policy,
            first_name='Test',
            last_name='User',
            id_number='11111',
            email='test@example.com'
        )
        
        expected_str = f"test@example.com - {policy}"
        self.assertEqual(str(allowed_student), expected_str)

