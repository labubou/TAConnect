from django.db import models
from django.conf import settings
import datetime
# Create your models here.

class Booking(models.Model):
    
    # use settings.AUTH_USER_MODEL to avoid direct import and migration pitfalls
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    # use string reference to avoid import cycles and migration ordering issues
    office_hour = models.ForeignKey("instructor.OfficeHourSlot", on_delete=models.CASCADE, related_name="bookings")

    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    date = models.DateField(default=datetime.date.today)
    created_at = models.DateTimeField(auto_now_add=True)
    is_cancelled = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Calculate end_time based on slot duration if not set
        if not self.end_time and self.start_time and self.office_hour:
            self.end_time = self.start_time + datetime.timedelta(minutes=self.office_hour.duration_minutes)
        super().save(*args, **kwargs)

    def __str__(self):
        # office_hour.course_name exists on OfficeHourSlot; section may be optional
        section = getattr(self.office_hour, "section", "") or ""
        return f"{getattr(self.student, 'username', self.student_id)} -> {self.office_hour.course_name} {section}"