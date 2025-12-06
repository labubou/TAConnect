from datetime import datetime
from django.utils import timezone

def complete_booking(booking):
    """
    Marks a booking as completed.
    Compares booking end time with current time in the same timezone.
    """
    now_utc = timezone.now()
    
    booking_end = booking.end_time

    print(f"Current UTC time: {now_utc}, Booking end time: {booking_end}")

    if not booking or booking.status not in ["confirmed", "pending"]:
        return False, "Invalid or cancelled booking."
    
    if not booking_end:
        return False, "Booking end time is not set."

    if booking.end_time >= now_utc:
         return False, "Booking has not ended yet."
    
    try:
        if booking.status == "confirmed":
            booking.complete()
            booking.save()
            return True, "Booking marked as completed."
        else:
            booking.cancel()
            booking.save()
            return True, "Booking was pending and is now cancelled."
    except Exception as e:
        print(f"Error completing booking: {e}")
        return False, "something went wrong while completing the booking."