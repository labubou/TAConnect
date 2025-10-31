from django.conf import settings
from django.db import models
from django.utils import timezone

# Create your models here.
class OfficeHourSlot(models.Model):
    # use AUTH_USER_MODEL to avoid direct import and migration pitfalls
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="office_hours",
    )
    course_name = models.TextField()
    section = models.CharField(max_length=10, blank=True, null=True, default=None)
    day_of_week = models.CharField(
        max_length=10,
        choices=[('Mon', 'Monday'), ('Tue', 'Tuesday'), ('Wed', 'Wednesday'),
                 ('Thu', 'Thursday'), ('Fri', 'Friday'), ('Sat', 'Saturday'), ('Sun', 'Sunday')],
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(default=10)
    start_date = models.DateField()
    end_date = models.DateField()
    room = models.TextField(default="TBA")
    status = models.BooleanField(default=True)  # Active or Inactive
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.course_name} - {self.section} {self.day_of_week} {self.start_time}-{self.end_time}"

class BookingPolicy(models.Model):
    office_hour_slot = models.OneToOneField(
        OfficeHourSlot, 
        on_delete=models.CASCADE,
        related_name="policy"
    )
    require_specific_email = models.BooleanField(default=False)

    def __str__(self):
        return f"Policy for {self.office_hour_slot}"

class AllowedStudents(models.Model):
    booking_policy = models.ForeignKey(
        BookingPolicy,
        on_delete=models.CASCADE,  # Deleting BookingPolicy deletes AllowedStudents
        related_name="allowed_students"  # Access via policy.allowed_students.all()
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=100)
    email = models.EmailField()

    class Meta:
        verbose_name_plural = "Allowed Students"
        unique_together = ['booking_policy', 'email']  # Prevent duplicate emails per policy

    def __str__(self):
        return f"{self.email} - {self.booking_policy}"

class TAAnalytics(models.Model):
    instructor = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    total_sessions = models.PositiveIntegerField(default=0)
    total_feedback_count = models.PositiveIntegerField(default=0)
    average_rating = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analytics for {self.instructor.username}"
