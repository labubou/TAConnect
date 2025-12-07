import logging
from ta_connect.settings import frontend_url
from .send_push_notification import send_push_notification

logger = logging.getLogger(__name__)


def send_booking_pending_push(student, instructor, slot, booking_date, booking_time, booking_id):
    """
    Send push notifications for a pending booking to both student and instructor.
    
    Args:
        student: User object (student)
        instructor: User object (instructor/TA)
        slot: OfficeHourSlot object
        booking_date: Date object or string
        booking_time: Time object or string
        booking_id: The ID of the pending booking
    
    Returns:
        dict: {'success': bool, 'student_sent': bool, 'instructor_sent': bool}
    """
    # Format date and time
    if hasattr(booking_date, 'strftime'):
        formatted_date = booking_date.strftime('%B %d, %Y')
    else:
        formatted_date = str(booking_date)
    
    if hasattr(booking_time, 'strftime'):
        formatted_time = booking_time.strftime('%I:%M %p')
    else:
        formatted_time = str(booking_time)
    
    student_name = f"{student.first_name} {student.last_name}".strip() or student.username
    instructor_name = f"{instructor.first_name} {instructor.last_name}".strip() or instructor.username
    course_name = slot.course_name if slot.course_name else 'Office Hours'
    
    student_sent = False
    instructor_sent = False
    
    # Send to student
    student_payload = {
        "head": "Booking Pending Approval",
        "body": f"Your booking with {instructor_name} for {course_name} on {formatted_date} at {formatted_time} is pending approval.",
        "icon": f"{frontend_url}/static/icons/notification-icon.png",
        "url": f"{frontend_url}/student/manage-booked",
        "tag": f"booking-pending-{booking_id}",
        "requireInteraction": False
    }
    
    result = send_push_notification(student, student_payload)
    student_sent = result['success']
    
    # Send to instructor
    instructor_payload = {
        "head": "⚡ New Booking Request",
        "body": f"{student_name} requests {course_name} on {formatted_date} at {formatted_time}. Tap to review and approve.",
        "icon": f"{frontend_url}/static/icons/notification-icon.png",
        "url": f"{frontend_url}/ta/manage-bookings/?booking_id={booking_id}",
        "tag": f"booking-request-{booking_id}",
        "requireInteraction": True
    }
    
    result = send_push_notification(instructor, instructor_payload)
    instructor_sent = result['success']
    
    return {
        'success': student_sent or instructor_sent,
        'student_sent': student_sent,
        'instructor_sent': instructor_sent
    }


def send_booking_confirmed_push(student, instructor, slot, booking_date, booking_time, booking_id):
    """
    Send push notification to student when booking is confirmed.
    """
    if hasattr(booking_date, 'strftime'):
        formatted_date = booking_date.strftime('%B %d, %Y')
    else:
        formatted_date = str(booking_date)
    
    if hasattr(booking_time, 'strftime'):
        formatted_time = booking_time.strftime('%I:%M %p')
    else:
        formatted_time = str(booking_time)
    
    instructor_name = f"{instructor.first_name} {instructor.last_name}".strip() or instructor.username
    course_name = slot.course_name if slot.course_name else 'Office Hours'
    
    # Send to student
    student_payload = {
        "head": "✅ Booking Confirmed!",
        "body": f"Your booking with {instructor_name} for {course_name} on {formatted_date} at {formatted_time} has been confirmed.",
        "icon": f"{frontend_url}/static/icons/notification-icon.png",
        "url": f"{frontend_url}/student/manage-booked",
        "tag": f"booking-confirmed-{booking_id}",
        "requireInteraction": False
    }
    
    result = send_push_notification(student, student_payload)
    
    return {
        'success': result['success'],
        'student_sent': result['success']
    }


def send_booking_cancelled_push(student, instructor, slot, booking_date, booking_time, booking_id, cancelled_by='instructor'):
    """
    Send push notification when a booking is cancelled.
    
    Args:
        cancelled_by: 'instructor' or 'student' - determines who gets notified
    """
    if hasattr(booking_date, 'strftime'):
        formatted_date = booking_date.strftime('%B %d, %Y')
    else:
        formatted_date = str(booking_date)
    
    if hasattr(booking_time, 'strftime'):
        formatted_time = booking_time.strftime('%I:%M %p')
    else:
        formatted_time = str(booking_time)
    
    student_name = f"{student.first_name} {student.last_name}".strip() or student.username
    instructor_name = f"{instructor.first_name} {instructor.last_name}".strip() or instructor.username
    course_name = slot.course_name if slot.course_name else 'Office Hours'
    
    student_sent = False
    instructor_sent = False
    
    if cancelled_by == 'instructor':
        # Notify student that instructor cancelled
        student_payload = {
            "head": "❌ Booking Cancelled",
            "body": f"Your booking with {instructor_name} for {course_name} on {formatted_date} at {formatted_time} has been cancelled.",
            "icon": f"{frontend_url}/static/icons/notification-icon.png",
            "url": f"{frontend_url}/student/book",
            "tag": f"booking-cancelled-{booking_id}",
            "requireInteraction": False
        }
        result = send_push_notification(student, student_payload)
        student_sent = result['success']
    else:
        # Notify instructor that student cancelled
        instructor_payload = {
            "head": "Booking Cancelled",
            "body": f"{student_name} cancelled their {course_name} booking on {formatted_date} at {formatted_time}.",
            "icon": f"{frontend_url}/static/icons/notification-icon.png",
            "url": f"{frontend_url}/ta/manage-bookings",
            "tag": f"booking-cancelled-{booking_id}",
            "requireInteraction": False
        }
        result = send_push_notification(instructor, instructor_payload)
        instructor_sent = result['success']
    
    return {
        'success': student_sent or instructor_sent,
        'student_sent': student_sent,
        'instructor_sent': instructor_sent
    }
