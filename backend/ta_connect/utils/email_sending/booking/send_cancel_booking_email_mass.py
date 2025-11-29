from ta_connect.settings import frontend_url
from ..send_email_bulk import send_email_bulk
import logging

logger = logging.getLogger(__name__)

def send_cancel_booking_email_mass(bookings):
    """
    Send cancellation emails in bulk for multiple bookings
    
    Args:
        bookings: QuerySet or list of Booking objects
    
    Returns:
        dict: {'success': bool, 'sent_count': int, 'failed': list}
    """
    email_data_list = []
    
    # Single loop to prepare all email data for both students and instructors
    for booking in bookings:
        student = booking.student
        instructor = booking.office_hour.instructor
        slot = booking.office_hour
        
        # Check email preferences
        student_wants_email = student.student_profile.email_notifications_on_cancellation
        instructor_wants_email = instructor.instructor_profile.email_notifications_on_cancellation
        
        # Skip if neither wants email
        if not student_wants_email and not instructor_wants_email:
            continue
        
        # Format date and time once
        formatted_date = booking.date.strftime('%B %d, %Y') if hasattr(booking.date, 'strftime') else str(booking.date)
        formatted_time = booking.start_time.strftime('%I:%M %p') if hasattr(booking.start_time, 'strftime') else str(booking.start_time)
        
        # Prepare shared email context
        email_context = {
            'student_name': f"{student.first_name} {student.last_name}" if student.first_name else student.username,
            'student_email': student.email,
            'instructor_name': f"{instructor.first_name} {instructor.last_name}" if instructor.first_name else instructor.username,
            'course_name': slot.course_name if slot.course_name else 'N/A',
            'booking_date': formatted_date,
            'booking_time': formatted_time,
            'duration': slot.duration_minutes,
            'room': slot.room if hasattr(slot, 'room') and slot.room else None,
            'frontend_url': frontend_url,
        }
        
        # Add student email if they want notifications
        if student_wants_email:
            email_data_list.append({
                'subject': 'Booking Cancellation - TA Connect',
                'template_name': 'booking_cancellation_email_Student.html',
                'context': email_context,
                'recipient_email': student.email
            })
        
        # Add instructor email if they want notifications
        if instructor_wants_email:
            email_data_list.append({
                'subject': 'Booking Cancellation Received - TA Connect',
                'template_name': 'booking_cancellation_email_TA.html',
                'context': email_context,
                'recipient_email': instructor.email
            })
    
    if not email_data_list:
        logger.info("No cancellation emails to send (all users have notifications disabled)")
        return {
            'success': True,
            'sent_count': 0,
            'failed': []
        }
    
    # Send all emails in bulk with a single connection
    result = send_email_bulk(email_data_list)
    
    if result['success']:
        logger.info(f"Sent {result['sent_count']} cancellation emails for {len(bookings)} bookings")
    else:
        logger.warning(f"Bulk cancellation emails completed with {len(result['failed'])} failures")
    
    return result
