from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from encrypted_model_fields.fields import EncryptedTextField

# Create your models here.

class User(AbstractUser):
    """
    Custom user model for TAConnect.
    Supports two roles: Instructor (TA) and Student.
    """

    USER_TYPE_CHOICES = (
        ('instructor', 'Instructor'),
        ('student', 'Student'),
    )

    email_verify = models.BooleanField(default=False, verbose_name="Email Verified")
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, blank=True, null=True, verbose_name="User Type")

    #functions to check user type
    def is_instructor(self):
        return self.user_type == 'instructor'

    def is_student(self):
        return self.user_type == 'student'

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username

    #functions to check existence of username or email
    def username_exists(username):
        return User.objects.filter(username=username).exists()

    def email_exists(email):
        return User.objects.filter(email=email).exists()

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        indexes = [
            models.Index(fields=['email'], name='idx_user_email'),
            models.Index(fields=['user_type'], name='idx_user_type'),
            models.Index(fields=['email_verify'], name='idx_user_email_verify'),
        ]

class InstructorProfile(models.Model):
    """
    Profile model for Instructors (TAs).
    Extends the User model with additional fields specific to instructors
    """
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="instructor_profile")
    email_notifications_on_booking = models.BooleanField(default=True, verbose_name="Email Notifications on Booking")
    email_notifications_on_cancellation = models.BooleanField(default=True, verbose_name="Email Notifications on Cancellation")
    email_notifications_on_update = models.BooleanField(default=True, verbose_name="Email Notifications on Updates The Booking")

    def __str__(self):
        return f"Instructor Profile: {self.user.username}"

class StudentProfile(models.Model):
    """
    Profile model for Students.
    Extends the User model with additional fields specific to students
    """
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")
    email_notifications_on_booking = models.BooleanField(default=True, verbose_name="Email Notifications on Booking")
    email_notifications_on_cancellation = models.BooleanField(default=True, verbose_name="Email Notifications on Cancellation")
    email_notifications_on_update = models.BooleanField(default=True, verbose_name="Email Notifications on Updates The Booking")
    def __str__(self):
        return f"Student Profile: {self.user.username}"

class PendingEmailChange(models.Model):
    """Track pending email change requests for single-use verification"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pending_email_changes')
    new_email = models.EmailField()
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Email change for {self.user.username}: {self.new_email}"
    
    def is_expired(self):
        """Check if the token has expired (24 hours by default)"""
        
        # Use EMAIL_CHANGE_TIMEOUT_HOURS setting or default to 24 hours
        timeout_hours = getattr(settings, 'EMAIL_CHANGE_TIMEOUT_HOURS', 24)
        expiry_time = self.created_at + timedelta(hours=timeout_hours)
        return timezone.now() > expiry_time
    
    def is_valid(self):
        """Check if token is valid (not used and not expired)"""
        return not self.used and not self.is_expired()


class GoogleCalendarCredentials(models.Model):
    """
    Store Google OAuth credentials for Calendar API access.
    Each user can have one set of credentials for Google Calendar integration.
    
    Sensitive fields (access_token, refresh_token) are encrypted at rest using
    django-encrypted-model-fields for security.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='google_calendar_credentials')
    # Encrypted fields for security - tokens are sensitive and should be encrypted
    access_token = EncryptedTextField(blank=True, null=True, verbose_name="Access Token (Encrypted)")
    refresh_token = EncryptedTextField(blank=True, null=True, verbose_name="Refresh Token (Encrypted)")
    token_expiry = models.DateTimeField(blank=True, null=True, verbose_name="Token Expiry")
    # Store the connected Google account email for display in settings
    google_email = models.EmailField(blank=True, null=True, verbose_name="Connected Google Account Email")
    calendar_enabled = models.BooleanField(default=True, verbose_name="Calendar Integration Enabled")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Google Calendar Credentials"
        verbose_name_plural = "Google Calendar Credentials"

    def __str__(self):
        return f"Google Calendar Credentials for {self.user.username}"

    def is_expired(self):
        """Check if the access token has expired"""
        if not self.token_expiry:
            return True
        return timezone.now() >= self.token_expiry

    def has_valid_credentials(self):
        """Check if user has valid Google Calendar credentials"""
        return bool(self.refresh_token) and self.calendar_enabled