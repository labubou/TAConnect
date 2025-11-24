from django.urls import path
from instructor.time_slots.time_slots_operations import TimeSlotCreateView, TimeSlotDetailView
from .time_slots import update_status_slot
from .views import GetUserSlotsView, SearchInstructorsView, InstructorDataView
from .allowed_students.import_csv import CSVUploadView
from .allowed_students.allowed_students_operations import AllowedStudentsUpdateDeleteView, AllowedStudentsAddGetView

urlpatterns = [
    # URLs for time slots
    path('time-slots/', TimeSlotCreateView.as_view(), name='time-slots-create'),  # POST to create
    path('time-slots/<int:slot_id>/', TimeSlotDetailView.as_view(), name='time-slots-detail'),  # PATCH to update, DELETE to delete
    path('time-slots/toggle-slot-status/<int:slot_id>/', update_status_slot.update_time_slot_status, name='toggle-time-slot-status'),

    # URLs for allowed students
    path('allowed-students/<int:slot_id>/', AllowedStudentsAddGetView.as_view(), name='allowed-students-add-get'),
    path('allowed-students-detail/<int:allowed_student_id>/', AllowedStudentsUpdateDeleteView.as_view(), name='allowed-students-update-delete'),

    # URLs for user data
    path('get-user-slots/', GetUserSlotsView.as_view(), name='get-user-slots'),
    path('search-instructors/', SearchInstructorsView.as_view(), name='search-instructors'),
    path('get-instructor-data/<int:user_id>/', InstructorDataView.as_view(), name='get-instructor-data'),
    path('upload-csv/<int:slot_id>/', CSVUploadView.as_view(), name='upload-csv'),
]
