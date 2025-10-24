from django.db import models
from instructor.models import OfficeHourSlot
from accounts.models import User

# Create your models here.

class Booking(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    office_hour = models.ForeignKey(OfficeHourSlot, on_delete=models.CASCADE, related_name="bookings")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_cancelled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.username} -> {self.office_hour.section.course.code}"
