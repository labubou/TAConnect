from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import OfficeHourSlot, BookingPolicy, AllowedStudents

User = get_user_model()

@admin.register(OfficeHourSlot)
class OfficeHourSlotAdmin(admin.ModelAdmin):
    list_display = ("id", "instructor", "course_name", "section", "day_of_week", "start_time", "end_time", "duration_minutes", "room", "start_date", "end_date", "status", "created_at", "updated_at")
    list_filter = ("day_of_week", "course_name", "instructor", "status")
    search_fields = ("course_name", "section", "instructor__username", "instructor__email", "room")
    date_hierarchy = "start_date"
    readonly_fields = ("created_at", "updated_at")

@admin.register(BookingPolicy)
class BookingPolicyAdmin(admin.ModelAdmin):
    list_display = ('office_hour_slot', 'require_specific_email', 'set_student_limit')
    list_filter = ('require_specific_email',)
    search_fields = ('office_hour_slot__course_name', 'office_hour_slot__section')

@admin.register(AllowedStudents)
class AllowedStudentsAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'id_number', 'booking_policy')
    list_filter = ('booking_policy__office_hour_slot__course_name', 'booking_policy')
    search_fields = ('email', 'first_name', 'last_name', 'id_number')
    readonly_fields = ()
