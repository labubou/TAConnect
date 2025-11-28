from datetime import datetime
from django.utils import timezone

def complete_booking(booking):
    """
    Marks a booking as completed.
    """
    now = timezone.now()
    
    if not booking or booking.is_cancelled:
        return False, "Invalid or cancelled booking."
    if booking.end_time >= now:
        return False, "Booking has not ended yet."
    try:
        booking.is_completed = True
        booking.save()
        return True, "Booking marked as completed."
    except Exception as e:
        print(f"Error completing booking: {e}")
        return False, "something went wrong while completing the booking."