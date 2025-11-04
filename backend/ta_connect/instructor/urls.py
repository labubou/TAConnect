from django.urls import path
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .time_slots import create_slot, update_slot, delete_slot, update_status_slot
from . import views

urlpatterns = [
    #urls of time slots
    path('time-slots/create-slot', create_slot.add_time_slot, name='create_time_slot'),
    path('time-slots/update-slot/<int:slot_id>', update_slot.update_time_slot, name='update_time_slot'),
    path('time-slots/delete-slot/<int:slot_id>/', delete_slot.del_slot, name='delete-time-slot'),
    path('time-slots/toggle-slot-status/<int:slot_id>/', update_status_slot.update_time_slot_status, name='toggle-time-slot-status'),

    #urls of the user data
    path('get-user-slots', views.get_user_slots, name='get-user-slots'),
    path('search-instructors', views.search_instructors, name='search-instructors'),
    path('get-instructor-data/<int:user_id>/', views.get_instructor_data, name='get-instructor-data'),
    
]
