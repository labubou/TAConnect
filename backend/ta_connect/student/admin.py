from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import Booking
from django.db import connection
from django.db.utils import OperationalError, ProgrammingError
import logging

User = get_user_model()

class BookingAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "office_hour", "date", "start_time", "end_time", "created_at", "is_cancelled", "is_completed")
    list_filter = ("is_cancelled", "is_completed", "date", "created_at")
    search_fields = ("student__username", "student__email", "office_hour__course_name")
    date_hierarchy = "date"
    readonly_fields = ("created_at", "end_time")

def _table_exists(table_name: str) -> bool:
    try:
        return table_name in connection.introspection.table_names()
    except (ProgrammingError, OperationalError):
        return False

if _table_exists("student_booking"):
    admin.site.register(Booking, BookingAdmin)
else:
    logging.getLogger(__name__).warning(
        "Skipping admin registration for Booking because table 'student_booking' does not exist. "
        "Run migrations (manage.py makemigrations && manage.py migrate) to create the table."
    )
