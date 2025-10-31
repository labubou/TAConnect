from django.urls import path
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import url_data_slots
from .booking.get_book_times_for_day import get_book_times_for_day
from .booking.book_slot import book_slot
from .booking.cancel_booked_slot import cancel_slot
from .booking.update_booked_slot import update_slot

urlpatterns = [
    path('url/<int:slot_id>/', url_data_slots, name='url_data_slots'),
    path('get-book-slot-times/<int:slot_id>/', get_book_times_for_day, name='get_book_slot_times'),
    path('book-slot/<int:slot_id>/', book_slot, name='book_slot'),
    path('cancel-booked-slot/<int:booking_id>/', cancel_slot, name='cancel_booked_slot'),
    path('update-booked-slot/<int:booking_id>/', update_slot, name='update_booked_slot'),
]
