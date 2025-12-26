"""
Tests for Google Calendar Management API views/endpoints.
Tests cover:
- Happy Path: Successful requests (200/201 status codes)
- Validation: Invalid data returns 400 Bad Request
- Security: Unauthenticated users receive 401/403 errors
- Edge Cases: Network errors, missing credentials, expired tokens
"""
from rest_framework import status
from django.urls import reverse
from accounts.models import User, GoogleCalendarCredentials
from accounts.tests.base import BaseTestCase
from unittest.mock import patch, Mock
from django.utils import timezone
from datetime import timedelta

class GoogleCalendarConnectUrlViewTestCase(BaseTestCase):
    """
    Test cases for the Google Calendar Connect URL endpoint.
    Tests cover OAuth URL generation, authentication, and throttling.
    """
    
    def setUp(self):
        super().setUp()
        from accounts.auth import google_calendar_management
        # Disable throttling for tests
        if hasattr(google_calendar_management.GoogleCalendarConnectUrlView, 'throttle_classes'):
            self._original_throttle = google_calendar_management.GoogleCalendarConnectUrlView.throttle_classes
            google_calendar_management.GoogleCalendarConnectUrlView.throttle_classes = []
    
    def tearDown(self):
        super().tearDown()
        from accounts.auth import google_calendar_management
        if hasattr(self, '_original_throttle'):
            google_calendar_management.GoogleCalendarConnectUrlView.throttle_classes = self._original_throttle
    
    def test_get_oauth_url_happy_path(self):
        """Test successful OAuth URL generation (200 OK)."""
        user, token = self.create_and_authenticate_user()
        
        response = self.client.get('/api/auth/google/calendar/url/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('auth_url', response.data)
        self.assertIn('accounts.google.com', response.data['auth_url'])
        self.assertIn('oauth2', response.data['auth_url'])
    
    def test_get_oauth_url_requires_authentication(self):
        """Test that endpoint requires authentication (401 Unauthorized)."""
        self.client.credentials()  # Clear credentials
        
        response = self.client.get('/api/auth/google/calendar/url/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_get_oauth_url_with_state_parameter(self):
        """Test OAuth URL generation with state parameter."""
        user, token = self.create_and_authenticate_user()
        
        response = self.client.get('/api/auth/google/calendar/url/?from=settings')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('auth_url', response.data)
        self.assertIn('state=settings', response.data['auth_url'])


class GoogleCalendarConnectViewTestCase(BaseTestCase):
    """
    Test cases for the Google Calendar Connect endpoint.
    Tests cover successful connection, invalid codes, and token exchange errors.
    """
    
    def setUp(self):
        super().setUp()
        from accounts.auth import google_calendar_management
        # Disable throttling for tests
        if hasattr(google_calendar_management.GoogleCalendarConnectView, 'throttle_classes'):
            self._original_throttle = google_calendar_management.GoogleCalendarConnectView.throttle_classes
            google_calendar_management.GoogleCalendarConnectView.throttle_classes = []
    
    def tearDown(self):
        super().tearDown()
        from accounts.auth import google_calendar_management
        if hasattr(self, '_original_throttle'):
            google_calendar_management.GoogleCalendarConnectView.throttle_classes = self._original_throttle
    
    @patch('accounts.auth.google_calendar_management.requests.post')
    @patch('accounts.auth.google_calendar_management.save_google_calendar_credentials')
    def test_connect_google_calendar_happy_path(self, mock_save, mock_post):
        """Test successful Google Calendar connection (200 OK)."""
        user, token = self.create_and_authenticate_user()
        
        # Mock successful token exchange
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'access_token': 'test_access_token',
            'refresh_token': 'test_refresh_token',
            'expires_in': 3600
        }
        mock_response.content = b'{}'
        mock_post.return_value = mock_response
        mock_save.return_value = True
        
        # Mock credentials retrieval
        creds = GoogleCalendarCredentials.objects.create(
            user=user,
            access_token='test_access_token',
            refresh_token='test_refresh_token',
            token_expiry=timezone.now() + timedelta(hours=1),
            calendar_enabled=True
        )
        
        with patch.object(GoogleCalendarCredentials.objects, 'get', return_value=creds):
            response = self.client.post('/api/auth/google/calendar/connect/', {
                'code': 'valid_auth_code'
            }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('calendar_enabled', response.data)
    
    def test_connect_google_calendar_missing_code(self):
        """Test connection with missing authorization code (400 Bad Request)."""
        user, token = self.create_and_authenticate_user()
        
        response = self.client.post('/api/auth/google/calendar/connect/', {}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_connect_google_calendar_requires_authentication(self):
        """Test that endpoint requires authentication (401 Unauthorized)."""
        self.client.credentials()  # Clear credentials
        
        response = self.client.post('/api/auth/google/calendar/connect/', {
            'code': 'test_code'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    @patch('accounts.auth.google_calendar_management.requests.post')
    def test_connect_google_calendar_invalid_code(self, mock_post):
        """Test connection with invalid authorization code (400 Bad Request)."""
        user, token = self.create_and_authenticate_user()
        
        # Mock failed token exchange
        mock_response = Mock()
        mock_response.status_code = 400
        mock_response.json.return_value = {'error': 'invalid_grant'}
        mock_response.content = b'{"error": "invalid_grant"}'
        mock_post.return_value = mock_response
        
        response = self.client.post('/api/auth/google/calendar/connect/', {
            'code': 'invalid_code'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    @patch('accounts.auth.google_calendar_management.requests.post')
    def test_connect_google_calendar_network_error(self, mock_post):
        """Test connection when network request fails (500 Internal Server Error)."""
        user, token = self.create_and_authenticate_user()
        
        # Mock network error
        import requests
        mock_post.side_effect = requests.RequestException('Network error')
        
        response = self.client.post('/api/auth/google/calendar/connect/', {
            'code': 'test_code'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)


class GoogleCalendarStatusViewTestCase(BaseTestCase):
    """
    Test cases for the Google Calendar Status endpoint.
    Tests cover status retrieval for connected/not connected and enabled/disabled states.
    """
    
    def test_get_status_not_connected(self):
        """Test status retrieval when user has no credentials (200 OK, not connected)."""
        user, token = self.create_and_authenticate_user()
        
        response = self.client.get('/api/auth/google/calendar/status/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['connected'])
        self.assertFalse(response.data['calendar_enabled'])
        self.assertFalse(response.data['has_valid_credentials'])
        self.assertIsNone(response.data['google_email'])
    
    def test_get_status_connected_enabled(self):
        """Test status retrieval when user is connected and enabled (200 OK)."""
        user, token = self.create_and_authenticate_user()
        
        GoogleCalendarCredentials.objects.create(
            user=user,
            access_token='test_token',
            refresh_token='test_refresh',
            calendar_enabled=True,
            google_email='test@gmail.com'
        )
        
        response = self.client.get('/api/auth/google/calendar/status/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['connected'])
        self.assertTrue(response.data['calendar_enabled'])
        self.assertTrue(response.data['has_valid_credentials'])
        self.assertEqual(response.data['google_email'], 'test@gmail.com')
    
    def test_get_status_connected_disabled(self):
        """Test status retrieval when user is connected but disabled (200 OK)."""
        user, token = self.create_and_authenticate_user()
        
        GoogleCalendarCredentials.objects.create(
            user=user,
            access_token='test_token',
            refresh_token='test_refresh',
            calendar_enabled=False,
            google_email='test@gmail.com'
        )
        
        response = self.client.get('/api/auth/google/calendar/status/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['connected'])
        self.assertFalse(response.data['calendar_enabled'])
        self.assertFalse(response.data['has_valid_credentials'])
        self.assertEqual(response.data['google_email'], 'test@gmail.com')
    
    def test_get_status_requires_authentication(self):
        """Test that endpoint requires authentication (401 Unauthorized)."""
        self.client.credentials()  # Clear credentials
        
        response = self.client.get('/api/auth/google/calendar/status/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class GoogleCalendarToggleViewTestCase(BaseTestCase):
    """
    Test cases for the Google Calendar Toggle endpoint.
    Tests cover enable/disable functionality and validation.
    """
    
    def setUp(self):
        super().setUp()
        from accounts.auth import google_calendar_management
        # Disable throttling for tests
        if hasattr(google_calendar_management.GoogleCalendarToggleView, 'throttle_classes'):
            self._original_throttle = google_calendar_management.GoogleCalendarToggleView.throttle_classes
            google_calendar_management.GoogleCalendarToggleView.throttle_classes = []
    
    def tearDown(self):
        super().tearDown()
        from accounts.auth import google_calendar_management
        if hasattr(self, '_original_throttle'):
            google_calendar_management.GoogleCalendarToggleView.throttle_classes = self._original_throttle
    
    def test_toggle_enable_happy_path(self):
        """Test enabling Google Calendar (200 OK)."""
        user, token = self.create_and_authenticate_user()
        
        GoogleCalendarCredentials.objects.create(
            user=user,
            access_token='test_token',
            refresh_token='test_refresh',
            calendar_enabled=False
        )
        
        response = self.client.post('/api/auth/google/calendar/toggle/', {
            'enabled': True
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['calendar_enabled'])
        self.assertIn('message', response.data)
        
        # Verify it was saved
        creds = GoogleCalendarCredentials.objects.get(user=user)
        self.assertTrue(creds.calendar_enabled)
    
    def test_toggle_disable_happy_path(self):
        """Test disabling Google Calendar (200 OK)."""
        user, token = self.create_and_authenticate_user()
        
        GoogleCalendarCredentials.objects.create(
            user=user,
            access_token='test_token',
            refresh_token='test_refresh',
            calendar_enabled=True
        )
        
        response = self.client.post('/api/auth/google/calendar/toggle/', {
            'enabled': False
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['calendar_enabled'])
        self.assertIn('message', response.data)
        
        # Verify it was saved
        creds = GoogleCalendarCredentials.objects.get(user=user)
        self.assertFalse(creds.calendar_enabled)
    
    def test_toggle_not_connected(self):
        """Test toggle when user has no credentials (400 Bad Request)."""
        user, token = self.create_and_authenticate_user()
        
        response = self.client.post('/api/auth/google/calendar/toggle/', {
            'enabled': True
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_toggle_missing_enabled_field(self):
        """Test toggle with missing enabled field (400 Bad Request)."""
        user, token = self.create_and_authenticate_user()
        
        GoogleCalendarCredentials.objects.create(
            user=user,
            access_token='test_token',
            refresh_token='test_refresh'
        )
        
        response = self.client.post('/api/auth/google/calendar/toggle/', {}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_toggle_requires_authentication(self):
        """Test that endpoint requires authentication (401 Unauthorized)."""
        self.client.credentials()  # Clear credentials
        
        response = self.client.post('/api/auth/google/calendar/toggle/', {
            'enabled': True
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class GoogleCalendarDisconnectViewTestCase(BaseTestCase):
    """
    Test cases for the Google Calendar Disconnect endpoint.
    Tests cover successful disconnect and error handling.
    """
    
    def setUp(self):
        super().setUp()
        from accounts.auth import google_calendar_management
        # Disable throttling for tests
        if hasattr(google_calendar_management.GoogleCalendarDisconnectView, 'throttle_classes'):
            self._original_throttle = google_calendar_management.GoogleCalendarDisconnectView.throttle_classes
            google_calendar_management.GoogleCalendarDisconnectView.throttle_classes = []
    
    def tearDown(self):
        super().tearDown()
        from accounts.auth import google_calendar_management
        if hasattr(self, '_original_throttle'):
            google_calendar_management.GoogleCalendarDisconnectView.throttle_classes = self._original_throttle
    
    def test_disconnect_happy_path(self):
        """Test successful Google Calendar disconnect (200 OK)."""
        user, token = self.create_and_authenticate_user()
        
        creds = GoogleCalendarCredentials.objects.create(
            user=user,
            access_token='test_token',
            refresh_token='test_refresh'
        )
        creds_id = creds.id
        
        response = self.client.post('/api/auth/google/calendar/disconnect/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Verify credentials were deleted
        self.assertFalse(GoogleCalendarCredentials.objects.filter(id=creds_id).exists())
    
    def test_disconnect_not_connected(self):
        """Test disconnect when user has no credentials (400 Bad Request)."""
        user, token = self.create_and_authenticate_user()
        
        response = self.client.post('/api/auth/google/calendar/disconnect/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_disconnect_requires_authentication(self):
        """Test that endpoint requires authentication (401 Unauthorized)."""
        self.client.credentials()  # Clear credentials
        
        response = self.client.post('/api/auth/google/calendar/disconnect/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class GoogleCalendarCallbackViewTestCase(BaseTestCase):
    """
    Test cases for the Google Calendar OAuth Callback endpoint.
    Tests cover redirect handling for success, error, and missing code scenarios.
    """
    
    @patch('accounts.auth.google_calendar_management.frontend_url', 'http://localhost:3000')
    def test_callback_with_code(self):
        """Test callback with authorization code redirects to settings."""
        response = self.client.get('/api/auth/google/calendar/callback/?code=test_code')
        
        self.assertEqual(response.status_code, 302)  # Redirect
        self.assertIn('settings', response.url)
        self.assertIn('code=test_code', response.url)
        self.assertIn('google_calendar=true', response.url)
    
    @patch('accounts.auth.google_calendar_management.frontend_url', 'http://localhost:3000')
    def test_callback_with_error(self):
        """Test callback with error redirects to settings with error."""
        response = self.client.get('/api/auth/google/calendar/callback/?error=access_denied')
        
        self.assertEqual(response.status_code, 302)  # Redirect
        self.assertIn('settings', response.url)
        self.assertIn('error=google_calendar_auth_cancelled', response.url)
        self.assertIn('google_calendar=true', response.url)
    
    @patch('accounts.auth.google_calendar_management.frontend_url', 'http://localhost:3000')
    def test_callback_no_code_no_error(self):
        """Test callback with no code and no error redirects with failure."""
        response = self.client.get('/api/auth/google/calendar/callback/')
        
        self.assertEqual(response.status_code, 302)  # Redirect
        self.assertIn('settings', response.url)
        self.assertIn('error=google_calendar_auth_failed', response.url)
        self.assertIn('google_calendar=true', response.url)
    
    @patch('accounts.auth.google_calendar_management.frontend_url', 'http://localhost:3000')
    def test_callback_authenticated_instructor(self):
        """Test callback redirects to TA settings for instructor."""
        instructor, token = self.create_and_authenticate_user(user_type='instructor')
        
        response = self.client.get('/api/auth/google/calendar/callback/?code=test_code')
        
        self.assertEqual(response.status_code, 302)
        self.assertIn('ta/settings', response.url)
    
    @patch('accounts.auth.google_calendar_management.frontend_url', 'http://localhost:3000')
    def test_callback_authenticated_student(self):
        """Test callback redirects to student settings for student."""
        student, token = self.create_and_authenticate_user(user_type='student')
        
        response = self.client.get('/api/auth/google/calendar/callback/?code=test_code')
        
        self.assertEqual(response.status_code, 302)
        self.assertIn('student/settings', response.url)

