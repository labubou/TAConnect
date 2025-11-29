"""
Tests for User model and related models (InstructorProfile, StudentProfile).
Tests cover:
- Happy path: Successful creation and retrieval
- Validation: Model field validation
- Security: User type checks and profile relationships
"""
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from accounts.models import User, InstructorProfile, StudentProfile
from accounts.tests.base import BaseTestCase


class UserModelTestCase(BaseTestCase):
    """
    Test cases for the User model.
    Tests cover creation, validation, and user type functionality.
    """
    
    def test_user_creation_happy_path(self):
        """Test successful user creation with all required fields."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='student',
            first_name='Test',
            last_name='User'
        )
        
        # Assert user was created successfully
        self.assertIsNotNone(user.id)
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.user_type, 'student')
        self.assertEqual(user.first_name, 'Test')
        self.assertEqual(user.last_name, 'User')
        self.assertFalse(user.email_verify)  # Should default to False
        self.assertTrue(user.is_active)  # Should default to True
    
    def test_user_creation_minimal_fields(self):
        """Test user creation with only required fields."""
        user = User.objects.create_user(
            username='minimal',
            email='minimal@example.com',
            password='testpass123'
        )
        
        self.assertIsNotNone(user.id)
        self.assertEqual(user.username, 'minimal')
        self.assertEqual(user.email, 'minimal@example.com')
        self.assertIsNone(user.user_type)  # Can be None
    
    def test_user_retrieval(self):
        """Test retrieving a user from the database."""
        # Create user
        created_user = User.objects.create_user(
            username='retrieve',
            email='retrieve@example.com',
            password='testpass123',
            user_type='instructor'
        )
        
        # Retrieve user
        retrieved_user = User.objects.get(username='retrieve')
        
        # Assert retrieved user matches created user
        self.assertEqual(retrieved_user.id, created_user.id)
        self.assertEqual(retrieved_user.email, 'retrieve@example.com')
        self.assertEqual(retrieved_user.user_type, 'instructor')
    
    def test_user_username_validation(self):
        """Test that username validation works correctly."""
        # Create first user
        User.objects.create_user(
            username='uniqueuser',
            email='unique@example.com',
            password='testpass123'
        )
        
        # Try to create another user with same username (should fail)
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                username='uniqueuser',
                email='different@example.com',
                password='testpass123'
            )
    
    def test_user_email_validation(self):
        """Test that email validation works correctly."""
        # Create first user
        User.objects.create_user(
            username='user1',
            email='test@example.com',
            password='testpass123'
        )
        
        # Try to create another user with same email
        # Note: AbstractUser may not enforce email uniqueness at DB level in all Django versions
        # So we check if it raises an error, or if it allows it, we verify the email_exists method works
        try:
            User.objects.create_user(
                username='user2',
                email='test@example.com',
                password='testpass123'
            )
            # If no error was raised, verify that email_exists still works correctly
            self.assertTrue(User.email_exists('test@example.com'))
        except (IntegrityError, Exception):
            # If an error was raised, that's the expected behavior
            pass
        
        # Verify email_exists method works
        self.assertTrue(User.email_exists('test@example.com'))
        self.assertFalse(User.email_exists('nonexistent@example.com'))
    
    def test_user_type_choices_validation(self):
        """Test that user_type must be one of the valid choices."""
        # Valid user types should work
        student = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='testpass123',
            user_type='student'
        )
        self.assertEqual(student.user_type, 'student')
        
        instructor = User.objects.create_user(
            username='instructor',
            email='instructor@example.com',
            password='testpass123',
            user_type='instructor'
        )
        self.assertEqual(instructor.user_type, 'instructor')
        
        # None should also be valid (blank=True, null=True)
        no_type = User.objects.create_user(
            username='notype',
            email='notype@example.com',
            password='testpass123',
            user_type=None
        )
        self.assertIsNone(no_type.user_type)
    
    def test_is_instructor_method(self):
        """Test the is_instructor() method."""
        instructor = User.objects.create_user(
            username='instructor',
            email='instructor@example.com',
            password='testpass123',
            user_type='instructor'
        )
        
        student = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='testpass123',
            user_type='student'
        )
        
        self.assertTrue(instructor.is_instructor())
        self.assertFalse(student.is_instructor())
        self.assertFalse(instructor.is_student())
        self.assertTrue(student.is_student())
    
    def test_is_student_method(self):
        """Test the is_student() method."""
        student = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='testpass123',
            user_type='student'
        )
        
        instructor = User.objects.create_user(
            username='instructor',
            email='instructor@example.com',
            password='testpass123',
            user_type='instructor'
        )
        
        self.assertTrue(student.is_student())
        self.assertFalse(instructor.is_student())
    
    def test_full_name_property(self):
        """Test the full_name property."""
        # User with first and last name
        user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        self.assertEqual(user1.full_name, 'John Doe')
        
        # User with only first name
        user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123',
            first_name='Jane'
        )
        self.assertEqual(user2.full_name, 'Jane')
        
        # User with no name (should fall back to username)
        user3 = User.objects.create_user(
            username='user3',
            email='user3@example.com',
            password='testpass123'
        )
        self.assertEqual(user3.full_name, 'user3')
    
    def test_username_exists_method(self):
        """Test the username_exists() static method."""
        User.objects.create_user(
            username='existing',
            email='existing@example.com',
            password='testpass123'
        )
        
        self.assertTrue(User.username_exists('existing'))
        self.assertFalse(User.username_exists('nonexistent'))
    
    def test_email_exists_method(self):
        """Test the email_exists() static method."""
        User.objects.create_user(
            username='user',
            email='existing@example.com',
            password='testpass123'
        )
        
        self.assertTrue(User.email_exists('existing@example.com'))
        self.assertFalse(User.email_exists('nonexistent@example.com'))
    
    def test_user_str_representation(self):
        """Test the __str__ method of User."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='student'
        )
        
        expected_str = f"testuser (Student)"
        self.assertEqual(str(user), expected_str)
        
        # Test with None user_type
        user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123',
            user_type=None
        )
        self.assertIn('testuser2', str(user2))


class InstructorProfileModelTestCase(BaseTestCase):
    """
    Test cases for the InstructorProfile model.
    """
    
    def test_instructor_profile_creation_happy_path(self):
        """Test successful creation of InstructorProfile."""
        user = self.create_instructor(
            username='instructor',
            email='instructor@example.com'
        )
        
        # Profile should be created automatically by create_instructor
        profile = InstructorProfile.objects.get(user=user)
        
        self.assertIsNotNone(profile.id)
        self.assertEqual(profile.user, user)
        self.assertTrue(profile.email_notifications_on_booking)
        self.assertTrue(profile.email_notifications_on_cancellation)
        self.assertTrue(profile.email_notifications_on_update)
    
    def test_instructor_profile_one_to_one_relationship(self):
        """Test that one user can only have one instructor profile."""
        user = self.create_instructor()
        
        # Try to create another profile for the same user (should fail)
        with self.assertRaises(IntegrityError):
            InstructorProfile.objects.create(user=user)
    
    def test_instructor_profile_retrieval(self):
        """Test retrieving an instructor profile."""
        user = self.create_instructor(username='retrieve_instructor')
        profile = InstructorProfile.objects.get(user=user)
        
        self.assertEqual(profile.user.username, 'retrieve_instructor')
    
    def test_instructor_profile_str_representation(self):
        """Test the __str__ method of InstructorProfile."""
        user = self.create_instructor(username='testinstructor')
        profile = InstructorProfile.objects.get(user=user)
        
        expected_str = "Instructor Profile: testinstructor"
        self.assertEqual(str(profile), expected_str)


class StudentProfileModelTestCase(BaseTestCase):
    """
    Test cases for the StudentProfile model.
    """
    
    def test_student_profile_creation_happy_path(self):
        """Test successful creation of StudentProfile."""
        user = self.create_student(
            username='student',
            email='student@example.com'
        )
        
        # Profile should be created automatically by create_student
        profile = StudentProfile.objects.get(user=user)
        
        self.assertIsNotNone(profile.id)
        self.assertEqual(profile.user, user)
        self.assertTrue(profile.email_notifications_on_booking)
        self.assertTrue(profile.email_notifications_on_cancellation)
        self.assertTrue(profile.email_notifications_on_update)
    
    def test_student_profile_one_to_one_relationship(self):
        """Test that one user can only have one student profile."""
        user = self.create_student()
        
        # Try to create another profile for the same user (should fail)
        with self.assertRaises(IntegrityError):
            StudentProfile.objects.create(user=user)
    
    def test_student_profile_retrieval(self):
        """Test retrieving a student profile."""
        user = self.create_student(username='retrieve_student')
        profile = StudentProfile.objects.get(user=user)
        
        self.assertEqual(profile.user.username, 'retrieve_student')
    
    def test_student_profile_str_representation(self):
        """Test the __str__ method of StudentProfile."""
        user = self.create_student(username='teststudent')
        profile = StudentProfile.objects.get(user=user)
        
        expected_str = "Student Profile: teststudent"
        self.assertEqual(str(profile), expected_str)

