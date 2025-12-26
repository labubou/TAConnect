import logging
from ta_connect.settings import frontend_url
from ..send_push_notification import send_push_notification_bulk

logger = logging.getLogger(__name__)

# Map reason codes to user-friendly messages
REASON_MESSAGES = {
    'room_update': 'The meeting location has been updated',
}

def format_booking_data(booking):
    """Extract and format booking data for notifications."""
    from utils.datetime_formatter import format_datetime_for_display
    
    student = booking.student
    instructor = booking.office_hour.instructor
    slot = booking.office_hour
    
    # Use 'start_time' which is a DateTimeField (UTC) - convert to Cairo timezone
    formatted_date, formatted_time = format_datetime_for_display(booking.start_time)
    
    student_name = f"{student.first_name} {student.last_name}".strip() or student.username
    instructor_name = f"{instructor.first_name} {instructor.last_name}".strip() or instructor.username
    course_name = slot.course_name if slot.course_name else 'Office Hours'
    room = slot.room if hasattr(slot, 'room') and slot.room else 'TBA'
    
    return {
        'student': student,
        'instructor': instructor,
        'student_name': student_name,
        'instructor_name': instructor_name,
        'course_name': course_name,
        'formatted_date': formatted_date,
        'formatted_time': formatted_time,
        'room': room,
        'booking_id': booking.id,
    }


def send_booking_update_push_mass(bookings, update_reason=None):
    """
    Send push notifications to all students for updated bookings.
    
    Args:
        bookings: List of Booking objects that were updated
        update_reason: Optional reason for update
    
    Returns:
        dict: {'success': bool, 'sent_count': int, 'failed_count': int}
    """
    reason_text = REASON_MESSAGES.get(update_reason, update_reason) if update_reason else 'Your booking has been updated'
    
    student_notifications = []
    
    for booking in bookings:
        try:
            data = format_booking_data(booking)
            
            # Prepare student notification
            student_notifications.append({
                'user': data['student'],
                'payload': {
                    "head": "📍 Booking Updated",
                    "body": f"Your booking with {data['instructor_name']} for {data['course_name']} on {data['formatted_date']} at {data['formatted_time']} has been updated. {reason_text}. New location: {data['room']}.",
                    "icon": f"{frontend_url}/Logo.png",
                    "url": f"{frontend_url}/student/manage-booked",
                    "tag": f"booking-updated-{data['booking_id']}",
                    "requireInteraction": True
                }
            })
        except Exception as e:
            logger.error(f"Error preparing update push for booking {booking.id}: {str(e)}")
    
    # Send notifications in bulk
    sent_count = 0
    failed_count = 0
    
    for notification in student_notifications:
        result = send_push_notification_bulk([notification['user']], notification['payload'])
        sent_count += result['sent_count']
        failed_count += result['failed_count']
    
    return {
        'success': failed_count == 0,
        'sent_count': sent_count,
        'failed_count': failed_count
    }

