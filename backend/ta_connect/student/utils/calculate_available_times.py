from datetime import datetime, timedelta
from django.utils import timezone
from student.models import Booking

def get_available_times(slot, date_obj):
    """
    Returns a list of available start times (HH:MM strings) for a given slot and date.
    """
    available_times = []
    
    #construct start and end datetimes for the slot on that specific date
    start_dt = datetime.combine(date_obj, slot.start_time)
    end_dt = datetime.combine(date_obj, slot.end_time)
    
    #Ensure timezone awareness to avoid "can't compare offset-naive and offset-aware datetimes" error
    if timezone.is_naive(start_dt):
        start_dt = timezone.make_aware(start_dt)
    if timezone.is_naive(end_dt):
        end_dt = timezone.make_aware(end_dt)
    
    # Get all active bookings for this slot on this date
    bookings = Booking.objects.filter(
        office_hour=slot,
        date=date_obj,
        is_cancelled=False
    )
    
    #store booked start times in a hash set for O(1) lookup after that
    booked_start_times = {b.start_time for b in bookings}
    
    current_dt = start_dt
    duration = timedelta(minutes=slot.duration_minutes)
    now = timezone.now()

    while current_dt + duration <= end_dt:
        # Skip past times
        if current_dt < now:
            current_dt += duration
            continue

        # Check if this time is booked using the hash set
        if current_dt not in booked_start_times:
            available_times.append(current_dt.strftime('%H:%M'))
            
        current_dt += duration
        
    return available_times
