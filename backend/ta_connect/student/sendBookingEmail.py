# Re-export all booking email functions for backward compatibility
from utils.email_sending.booking import (
    send_booking_confirmation_email,
    send_booking_cancelled_email,
    send_booking_update_email,
)

__all__ = [
    'send_booking_confirmation_email',
    'send_booking_cancelled_email',
    'send_booking_update_email',
]