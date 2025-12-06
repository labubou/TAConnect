from django.db import models
from django.conf import settings
import datetime
# Create your models here.

class Booking(models.Model):
    
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
    ]

    # use settings.AUTH_USER_MODEL to avoid direct import and migration pitfalls
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    # use string reference to avoid import cycles and migration ordering issues
    office_hour = models.ForeignKey("instructor.OfficeHourSlot", on_delete=models.CASCADE, related_name="bookings")

    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    date = models.DateField(default=datetime.date.today)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    
    is_cancelled = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)


    def save(self, *args, **kwargs):
        # Sync status based on boolean fields
        if self.is_cancelled:
            self.status = "cancelled"
        elif self.is_completed:
            self.status = "completed"
        
        # Sync boolean fields based on status
        if self.status == "cancelled":
            self.is_cancelled = True
        elif self.status == "completed":
            self.is_completed = True
        elif self.status in ("pending", "confirmed"):
            self.is_cancelled = False
            self.is_completed = False

        # Calculate end_time based on slot duration if not set
        if not self.end_time and self.start_time and self.office_hour:
            self.end_time = self.start_time + datetime.timedelta(minutes=self.office_hour.duration_minutes)
        super().save(*args, **kwargs)

    def confirm(self):
        """Helper method to confirm a booking."""
        self.status = "confirmed"
        self.is_cancelled = False
        self.is_completed = False
        self.save()

    def cancel(self):
        """Helper method to cancel a booking."""
        self.is_cancelled = True
        self.save()

    def complete(self):
        """Helper method to complete a booking."""
        self.is_completed = True
        self.save()

    def __str__(self):
        # office_hour.course_name exists on OfficeHourSlot; section may be optional
        section = getattr(self.office_hour, "section", "") or ""
        return f"{getattr(self.student, 'username', self.student_id)} -> {self.office_hour.course_name} {section}"