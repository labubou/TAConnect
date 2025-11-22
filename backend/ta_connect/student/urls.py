from django.urls import path
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import url_data_slots
from .booking.Booking_operation import BookingView


urlpatterns = [
    path('url/<int:slot_id>/', url_data_slots, name='url_data_slots'),
    path('booking/', BookingView.as_view(), name='booking_operation'),
    path('booking/<int:pk>/', BookingView.as_view(), name='booking_operation_detail')
   
]
