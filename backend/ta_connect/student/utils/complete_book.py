from datetime import datetime
from django.utils import timezone

def complete_booking(booking):
    """
    Marks a booking as completed.
    """
    now = timezone.now()
    
    if not booking or booking.status not in ["confirmed", "pending"]:
        return False, "Invalid or cancelled booking."
    if booking.end_time >= now:
        return False, "Booking has not ended yet."
    try:
        if booking.status == "confirmed":
            booking.completed()
            booking.save()
            return True, "Booking marked as completed."
        else:
            booking.cancel()()
            booking.save()
            return True, "Booking was pending and is now cancelled."
    except Exception as e:
        print(f"Error completing booking: {e}")
        return False, "something went wrong while completing the booking."