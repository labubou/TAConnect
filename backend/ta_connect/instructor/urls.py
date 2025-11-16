from django.urls import path
from .time_slots.time_slots_operations import TimeSlotView
from .time_slots import update_status_slot
from .views import GetUserSlotsView, SearchInstructorsView, InstructorDataView

urlpatterns = [
    # URLs for time slots
    path('time-slots/', TimeSlotView.as_view(), name='time_slots'),  # POST to create
    path('time-slots/<int:slot_id>/', TimeSlotView.as_view(), name='time_slot_detail'),  # PATCH to update, DELETE to delete
    path('time-slots/toggle-slot-status/<int:slot_id>/', update_status_slot.update_time_slot_status, name='toggle-time-slot-status'),

    # URLs for user data
    path('get-user-slots/', GetUserSlotsView.as_view(), name='get-user-slots'),
    path('search-instructors/', SearchInstructorsView.as_view(), name='search-instructors'),
    path('get-instructor-data/<int:user_id>/', InstructorDataView.as_view(), name='get-instructor-data'),
]
