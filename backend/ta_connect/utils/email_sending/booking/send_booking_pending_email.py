from ta_connect.settings import frontend_url
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from ..send_email import send_email


def send_booking_pending_email(student, instructor, slot, booking_date, booking_time, booking_id):
    """
    Send pending booking notification emails to both student and instructor.
    This function is sent when a student creates a booking that requires instructor approval.

    Args:
        student: User object (student)
        instructor: User object (instructor/TA)
        slot: OfficeHourSlot object
        booking_date: Date object or string (YYYY-MM-DD)
        booking_time: Time object or string (HH:MM)
        booking_id: The ID of the pending booking
    
    Returns:
        dict: {'success': bool, 'student_sent': bool, 'instructor_sent': bool, 'errors': []}
    """
    errors = []
    student_sent = False
    instructor_sent = False
    
    # Check notification preferences
    if student.student_profile.email_notifications_on_booking is False:
        student_sent = True

    #?Removed this because instructors need to be notified of pending bookings to confirm it
    # if instructor.instructor_profile.email_notifications_on_booking is False:
    #     instructor_sent = True

    # Format date and time if they're objects
    if hasattr(booking_date, 'strftime'):
        formatted_date = booking_date.strftime('%B %d, %Y')
    else:
        formatted_date = booking_date

    if hasattr(booking_time, 'strftime'):
        formatted_time = booking_time.strftime('%I:%M %p')
    else:
        formatted_time = booking_time

    # Encode booking ID for URL
    encoded_booking_id = urlsafe_base64_encode(force_bytes(booking_id))
    
    # Generate approval URL for instructor
    approval_url = f"{frontend_url}/ta/pending-bookings/{booking_id}"

    # Prepare email context
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
        'booking_id': booking_id,
        'encoded_booking_id': encoded_booking_id,
        'approval_url': approval_url,
    }

    # Send email to student
    if not student_sent:
        result = send_email(
            subject='Booking Pending Approval - TA Connect',
            template_name='booking_pending_email_Student.html',
            context=email_context,
            recipient_email=student.email
        )
        if result:
            student_sent = True
        else:
            errors.append(f"Failed to send pending booking email to student: {student.email}")

    # Send email to instructor/TA
    if not instructor_sent:
        result = send_email(
            subject='New Booking Request - Action Required - TA Connect',
            template_name='booking_pending_email_TA.html',
            context=email_context,
            recipient_email=instructor.email
        )
        if result:
            instructor_sent = True
        else:
            errors.append(f"Failed to send pending booking email to instructor: {instructor.email}")

    return {
        'success': student_sent and instructor_sent,
        'student_sent': student_sent,
        'instructor_sent': instructor_sent,
        'errors': errors
    }
