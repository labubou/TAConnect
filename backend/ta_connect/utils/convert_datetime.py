from django.utils import timezone
import pytz

def get_cairo_time(dt=None):
    """
    Converts a datetime object to Cairo time.
    If no argument is provided, returns the current time in Cairo.
    """
    # 1. Define Cairo Timezone
    cairo_tz = pytz.timezone('Africa/Cairo')

    # 2. If no time is provided, get 'now' in UTC
    if dt is None:
        dt = timezone.now()

    # 3. Convert to Cairo
    return dt.astimezone(cairo_tz)