"""
Google Calendar Integration Utility for TAConnect

This module provides functions to create, delete, and update calendar events
for booking appointments between students and instructors.
"""

from datetime import datetime, timedelta
from django.utils import timezone
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from decouple import config

# Google OAuth2 settings
GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID', default='')
GOOGLE_CLIENT_SECRET = config('GOOGLE_CLIENT_SECRET', default='')

# Calendar event colors (Google Calendar color IDs)
# https://developers.google.com/calendar/api/v3/reference/colors
EVENT_COLOR_PENDING = '5'  # Banana/Yellow
EVENT_COLOR_CONFIRMED = '10'  # Basil/Green


def get_calendar_service(user):
    """
    Get Google Calendar API service for a user.
    
    Args:
        user: User object with google_calendar_credentials
        
    Returns:
        Google Calendar API service object or None if credentials are invalid or calendar is disabled
    """
    try:
        # Check if user has calendar credentials
        if not hasattr(user, 'google_calendar_credentials'):
            print(f"User {user.username} has no Google Calendar credentials")
            return None
            
        creds_model = user.google_calendar_credentials
        
        # Check if calendar integration is enabled
        if not creds_model.calendar_enabled:
            print(f"User {user.username} has Google Calendar integration disabled")
            return None
        
        if not creds_model.has_valid_credentials():
            print(f"User {user.username} has no valid calendar credentials")
            return None
        
        # Build credentials object
        creds = Credentials(
            token=creds_model.access_token,
            refresh_token=creds_model.refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=GOOGLE_CLIENT_ID,
            client_secret=GOOGLE_CLIENT_SECRET,
        )
        
        # Refresh token if expired
        if creds_model.is_expired() and creds.refresh_token:
            try:
                creds.refresh(Request())
                # Update stored credentials
                creds_model.access_token = creds.token
                creds_model.token_expiry = timezone.now() + timedelta(seconds=3600)
                creds_model.save()
            except Exception as e:
                print(f"Failed to refresh token for {user.username}: {e}")
                return None
        
        # Build and return the Calendar service
        service = build('calendar', 'v3', credentials=creds)
        return service
        
    except Exception as e:
        print(f"Error getting calendar service for {user.username}: {e}")
        return None


def create_booking_event(user, booking, is_instructor=False):
    """
    Create a calendar event for a booking.
    
    Args:
        user: User object (student or instructor) whose calendar to add the event to
        booking: Booking model instance
        is_instructor: Boolean indicating if this is for the instructor's calendar
        
    Returns:
        Event ID string if successful, None otherwise
    """
    try:
        service = get_calendar_service(user)
        if not service:
            return None
            
        slot = booking.office_hour
        
        # Build event datetime from booking date and start_time
        # booking.start_time is a DateTimeField, so we can use it directly
        start_datetime = booking.start_time
        end_datetime = booking.end_time or (start_datetime + timedelta(minutes=slot.duration_minutes))
        
        # Build summary and description based on who owns this calendar
        if is_instructor:
            summary = f"Office Hours: {booking.student.full_name} - {slot.course_name}"
            description = (
                f"Student: {booking.student.full_name}\n"
                f"Email: {booking.student.email}\n"
                f"Course: {slot.course_name}\n"
            )
            if slot.section:
                description += f"Section: {slot.section}\n"
            if booking.book_description:
                description += f"\nNotes:\n{booking.book_description}"
        else:
            instructor_name = slot.instructor.full_name
            summary = f"Office Hours with {instructor_name} - {slot.course_name}"
            description = (
                f"Instructor: {instructor_name}\n"
                f"Email: {slot.instructor.email}\n"
                f"Course: {slot.course_name}\n"
            )
            if slot.section:
                description += f"Section: {slot.section}\n"
            if slot.room:
                description += f"Location Room: {slot.room}\n"
            if booking.book_description:
                description += f"\nNotes:\n{booking.book_description}"
        
        # Build the event body
        event = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': start_datetime.isoformat(),
                'timeZone': 'Africa/Cairo',  # Use Cairo timezone as per project settings
            },
            'end': {
                'dateTime': end_datetime.isoformat(),
                'timeZone': 'Africa/Cairo',
            },
            'colorId': EVENT_COLOR_CONFIRMED,
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 60},  # 1 hour before
                    {'method': 'popup', 'minutes': 30},  # 30 minutes before
                ],
            },
        }
        
        # Add location if available
        if slot.room:
            event['location'] = slot.room
        
        # Create the event
        created_event = service.events().insert(
            calendarId='primary',
            body=event
        ).execute()
        
        print(f"Calendar event created for {user.username}: {created_event.get('id')}")
        return created_event.get('id')
        
    except HttpError as e:
        print(f"Google Calendar API error for {user.username}: {e}")
        return None
    except Exception as e:
        print(f"Error creating calendar event for {user.username}: {e}")
        return None


def delete_booking_event(user, event_id):
    """
    Delete a calendar event.
    
    Args:
        user: User object whose calendar contains the event
        event_id: Google Calendar event ID string
        
    Returns:
        True if successful, False otherwise
    """
    try:
        if not event_id:
            return False
            
        service = get_calendar_service(user)
        if not service:
            return False
        
        service.events().delete(
            calendarId='primary',
            eventId=event_id
        ).execute()
        
        print(f"Calendar event deleted for {user.username}: {event_id}")
        return True
        
    except HttpError as e:
        # 404 means event was already deleted or doesn't exist
        if e.resp.status == 404:
            print(f"Calendar event not found for {user.username}: {event_id}")
            return True
        print(f"Google Calendar API error deleting event for {user.username}: {e}")
        return False
    except Exception as e:
        print(f"Error deleting calendar event for {user.username}: {e}")
        return False


def add_booking_to_calendars(booking):
    """
    Add booking events to both student's and instructor's Google Calendars.
    
    Args:
        booking: Booking model instance
        
    Returns:
        Tuple of (student_event_id, instructor_event_id)
    """
    student_event_id = None
    instructor_event_id = None
    
    # Add to student's calendar
    try:
        student_event_id = create_booking_event(
            user=booking.student,
            booking=booking,
            is_instructor=False
        )
        if student_event_id:
            booking.student_calendar_event_id = student_event_id
    except Exception as e:
        print(f"Failed to add event to student's calendar: {e}")
    
    # Add to instructor's calendar
    try:
        instructor = booking.office_hour.instructor
        instructor_event_id = create_booking_event(
            user=instructor,
            booking=booking,
            is_instructor=True
        )
        if instructor_event_id:
            booking.instructor_calendar_event_id = instructor_event_id
    except Exception as e:
        print(f"Failed to add event to instructor's calendar: {e}")
    
    # Save the event IDs to the booking
    if student_event_id or instructor_event_id:
        booking.save(update_fields=['student_calendar_event_id', 'instructor_calendar_event_id'])
    
    return student_event_id, instructor_event_id


def remove_booking_from_calendars(booking):
    """
    Remove booking events from both student's and instructor's Google Calendars.
    
    Args:
        booking: Booking model instance
        
    Returns:
        Tuple of (student_deleted, instructor_deleted) booleans
    """
    student_deleted = False
    instructor_deleted = False
    
    # Remove from student's calendar
    if booking.student_calendar_event_id:
        try:
            student_deleted = delete_booking_event(
                user=booking.student,
                event_id=booking.student_calendar_event_id
            )
            if student_deleted:
                booking.student_calendar_event_id = None
        except Exception as e:
            print(f"Failed to remove event from student's calendar: {e}")
    
    # Remove from instructor's calendar
    if booking.instructor_calendar_event_id:
        try:
            instructor = booking.office_hour.instructor
            instructor_deleted = delete_booking_event(
                user=instructor,
                event_id=booking.instructor_calendar_event_id
            )
            if instructor_deleted:
                booking.instructor_calendar_event_id = None
        except Exception as e:
            print(f"Failed to remove event from instructor's calendar: {e}")
    
    # Save the cleared event IDs
    if student_deleted or instructor_deleted:
        booking.save(update_fields=['student_calendar_event_id', 'instructor_calendar_event_id'])
    
    return student_deleted, instructor_deleted


def update_booking_event_location(user, event_id, new_location):
    """
    Update the location of a calendar event.
    
    Args:
        user: User object whose calendar contains the event
        event_id: Google Calendar event ID string
        new_location: New location/room string
        
    Returns:
        True if successful, False otherwise
    """
    try:
        if not event_id:
            return False
            
        service = get_calendar_service(user)
        if not service:
            return False
        
        # Get the existing event
        event = service.events().get(
            calendarId='primary',
            eventId=event_id
        ).execute()
        
        # Update the location
        event['location'] = new_location
        
        # Update the event
        updated_event = service.events().update(
            calendarId='primary',
            eventId=event_id,
            body=event
        ).execute()
        
        print(f"Calendar event location updated for {user.username}: {event_id} -> {new_location}")
        return True
        
    except HttpError as e:
        # 404 means event was already deleted or doesn't exist
        if e.resp.status == 404:
            print(f"Calendar event not found for {user.username}: {event_id}")
            return False
        print(f"Google Calendar API error updating event location for {user.username}: {e}")
        return False
    except Exception as e:
        print(f"Error updating calendar event location for {user.username}: {e}")
        return False


def update_booking_calendar_locations(booking, new_room):
    """
    Update calendar event locations for both student's and instructor's Google Calendars.
    
    Args:
        booking: Booking model instance
        new_room: New room/location string
        
    Returns:
        Tuple of (student_updated, instructor_updated) booleans
    """
    student_updated = False
    instructor_updated = False
    
    # Update student's calendar event location
    if booking.student_calendar_event_id:
        try:
            student_updated = update_booking_event_location(
                user=booking.student,
                event_id=booking.student_calendar_event_id,
                new_location=new_room
            )
        except Exception as e:
            print(f"Failed to update event location in student's calendar: {e}")
    
    # Update instructor's calendar event location
    if booking.instructor_calendar_event_id:
        try:
            instructor = booking.office_hour.instructor
            instructor_updated = update_booking_event_location(
                user=instructor,
                event_id=booking.instructor_calendar_event_id,
                new_location=new_room
            )
        except Exception as e:
            print(f"Failed to update event location in instructor's calendar: {e}")
    
    return student_updated, instructor_updated


def update_bookings_calendar_locations_mass(bookings, new_room):
    """
    Update calendar event locations for multiple bookings in bulk.
    
    Args:
        bookings: QuerySet or list of Booking objects
        new_room: New room/location string
        
    Returns:
        dict: {'success': bool, 'updated_count': int, 'failed_count': int}
    """
    updated_count = 0
    failed_count = 0
    
    for booking in bookings:
        try:
            student_updated, instructor_updated = update_booking_calendar_locations(booking, new_room)
            if student_updated or instructor_updated:
                updated_count += 1
            else:
                failed_count += 1
        except Exception as e:
            print(f"Failed to update calendar locations for booking {booking.id}: {e}")
            failed_count += 1
    
    return {
        'success': failed_count == 0,
        'updated_count': updated_count,
        'failed_count': failed_count
    }
