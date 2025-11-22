from django.utils import timezone
from student.models import Booking

def is_time_available(slot, date, start_dt, duration_minutes, exclude_booking_id=None) -> bool:
        """
        Return True if a booking starting at start_dt with duration fits inside slot
        and does not overlap other bookings (excluding exclude_booking_id).
        The method should operate on aware datetimes.
        """
        end_dt = start_dt + timezone.timedelta(minutes=duration_minutes)

        # Example overlap query (adjust field names as needed):
        qs = Booking.objects.filter(
            office_hour=slot,
            date=date,
            is_cancelled=False
        )
        if exclude_booking_id:
            qs = qs.exclude(id=exclude_booking_id)

        # assuming Booking.start_time is a datetime field
        for b in qs:
            b_start = b.start_time
            b_end = b.start_time + timezone.timedelta(minutes=b.office_hour.duration_minutes)
            if not (end_dt <= b_start or start_dt >= b_end):
                return False
        return True