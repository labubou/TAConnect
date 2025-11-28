from student.models import Booking
from student.sendBookingEmail import send_booking_cancelled_email

def cancel_student_bookings(time_slot, bookings=None):
    """
    Cancel all student bookings associated with the given time slot.

    Args:
        time_slot (OfficeHourSlot): The time slot for which to cancel bookings.
        bookings (QuerySet, optional): Specific bookings to cancel. If None, cancels all non-cancelled, non-completed bookings.

    Returns:
        tuple: A message and an error (if any).
    """

    try:
        if bookings is None:
            bookings = Booking.objects.filter(office_hour=time_slot, is_cancelled=False, is_completed=False)
            
        if not bookings.exists():
            return "No bookings to cancel.", None

        cancelled_count = 0
        for booking in bookings:
            booking.is_cancelled = True
            booking.save()
            cancelled_count += 1
            # Send email notification to the student
            try:
                send_booking_cancelled_email(
                    student=booking.student,
                    instructor=booking.office_hour.instructor,
                    slot=booking.office_hour,
                    booking_date=booking.date,
                    booking_time=booking.start_time
                )
            except Exception as e:
                # Log error but don't fail the cancellation
                print(f"Failed to send cancellation email: {e}")

        return f"Cancelled {cancelled_count} bookings.", None

    except Exception as e:
        return None, str(e)