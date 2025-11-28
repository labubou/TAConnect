from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import InstructorProfile, StudentProfile

User = get_user_model()

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("id", "username", "email", "first_name", "last_name", "is_staff", "is_active", "is_superuser", "last_login", "date_joined", "email_verify", "user_type")
    search_fields = ("username", "email", "first_name", "last_name")
    list_filter = ("is_active", "is_staff", "is_superuser")
    ordering = ("-date_joined",)
    date_hierarchy = "date_joined"
    readonly_fields = ("last_login", "date_joined")
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email", "email_verify", "user_type")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

@admin.register(InstructorProfile)
class InstructorProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "email_notifications_on_booking", "email_notifications_on_cancellation")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name")
    list_filter = ("email_notifications_on_booking", "email_notifications_on_cancellation")
    raw_id_fields = ("user",)

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "email_notifications_on_booking", "email_notifications_on_cancellation")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name")
    list_filter = ("email_notifications_on_booking", "email_notifications_on_cancellation")
    raw_id_fields = ("user",)
