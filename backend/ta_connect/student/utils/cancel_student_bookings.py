from student.models import Booking
from utils.email_sending.booking.send_cancel_booking_email_mass import send_cancel_booking_email_mass

def cancel_student_bookings(time_slot, bookings=None, cancellation_reason=None):
    """
    Cancel all student bookings associated with the given time slot.

    Args:
        time_slot (OfficeHourSlot): The time slot for which to cancel bookings.
        bookings (QuerySet, optional): Specific bookings to cancel. If None, cancels all non-cancelled, non-completed bookings.
        cancellation_reason (str, optional): Reason for cancellation. Can be:
            - 'slot_disabled': Time slot temporarily disabled
            - 'slot_deleted': Time slot permanently deleted
            - 'manual': Manual cancellation by instructor
            - 'schedule_conflict': Scheduling conflict
            - Custom message string
            If None, defaults to 'manual'

    Returns:
        tuple: A message and an error (if any).
    """

    try:
        if bookings is None:
            bookings = Booking.objects.filter(office_hour=time_slot, status__in=['pending', 'confirmed'], is_cancelled=False, is_completed=False)
            
        if not bookings.exists():
            return "No bookings to cancel.", None

        #cancel all bookings first
        cancelled_count = 0
        bookings_list = list(bookings)
        
        for booking in bookings_list:
            booking.cancel()
            booking.save()
            cancelled_count += 1

        #send bulk cancellation emails
        try:
            email_result = send_cancel_booking_email_mass(bookings_list, cancellation_reason)
            
            if email_result['failed']:
                print(f"Warning: {len(email_result['failed'])} cancellation emails failed to send")
                for failure in email_result['failed']:
                    print(f"  - Failed to send to {failure['recipient']}: {failure['error']}")
            
        except Exception as e:
            # Log error but don't fail the cancellation
            print(f"Failed to send bulk cancellation emails: {e}")

        return f"Cancelled {cancelled_count} bookings.", None

    except Exception as e:
        return None, str(e)