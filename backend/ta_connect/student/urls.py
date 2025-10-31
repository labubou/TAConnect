from django.urls import path
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import url_data_slots
from .booking.get_book_times_for_day import book_slot

urlpatterns = [
    path('url/<int:slot_id>/', url_data_slots, name='url_data_slots'),
    path('get-book-slot-times/<int:slot_id>/', book_slot, name='book_slot'),
]
