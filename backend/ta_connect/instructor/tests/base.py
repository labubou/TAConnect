"""
Base test class for instructor app tests.
Provides common setup for user creation and authentication.
"""
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User, InstructorProfile
from instructor.models import OfficeHourSlot, BookingPolicy
import datetime


class BaseTestCase(APITestCase):
    """
    Base test case that provides common setup methods for all instructor tests.
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
        self._original_throttles = {}
        
        # Common test data can be set up here if needed
        # Individual test methods can override or extend this
    
    def create_instructor(self, username='instructor', email='instructor@example.com',
                         password='testpass123', **kwargs):
        """
        Helper method to create an instructor user.
        
        Returns:
            User: The created instructor user instance
        """
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            user_type='instructor',
            **kwargs
        )
        
        # Create instructor profile
        InstructorProfile.objects.create(user=user)
        
        return user
    
    def create_student(self, username='student', email='student@example.com',
                      password='testpass123', **kwargs):
        """
        Helper method to create a student user.
        
        Returns:
            User: The created student user instance
        """
        from accounts.models import StudentProfile
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            user_type='student',
            **kwargs
        )
        
        # Create student profile
        StudentProfile.objects.create(user=user)
        
        return user
    
    def create_office_hour_slot(self, instructor=None, course_name='Test Course',
                               day_of_week='Mon', start_time='09:00:00',
                               end_time='10:00:00', duration_minutes=10,
                               start_date=None, end_date=None, room='TBA',
                               status=True, **kwargs):
        """
        Helper method to create an OfficeHourSlot with associated BookingPolicy.
        
        Args:
            instructor: User instance (instructor). If None, creates one.
            course_name: Name of the course
            day_of_week: Day of week ('Mon', 'Tue', etc.)
            start_time: Start time as string 'HH:MM:SS' or time object
            end_time: End time as string 'HH:MM:SS' or time object
            duration_minutes: Duration in minutes
            start_date: Start date (defaults to today)
            end_date: End date (defaults to 30 days from today)
            room: Room name
            status: Active status
            **kwargs: Additional fields for OfficeHourSlot
        
        Returns:
            tuple: (OfficeHourSlot, BookingPolicy)
        """
        if instructor is None:
            # Create unique instructor to avoid username conflicts
            import uuid
            unique_id = str(uuid.uuid4())[:8]
            instructor = self.create_instructor(
                username=f'instructor_{unique_id}',
                email=f'instructor_{unique_id}@example.com'
            )
        
        # Parse time strings if provided as strings
        if isinstance(start_time, str):
            start_time = datetime.datetime.strptime(start_time, '%H:%M:%S').time()
        if isinstance(end_time, str):
            end_time = datetime.datetime.strptime(end_time, '%H:%M:%S').time()
        
        # Set default dates
        if start_date is None:
            start_date = datetime.date.today()
        if end_date is None:
            end_date = start_date + datetime.timedelta(days=30)
        
        slot = OfficeHourSlot.objects.create(
            instructor=instructor,
            course_name=course_name,
            day_of_week=day_of_week,
            start_time=start_time,
            end_time=end_time,
            duration_minutes=duration_minutes,
            start_date=start_date,
            end_date=end_date,
            room=room,
            status=status,
            **kwargs
        )
        
        # Create associated BookingPolicy
        policy = BookingPolicy.objects.create(
            office_hour_slot=slot,
            set_student_limit=1
        )
        
        return slot, policy
    
    def authenticate_user(self, user):
        """
        Helper method to authenticate a user and set the Authorization header.
        Uses JWT tokens for authentication.
        
        Args:
            user: User instance to authenticate
        """
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    def create_and_authenticate_instructor(self, username='instructor', email='instructor@example.com',
                                         password='testpass123', **kwargs):
        """
        Helper method to create an instructor and authenticate them in one call.
        
        Returns:
            tuple: (user, access_token) - The created user and access token
        """
        user = self.create_instructor(username, email, password, **kwargs)
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        return user, refresh.access_token
    
    def create_and_authenticate_student(self, username='student', email='student@example.com',
                                       password='testpass123', **kwargs):
        """
        Helper method to create a student and authenticate them in one call.
        
        Returns:
            tuple: (user, access_token) - The created user and access token
        """
        user = self.create_student(username, email, password, **kwargs)
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        return user, refresh.access_token
    
    def tearDown(self):
        """
        Clean up after each test method.
        APITestCase automatically handles database cleanup,
        but you can add additional cleanup here if needed.
        """
        super().tearDown()

