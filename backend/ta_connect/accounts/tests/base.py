"""
Base test class for accounts app tests.
Provides common setup for user creation and authentication.
"""
from unittest.mock import patch
from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User, InstructorProfile, StudentProfile


class BaseTestCase(APITestCase):
    """
    Base test case that provides common setup methods for all tests.
    Inherits from APITestCase which provides:
    - Isolated test database (created and destroyed for each test)
    - API client for making requests
    - Authentication helpers
    """
    
    def setUp(self):
        """
        Set up test data before each test method runs.
        This method is called before every test method.
        """
        super().setUp()
        # Disable throttling for tests by patching throttle classes on views
        # This prevents 429 errors when running multiple tests
        self._throttle_patchers = []
        
        # Patch throttling for accounts views by setting throttle_classes to empty list
        from accounts.auth import register, login
        
        # Store original and set to empty list
        if hasattr(register.RegisterView, 'throttle_classes'):
            original = register.RegisterView.throttle_classes
            register.RegisterView.throttle_classes = []
            self._original_throttles = getattr(self, '_original_throttles', {})
            self._original_throttles['RegisterView'] = original
        
        if hasattr(register.VerifyEmailView, 'throttle_classes'):
            original = register.VerifyEmailView.throttle_classes
            register.VerifyEmailView.throttle_classes = []
            self._original_throttles = getattr(self, '_original_throttles', {})
            self._original_throttles['VerifyEmailView'] = original
        
        if hasattr(login.LoginView, 'throttle_classes'):
            original = login.LoginView.throttle_classes
            login.LoginView.throttle_classes = []
            self._original_throttles = getattr(self, '_original_throttles', {})
            self._original_throttles['LoginView'] = original
        
        # Common test data can be set up here if needed
        # Individual test methods can override or extend this
    
    def create_user(self, username='testuser', email='test@example.com', 
                   password='testpass123', user_type='student', **kwargs):
        """
        Helper method to create a test user.
        
        Args:
            username: Username for the user
            email: Email for the user
            password: Password for the user
            user_type: Either 'student' or 'instructor'
            **kwargs: Additional fields to pass to User.objects.create_user()
        
        Returns:
            User: The created user instance
        """
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            user_type=user_type,
            **kwargs
        )
        
        # Create corresponding profile based on user type
        if user_type == 'instructor':
            InstructorProfile.objects.create(user=user)
        elif user_type == 'student':
            StudentProfile.objects.create(user=user)
        
        return user
    
    def create_instructor(self, username='instructor', email='instructor@example.com',
                         password='testpass123', **kwargs):
        """
        Helper method to create an instructor user.
        
        Returns:
            User: The created instructor user instance
        """
        return self.create_user(
            username=username,
            email=email,
            password=password,
            user_type='instructor',
            **kwargs
        )
    
    def create_student(self, username='student', email='student@example.com',
                      password='testpass123', **kwargs):
        """
        Helper method to create a student user.
        
        Returns:
            User: The created student user instance
        """
        return self.create_user(
            username=username,
            email=email,
            password=password,
            user_type='student',
            **kwargs
        )
    
    def authenticate_user(self, user):
        """
        Helper method to authenticate a user and set the Authorization header.
        Uses JWT tokens for authentication.
        
        Args:
            user: User instance to authenticate
        """
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    def create_and_authenticate_user(self, username='testuser', email='test@example.com',
                                    password='testpass123', user_type='student', **kwargs):
        """
        Helper method to create a user and authenticate them in one call.
        
        Returns:
            tuple: (user, access_token) - The created user and access token
        """
        user = self.create_user(username, email, password, user_type, **kwargs)
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        return user, refresh.access_token
    
    def tearDown(self):
        """
        Clean up after each test method.
        APITestCase automatically handles database cleanup,
        but you can add additional cleanup here if needed.
        """
        # Restore original throttle classes
        from accounts.auth import register, login
        original_throttles = getattr(self, '_original_throttles', {})
        
        if 'RegisterView' in original_throttles:
            register.RegisterView.throttle_classes = original_throttles['RegisterView']
        if 'VerifyEmailView' in original_throttles:
            register.VerifyEmailView.throttle_classes = original_throttles['VerifyEmailView']
        if 'LoginView' in original_throttles:
            login.LoginView.throttle_classes = original_throttles['LoginView']
        
        super().tearDown()

