from ta_connect.settings import frontend_url
from ..send_email_bulk import send_email_bulk
import logging

logger = logging.getLogger(__name__)

# Default cancellation reasons for different scenarios
DEFAULT_CANCELLATION_REASONS = {
    'slot_disabled': 'The instructor has temporarily disabled this office hours time slot. You may check back later for availability.',
    'slot_deleted': 'This office hours time slot has been permanently removed from the instructor\'s schedule.',
    'manual': 'The instructor has cancelled this session. Please check for alternative available time slots or contact your instructor for more information.',
    'schedule_conflict': 'Due to a scheduling conflict, the instructor is unable to hold this session. We apologize for the inconvenience.',
}

def send_cancel_booking_email_mass(bookings, cancellation_reason=None):
    """
    Send cancellation emails in bulk for multiple bookings with improved messaging
    
    Args:
        bookings: QuerySet or list of Booking objects
        cancellation_reason: String explaining why the booking was cancelled. 
                           Can be a custom message or one of: 'slot_disabled', 'slot_deleted', 'manual', 'schedule_conflict'
                           If None, defaults to 'manual'
    
    Returns:
        dict: {'success': bool, 'sent_count': int, 'failed': list}
    """
    # Determine the cancellation reason
    if cancellation_reason is None:
        reason = DEFAULT_CANCELLATION_REASONS['manual']
    elif cancellation_reason in DEFAULT_CANCELLATION_REASONS:
        reason = DEFAULT_CANCELLATION_REASONS[cancellation_reason]
    else:
        reason = cancellation_reason
    
    email_data_list = []
    
    # Single loop to prepare all email data for both students and instructors
    for booking in bookings:
        student = booking.student
        instructor = booking.office_hour.instructor
        slot = booking.office_hour
        
        # Check email preferences
        student_wants_email = student.student_profile.email_notifications_on_cancellation
        
        # Currently disabled for instructors because this function is only used when instructors cancel office hours
        instructor_wants_email = False
        
        # Skip if neither wants email
        if not student_wants_email and not instructor_wants_email:
            continue
        
        # Format date and time once - booking.start_time is a DateTimeField (UTC)
        from utils.datetime_formatter import format_datetime_for_display
        formatted_date, formatted_time = format_datetime_for_display(booking.start_time)
        
        # Prepare shared email context
        email_context = {
            'student_name': f"{student.first_name} {student.last_name}" if student.first_name else student.username,
            'student_email': student.email,
            'instructor_name': f"{instructor.first_name} {instructor.last_name}" if instructor.first_name else instructor.username,
            'instructor_email': instructor.email,
            'course_name': slot.course_name if slot.course_name else 'N/A',
            'booking_date': formatted_date,
            'booking_time': formatted_time,
            'duration': slot.duration_minutes,
            'room': slot.room if hasattr(slot, 'room') and slot.room else None,
            'frontend_url': frontend_url,
            'cancellation_reason': reason,
        }
        
        # Add student email if they want notifications
        if student_wants_email:
            email_data_list.append({
                'subject': 'Office Hours Session Cancelled - TA Connect',
                'template_name': 'booking_bulk_cancellation_email_Student.html',
                'context': email_context,
                'recipient_email': student.email
            })
        
        # Add instructor email if they want notifications (currently disabled)
        if instructor_wants_email:
            email_data_list.append({
                'subject': 'Booking Cancellation Confirmation - TA Connect',
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
        logger.info(f"Sent {result['sent_count']} cancellation emails for {len(bookings)} bookings (Reason: {cancellation_reason or 'manual'})")
    else:
        logger.warning(f"Bulk cancellation emails completed with {len(result['failed'])} failures")
    
    return result
