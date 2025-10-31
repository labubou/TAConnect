from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import OfficeHourSlot, BookingPolicy, TAAnalytics

User = get_user_model()

@admin.register(OfficeHourSlot)
class OfficeHourSlotAdmin(admin.ModelAdmin):
    list_display = ("id", "instructor", "course_name", "section", "day_of_week", "start_time", "end_time", "duration_minutes", "start_date", "end_date", "status", "created_at", "updated_at")
    list_filter = ("day_of_week", "course_name", "instructor")
    search_fields = ("course_name", "section", "instructor__username", "instructor__email")
    date_hierarchy = "start_date"
    readonly_fields = ()

@admin.register(BookingPolicy)
class BookingPolicyAdmin(admin.ModelAdmin):
    list_display = ['office_hour_slot', 'require_specific_email']  # Changed from require_university_email
    list_filter = ['require_specific_email']  # Changed from require_university_email
    search_fields = ['office_hour_slot__course_name', 'office_hour_slot__section']

@admin.register(TAAnalytics)
class TAAnalyticsAdmin(admin.ModelAdmin):
    list_display = ("id", "instructor", "total_sessions", "total_feedback_count", "average_rating", "last_updated")
    search_fields = ("instructor__username", "instructor__email")
    readonly_fields = ("last_updated",)