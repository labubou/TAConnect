from datetime import datetime
from django.utils import timezone

def complete_booking(booking):
    success, message = booking.complete_if_ended()
    print(message)
    return success, message