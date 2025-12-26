import logging
from ta_connect.settings import frontend_url
from ..send_push_notification import send_push_notification_bulk

logger = logging.getLogger(__name__)

# Map reason codes to user-friendly messages
REASON_MESSAGES = {
    'slot_disabled': 'The time slot has been temporarily disabled',
    'slot_deleted': 'The time slot has been removed',
    'manual': 'The instructor has cancelled this session',
    'schedule_conflict': 'Due to a scheduling conflict',
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
    
    return {
        'student': student,
        'instructor': instructor,
        'student_name': student_name,
        'instructor_name': instructor_name,
        'course_name': course_name,
        'formatted_date': formatted_date,
        'formatted_time': formatted_time,
        'booking_id': booking.id,
    }


def send_booking_cancelled_push_mass(bookings, cancellation_reason=None):
    """
    Send push notifications to all students and instructors for cancelled bookings.
    
    Args:
        bookings: List of Booking objects that were cancelled
        cancellation_reason: Optional reason for cancellation
    
    Returns:
        dict: {'success': bool, 'sent_count': int, 'failed_count': int}
    """
    reason_text = REASON_MESSAGES.get(cancellation_reason, cancellation_reason) if cancellation_reason else 'The session has been cancelled'
    
    student_notifications = []
    instructor_notifications = []
    
    for booking in bookings:
        try:
            data = format_booking_data(booking)
            
            # Prepare student notification
            student_notifications.append({
                'user': data['student'],
                'payload': {
                    "head": "❌ Booking Cancelled",
                    "body": f"Your booking with {data['instructor_name']} for {data['course_name']} on {data['formatted_date']} at {data['formatted_time']} has been cancelled. {reason_text}.",
                    "icon": f"{frontend_url}/Logo.png",
                    "url": f"{frontend_url}/student/manage-booked",
                    "tag": f"booking-cancelled-{data['booking_id']}",
                    "requireInteraction": True
                }
            })
            
            # Prepare instructor notification
            instructor_notifications.append({
                'user': data['instructor'],
                'payload': {
                    "head": "Booking Cancellation Confirmed",
                    "body": f"Booking with {data['student_name']} for {data['course_name']} on {data['formatted_date']} at {data['formatted_time']} has been cancelled.",
                    "icon": f"{frontend_url}/Logo.png",
                    "url": f"{frontend_url}/ta/manage-bookings",
                    "tag": f"booking-cancelled-instructor-{data['booking_id']}",
                    "requireInteraction": False
                }
            })
        except Exception as e:
            logger.error(f"Error preparing cancellation push for booking {booking.id}: {str(e)}")
    
    # Send notifications in bulk
    all_notifications = student_notifications + instructor_notifications
    users = [n['user'] for n in all_notifications]
    
    # Since each user gets a unique payload, we need to send individually but can use bulk pattern
    sent_count = 0
    failed_count = 0
    
    for notification in all_notifications:
        result = send_push_notification_bulk([notification['user']], notification['payload'])
        sent_count += result['sent_count']
        failed_count += result['failed_count']
    
    return {
        'success': failed_count == 0,
        'sent_count': sent_count,
        'failed_count': failed_count
    }
