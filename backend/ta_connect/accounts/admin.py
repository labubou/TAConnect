from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import InstructorProfile, StudentProfile, PendingEmailChange
from webpush.models import PushInformation, SubscriptionInfo

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

@admin.register(PendingEmailChange)
class PendingEmailChangeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "new_email", "created_at", "used", "is_expired_display")
    search_fields = ("user__username", "user__email", "new_email")
    list_filter = ("used", "created_at")
    readonly_fields = ("token", "created_at", "is_expired_display")
    raw_id_fields = ("user",)
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    
    def is_expired_display(self, obj):
        return obj.is_expired()
    is_expired_display.short_description = "Expired"
    is_expired_display.boolean = True


# Unregister default webpush admin if registered, then register custom ones
try:
    admin.site.unregister(PushInformation)
except admin.sites.NotRegistered:
    pass

try:
    admin.site.unregister(SubscriptionInfo)
except admin.sites.NotRegistered:
    pass


@admin.register(PushInformation)
class PushInformationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "subscription", "group")
    search_fields = ("user__username", "user__email")
    list_filter = ("group",)
    raw_id_fields = ("user", "subscription")


@admin.register(SubscriptionInfo)
class SubscriptionInfoAdmin(admin.ModelAdmin):
    list_display = ("id", "browser", "endpoint_preview")
    search_fields = ("endpoint", "browser")
    list_filter = ("browser",)
    
    def endpoint_preview(self, obj):
        """Show truncated endpoint for readability."""
        if obj.endpoint:
            return obj.endpoint[:50] + "..." if len(obj.endpoint) > 50 else obj.endpoint
        return "-"
    endpoint_preview.short_description = "Endpoint"
