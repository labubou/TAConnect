"""
Tests for serializers (forms) in the accounts app.
Since this is a Django REST Framework project, we test serializers instead of forms.
Tests cover:
- Happy Path: Successful validation and data creation
- Validation: Invalid data returns validation errors
"""
from django.test import TestCase
from accounts.models import User, InstructorProfile, StudentProfile
from accounts.serializers.register_serializer import RegisterSerializer
from accounts.serializers.login_serializer import LoginSerializer
from accounts.serializers.delete_user_serializer import DeleteUserSerializer
from accounts.tests.base import BaseTestCase


class RegisterSerializerTestCase(BaseTestCase):
    """
    Test cases for the RegisterSerializer.
    """
    
    def test_serializer_validation_happy_path_student(self):
        """Test serializer validation with valid student data."""
        data = {
            'username': 'newstudent',
            'email': 'newstudent@example.com',
            'password': 'securepass123',
            'password2': 'securepass123',
            'user_type': 'student',
            'first_name': 'New',
            'last_name': 'Student'
        }
        
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        # Test create method
        user = serializer.save()
        self.assertIsNotNone(user.id)
        self.assertEqual(user.username, 'newstudent')
        self.assertEqual(user.user_type, 'student')
        self.assertTrue(hasattr(user, 'student_profile'))
    
    def test_serializer_validation_happy_path_instructor(self):
        """Test serializer validation with valid instructor data."""
        data = {
            'username': 'newinstructor',
            'email': 'newinstructor@example.com',
            'password': 'securepass123',
            'password2': 'securepass123',
            'user_type': 'instructor',
            'first_name': 'New',
            'last_name': 'Instructor'
        }
        
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        user = serializer.save()
        self.assertEqual(user.user_type, 'instructor')
        self.assertTrue(hasattr(user, 'instructor_profile'))
    
    def test_serializer_validation_password_mismatch(self):
        """Test serializer validation with mismatched passwords."""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123',
            'password2': 'different123',
            'user_type': 'student'
        }
        
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_serializer_validation_username_exists(self):
        """Test serializer validation with existing username."""
        # Create existing user
        self.create_user(username='existing', email='existing@example.com')
        
        data = {
            'username': 'existing',
            'email': 'new@example.com',
            'password': 'password123',
            'password2': 'password123',
            'user_type': 'student'
        }
        
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)
    
    def test_serializer_validation_email_exists(self):
        """Test serializer validation with existing email."""
        # Create existing user
        self.create_user(username='user1', email='existing@example.com')
        
        data = {
            'username': 'user2',
            'email': 'existing@example.com',
            'password': 'password123',
            'password2': 'password123',
            'user_type': 'student'
        }
        
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)
    
    def test_serializer_validation_username_with_at(self):
        """Test serializer validation with '@' in username."""
        data = {
            'username': 'user@name',
            'email': 'test@example.com',
            'password': 'password123',
            'password2': 'password123',
            'user_type': 'student'
        }
        
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)
    
    def test_serializer_validation_invalid_email_format(self):
        """Test serializer validation with invalid email format."""
        data = {
            'username': 'testuser',
            'email': 'invalid-email',
            'password': 'password123',
            'password2': 'password123',
            'user_type': 'student'
        }
        
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)
    
    def test_serializer_validation_short_password(self):
        """Test serializer validation with password shorter than 8 characters."""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'short',
            'password2': 'short',
            'user_type': 'student'
        }
        
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_serializer_validation_optional_fields(self):
        """Test serializer with optional fields (first_name, last_name)."""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123',
            'password2': 'password123',
            'user_type': 'student'
            # first_name and last_name are optional
        }
        
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        user = serializer.save()
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.first_name, '')
        self.assertEqual(user.last_name, '')


class LoginSerializerTestCase(BaseTestCase):
    """
    Test cases for the LoginSerializer.
    """
    
    def test_serializer_validation_happy_path(self):
        """Test serializer validation with valid login data."""
        # Create a user first since LoginSerializer validates that username/email exists
        self.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='student'
        )
        
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        serializer = LoginSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['username'], 'testuser')
        self.assertEqual(serializer.validated_data['password'], 'testpass123')
    
    def test_serializer_validation_missing_username(self):
        """Test serializer validation with missing username."""
        data = {
            'password': 'testpass123'
        }
        
        serializer = LoginSerializer(data=data)
        # Username is required, so validation should fail
        self.assertFalse(serializer.is_valid())
    
    def test_serializer_validation_missing_password(self):
        """Test serializer validation with missing password."""
        data = {
            'username': 'testuser'
        }
        
        serializer = LoginSerializer(data=data)
        # Password is required, so validation should fail
        self.assertFalse(serializer.is_valid())
    

class DeleteUserSerializerTestCase(BaseTestCase):
    """
    Test cases for the DeleteUserSerializer.
    """
    
    def test_serializer_validation_happy_path(self):
        """Test serializer validation with correct password."""
        user = self.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='student'
        )
        
        data = {
            'password': 'testpass123'
        }
        
        serializer = DeleteUserSerializer(data=data, context={'user': user})
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
    
    def test_serializer_validation_incorrect_password(self):
        """Test serializer validation with incorrect password."""
        user = self.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='student'
        )
        
        data = {
            'password': 'wrongpassword123'
        }
        
        serializer = DeleteUserSerializer(data=data, context={'user': user})
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', str(serializer.errors))
    
    def test_serializer_validation_missing_password(self):
        """Test serializer validation with missing password."""
        user = self.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='student'
        )
        
        data = {}
        
        serializer = DeleteUserSerializer(data=data, context={'user': user})
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_serializer_validation_short_password(self):
        """Test serializer validation with password shorter than 8 characters."""
        user = self.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='student'
        )
        
        data = {
            'password': 'short'
        }
        
        serializer = DeleteUserSerializer(data=data, context={'user': user})
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
