from django.contrib.auth.models import AbstractUser
from django.db import models

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

class InstructorProfile(models.Model):
    """
    Profile model for Instructors (TAs).
    Extends the User model with additional fields specific to instructors
    """
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="instructor_profile")
    email_notifications_on_booking = models.BooleanField(default=True, verbose_name="Email Notifications on Booking")
    email_notifications_on_cancellation = models.BooleanField(default=True, verbose_name="Email Notifications on Cancellation")

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
    
    def __str__(self):
        return f"Student Profile: {self.user.username}"