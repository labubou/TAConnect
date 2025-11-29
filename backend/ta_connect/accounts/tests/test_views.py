"""
Tests for API views/endpoints in the accounts app.
Tests cover:
- Happy Path: Successful requests (200/201 status codes)
- Validation: Invalid data returns 400 Bad Request
- Security: Unauthenticated users receive 401/403 errors
"""
from rest_framework import status
from django.urls import reverse
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from accounts.models import User
from accounts.tests.base import BaseTestCase


class RegisterViewTestCase(BaseTestCase):
    """
    Test cases for the user registration endpoint.
    """
    
    def setUp(self):
        super().setUp()
        self.register_url = reverse('register')
    
    def test_register_happy_path_student(self):
        """Test successful student registration (201 Created)."""
        data = {
            'username': 'newstudent',
            'email': 'newstudent@example.com',
            'password': 'securepass123',
            'password2': 'securepass123',
            'user_type': 'student',
            'first_name': 'New',
            'last_name': 'Student'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        
        # Verify user was created
        user = User.objects.get(username='newstudent')
        self.assertEqual(user.email, 'newstudent@example.com')
        self.assertEqual(user.user_type, 'student')
        self.assertFalse(user.email_verify)  # Should be False until verified
        
        # Verify profile was created
        self.assertTrue(hasattr(user, 'student_profile'))
    
    def test_register_happy_path_instructor(self):
        """Test successful instructor registration (201 Created)."""
        data = {
            'username': 'newinstructor',
            'email': 'newinstructor@example.com',
            'password': 'securepass123',
            'password2': 'securepass123',
            'user_type': 'instructor',
            'first_name': 'New',
            'last_name': 'Instructor'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify user was created
        user = User.objects.get(username='newinstructor')
        self.assertEqual(user.user_type, 'instructor')
        
        # Verify profile was created
        self.assertTrue(hasattr(user, 'instructor_profile'))
    
    def test_register_validation_password_mismatch(self):
        """Test registration with mismatched passwords (400 Bad Request)."""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123',
            'password2': 'different123',
            'user_type': 'student'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', str(response.data).lower())
    
    def test_register_validation_username_exists(self):
        """Test registration with existing username (400 Bad Request)."""
        # Create existing user
        self.create_user(username='existing', email='existing@example.com')
        
        data = {
            'username': 'existing',
            'email': 'new@example.com',
            'password': 'password123',
            'password2': 'password123',
            'user_type': 'student'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_validation_email_exists(self):
        """Test registration with existing email (400 Bad Request)."""
        # Create existing user
        self.create_user(username='user1', email='existing@example.com')
        
        data = {
            'username': 'user2',
            'email': 'existing@example.com',
            'password': 'password123',
            'password2': 'password123',
            'user_type': 'student'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_validation_invalid_email(self):
        """Test registration with invalid email format (400 Bad Request)."""
        data = {
            'username': 'testuser',
            'email': 'invalid-email',
            'password': 'password123',
            'password2': 'password123',
            'user_type': 'student'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_validation_short_password(self):
        """Test registration with password shorter than 8 characters (400 Bad Request)."""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'short',
            'password2': 'short',
            'user_type': 'student'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_validation_username_with_at(self):
        """Test registration with '@' in username (400 Bad Request)."""
        data = {
            'username': 'user@name',
            'email': 'test@example.com',
            'password': 'password123',
            'password2': 'password123',
            'user_type': 'student'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginViewTestCase(BaseTestCase):
    """
    Test cases for the login endpoint.
    """
    
    def setUp(self):
        super().setUp()
        self.login_url = reverse('login')
    
    def test_login_happy_path_username(self):
        """Test successful login with username (200 OK)."""
        # Create and verify user
        user = self.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='student'
        )
        user.email_verify = True
        user.save()
        
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')
    
    def test_login_happy_path_email(self):
        """Test successful login with email (200 OK)."""
        # Create and verify user
        user = self.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='student'
        )
        user.email_verify = True
        user.save()
        
        data = {
            'username': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_login_validation_invalid_credentials(self):
        """Test login with invalid credentials (401 Unauthorized)."""
        # Create user
        self.create_user(
            username='testuser',
            email='test@example.com',
            password='correctpass',
            user_type='student'
        )
        
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
    
    def test_login_security_unverified_email(self):
        """Test login with unverified email (401 Unauthorized)."""
        # Create user without verifying email
        self.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='student'
        )
        # email_verify defaults to False
        
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
        self.assertIn('Email not verified', str(response.data))


class UserViewTestCase(BaseTestCase):
    """
    Test cases for the user data endpoint (GET /api/user-data/).
    """
    
    def setUp(self):
        super().setUp()
        self.user_data_url = reverse('user_data')
    
    def test_user_data_happy_path(self):
        """Test successful retrieval of user data (200 OK)."""
        user, token = self.create_and_authenticate_user(
            username='testuser',
            email='test@example.com',
            user_type='student',
            first_name='Test',
            last_name='User'
        )
        
        response = self.client.get(self.user_data_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], user.id)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')
        self.assertEqual(response.data['user_type'], 'student')
    
    def test_user_data_security_unauthenticated(self):
        """Test accessing user data without authentication (401 Unauthorized)."""
        # Don't authenticate
        self.client.credentials()  # Clear any credentials
        
        response = self.client.get(self.user_data_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class VerifyEmailViewTestCase(BaseTestCase):
    """
    Test cases for the email verification endpoint.
    """
    
    def setUp(self):
        super().setUp()
        self.verify_email_url = reverse('verify_email')
    
    def test_verify_email_happy_path(self):
        """Test successful email verification (200 OK)."""
        user = self.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='student'
        )
        user.email_verify = False
        user.is_active = False
        user.save()
        
        # Generate verification token
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        data = {
            'uid': uid,
            'token': token
        }
        
        response = self.client.post(self.verify_email_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify user was updated
        user.refresh_from_db()
        self.assertTrue(user.email_verify)
        self.assertTrue(user.is_active)
    
    def test_verify_email_validation_missing_params(self):
        """Test email verification with missing parameters (400 Bad Request)."""
        data = {
            'uid': 'someuid'
            # Missing token
        }
        
        response = self.client.post(self.verify_email_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_verify_email_validation_invalid_token(self):
        """Test email verification with invalid token (400 Bad Request)."""
        user = self.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='student'
        )
        
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        data = {
            'uid': uid,
            'token': 'invalid_token'
        }
        
        response = self.client.post(self.verify_email_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_verify_email_already_verified(self):
        """Test verifying an already verified email (200 OK with message)."""
        user = self.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='student'
        )
        user.email_verify = True
        user.save()
        
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        data = {
            'uid': uid,
            'token': token
        }
        
        response = self.client.post(self.verify_email_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('already verified', response.data['message'].lower())

