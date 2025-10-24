from django.conf import settings
from django.db import models

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

    def __str__(self):
        return f"{self.course_name} - {self.section} {self.day_of_week} {self.start_time}-{self.end_time}"

class BookingPolicy(models.Model):
    office_hour_slot = models.OneToOneField(OfficeHourSlot, on_delete=models.CASCADE, related_name="policy")
    require_university_email = models.BooleanField(default=True)
    # make JSONField safe with default list and allow blank
    allowed_students = models.JSONField(default=list, blank=True, null=True)

    def __str__(self):
        return f"Policy for {self.office_hour_slot}"

class TAAnalytics(models.Model):
    instructor = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    total_sessions = models.PositiveIntegerField(default=0)
    total_feedback_count = models.PositiveIntegerField(default=0)
    average_rating = models.FloatField(default=0.0)

    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analytics for {self.instructor.username}"
