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
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, verbose_name="User Type")

    #functions to check user type
    def is_instructor(self):
        return self.user_type == 'instructor'

    def is_student(self):
        return self.user_type == 'student'

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