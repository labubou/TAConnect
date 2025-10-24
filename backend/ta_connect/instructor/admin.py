from django.contrib import admin
from .models import OfficeHourSlot, BookingPolicy, TAAnalytics

# Register your models here.
@admin.register(OfficeHourSlot)
class OfficeHourSlotAdmin(admin.ModelAdmin):
    list_display = ('course_name', 'section', 'day_of_week', 'start_time', 'end_time')
    search_fields = ('course_name', 'section')
    list_filter = ('day_of_week',)

@admin.register(BookingPolicy)
class BookingPolicyAdmin(admin.ModelAdmin):
    list_display = ('office_hour_slot', 'require_university_email')
    search_fields = ('office_hour_slot__course_name',)
    list_filter = ('require_university_email',)

@admin.register(TAAnalytics)
class TAAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('instructor', 'total_sessions', 'average_rating')
    search_fields = ('instructor__username',)
    list_filter = ('last_updated',)
