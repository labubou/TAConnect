from ta_connect.settings import frontend_url
from ..send_email_bulk import send_email_bulk
import logging

logger = logging.getLogger(__name__)

# Default update reasons for different scenarios
DEFAULT_UPDATE_REASONS = {
    'room_update': 'Room Update to another location. Please check your booking details for the new room information.',
}

def send_update_booking_email_mass(bookings, update_reason='room_update'):
    """
    Send update emails in bulk for multiple bookings with improved messaging
    
    Args:
        bookings: QuerySet or list of Booking objects
        update_reason: String explaining why the booking was updated. 
                      Can be a custom message or one of: 'room_update'
                      If None, defaults to 'room_update'
    
    Returns:
        dict: {'success': bool, 'sent_count': int, 'failed': list}
    """
    # Determine the update reason
    if update_reason is None:
        reason = DEFAULT_UPDATE_REASONS['room_update']
    elif update_reason in DEFAULT_UPDATE_REASONS:
        reason = DEFAULT_UPDATE_REASONS[update_reason]
    else:
        reason = update_reason
    
    email_data_list = []
    
    # Single loop to prepare all email data for both students and instructors
    for booking in bookings:
        student = booking.student
        instructor = booking.office_hour.instructor
        slot = booking.office_hour
        
        # Check email preferences
        student_wants_email = student.student_profile.email_notifications_on_update
        
        # Currently disabled for instructors because this function is only used when instructors update office hours
        instructor_wants_email = False
        
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
            'instructor_email': instructor.email,
            'course_name': slot.course_name if slot.course_name else 'N/A',
            'booking_date': formatted_date,
            'booking_time': formatted_time,
            'duration': slot.duration_minutes,
            'room': slot.room if hasattr(slot, 'room') and slot.room else None,
            'frontend_url': frontend_url,
            'update_reason': reason,
        }
        
        # Add student email if they want notifications
        if student_wants_email:
            email_data_list.append({
                'subject': 'Office Hours Session Updated - TA Connect',
                'template_name': 'booking_room_update_email_Student.html',
                'context': email_context,
                'recipient_email': student.email
            })
        
        # Add instructor email if they want notifications (currently disabled)
        if instructor_wants_email:
            email_data_list.append({
                'subject': 'Booking Update Confirmation - TA Connect',
                'template_name': 'booking_update_email_TA.html',
                'context': email_context,
                'recipient_email': instructor.email
            })
    
    if not email_data_list:
        logger.info("No update emails to send (all users have notifications disabled)")
        return {
            'success': True,
            'sent_count': 0,
            'failed': []
        }
    
    # Send all emails in bulk with a single connection
    result = send_email_bulk(email_data_list)
    
    if result['success']:
        logger.info(f"Sent {result['sent_count']} update emails for {len(bookings)} bookings (Reason: {update_reason or 'room_update'})")
    else:
        logger.warning(f"Bulk update emails completed with {len(result['failed'])} failures")
    
    return result
