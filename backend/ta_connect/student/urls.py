from django.urls import path
from .booking.Booking_operation import BookingCreateView, BookingDetailView

urlpatterns = [
    path('booking/', BookingCreateView.as_view(), name='booking_create'), # Create booking
    path('booking/<int:pk>/', BookingDetailView.as_view(), name='booking_detail') # Update, Cancel, and Get Available Times
]
