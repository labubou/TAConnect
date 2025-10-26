from django.urls import path
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .time_slots import create_slot, update_slot

urlpatterns = [
    path('time-slots/create-slot', create_slot.add_time_slot, name='create_time_slot'),
    path('time-slots/update-slot/<int:slot_id>', update_slot.update_time_slot, name='update_time_slot'),
]
