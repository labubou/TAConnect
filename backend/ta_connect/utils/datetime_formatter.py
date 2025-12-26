"""
Utility functions for formatting datetimes in Cairo timezone for display.
All datetimes are stored in UTC in the database, but should be displayed
in Cairo timezone (Africa/Cairo) for users.
"""
from django.utils import timezone
import pytz


def format_datetime_for_display(dt, date_format='%B %d, %Y', time_format='%I:%M %p'):
    """
    Format a timezone-aware datetime (stored in UTC) for display in Cairo timezone.
    
    Args:
        dt: datetime object (timezone-aware, stored in UTC) or None
        date_format: strftime format string for date (default: '%B %d, %Y')
        time_format: strftime format string for time (default: '%I:%M %p')
    
    Returns:
        tuple: (formatted_date, formatted_time) or (None, None) if dt is None
    """
    if dt is None:
        return None, None
    
    # Ensure datetime is timezone-aware (should be UTC from database)
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt)
    
    # Convert UTC to Cairo timezone
    cairo_tz = pytz.timezone('Africa/Cairo')
    dt_cairo = dt.astimezone(cairo_tz)
    
    # Format date and time
    formatted_date = dt_cairo.strftime(date_format)
    formatted_time = dt_cairo.strftime(time_format)
    
    return formatted_date, formatted_time


def format_datetime_string(dt, date_format='%B %d, %Y', time_format='%I:%M %p'):
    """
    Format a timezone-aware datetime (stored in UTC) as a single string in Cairo timezone.
    
    Args:
        dt: datetime object (timezone-aware, stored in UTC) or None
        date_format: strftime format string for date (default: '%B %d, %Y')
        time_format: strftime format string for time (default: '%I:%M %p')
    
    Returns:
        str: Formatted datetime string or empty string if dt is None
    """
    if dt is None:
        return ''
    
    date_str, time_str = format_datetime_for_display(dt, date_format, time_format)
    return f"{date_str} at {time_str}" if date_str and time_str else ''

