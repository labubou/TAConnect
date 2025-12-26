from django.db import models
from django.conf import settings
import datetime
from django.utils import timezone
from core.models import BaseModel
# Create your models here.

class Booking(BaseModel):
    
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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    book_description = models.TextField(blank=True, null=True, default="")
    
    is_cancelled = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)

    # Google Calendar Event IDs for calendar integration
    student_calendar_event_id = models.CharField(max_length=255, blank=True, null=True, verbose_name="Student Calendar Event ID")
    instructor_calendar_event_id = models.CharField(max_length=255, blank=True, null=True, verbose_name="Instructor Calendar Event ID")


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

    def pending(self):
        """Helper method to mark a booking as pending."""
        self.status = "pending"
        self.is_cancelled = False
        self.is_completed = False
        self.save()

    def confirm(self):
        """Helper method to confirm a booking."""
        self.status = "confirmed"
        self.is_cancelled = False
        self.is_completed = False
        self.save()

    def cancel(self):
        """Helper method to cancel a booking."""
        self.is_cancelled = True
        self.status = "cancelled"
        self.save()

    def complete(self):
        """Helper method to complete a booking."""
        self.is_completed = True
        self.status = "completed"
        self.save()

    @property
    def is_ended(self):
        if self.end_time is None:
            return False  # A booking without an end time cannot be "ended"
            
        return timezone.now() >= self.end_time

    def complete_if_ended(self):
        """Encapsulates the completion logic you wrote."""
        if not self.is_ended:
            return False, "Booking has not ended yet."
            
        if self.status == "confirmed":
            self.complete() # Assuming you have this method
            self.save()
            return True, "Booking marked as completed."
        elif self.status == "pending":
            self.cancel() # Assuming you have this method
            self.save()
            return True, "Booking was pending and is now cancelled."
        
        return False, "Booking status invalid."

    class Meta:
        indexes = [
            models.Index(fields=['office_hour', 'date', 'is_cancelled'], name='idx_booking_slot_date_cancel'),
            models.Index(fields=['student', 'status'], name='idx_booking_student_status'),
            models.Index(fields=['office_hour', 'status'], name='idx_booking_slot_status'),
            models.Index(fields=['date', 'status'], name='idx_booking_date_status'),
            models.Index(fields=['created_at'], name='idx_booking_created_at'),
        ]

    def __str__(self):
        # office_hour.course_name exists on OfficeHourSlot; section may be optional
        section = getattr(self.office_hour, "section", "") or ""
        return f"{getattr(self.student, 'username', self.student_id)} -> {self.office_hour.course_name} {section}"