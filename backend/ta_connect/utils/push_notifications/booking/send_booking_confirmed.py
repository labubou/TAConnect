import logging
from ta_connect.settings import frontend_url
from ..send_push_notification import send_push_notification

logger = logging.getLogger(__name__)

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
        "icon": f"{frontend_url}/Logo.png",
        "url": f"{frontend_url}/student/manage-booked",
        "tag": f"booking-confirmed-{booking_id}",
        "requireInteraction": False
    }
    
    result = send_push_notification(student, student_payload)
    
    return {
        'success': result['success'],
        'student_sent': result['success']
    }