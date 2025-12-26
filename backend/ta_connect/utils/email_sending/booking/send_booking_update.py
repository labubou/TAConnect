from ta_connect.settings import frontend_url
from ..send_email import send_email
from utils.datetime_formatter import format_datetime_for_display


def send_booking_update_email(student, instructor, slot, old_date, old_time, new_date, new_time):
    """
    Send booking update notification emails to both student and instructor.
    
    Args:
        student: User object (student)
        instructor: User object (instructor/TA)
        slot: OfficeHourSlot object
        old_date: Date object or string (YYYY-MM-DD)
        old_time: DateTimeField (timezone-aware UTC) or Time object or string (HH:MM)
        new_date: Date object or string (YYYY-MM-DD)
        new_time: DateTimeField (timezone-aware UTC) or Time object or string (HH:MM)
    
    Returns:
        dict: {'success': bool, 'student_sent': bool, 'instructor_sent': bool, 'errors': []}
    """
    errors = []
    student_sent = False
    instructor_sent = False
    
    # Check notification preferences
    if student.student_profile.email_notifications_on_update is False:
        student_sent = True

    if instructor.instructor_profile.email_notifications_on_update is False:
        instructor_sent = True

    # Format dates and times - handle both DateTimeField and separate date/time
    def format_datetime(date, time):
        if hasattr(time, 'isoformat'):  # DateTimeField
            return format_datetime_for_display(time)
        else:
            # Fallback for separate date and time
            if hasattr(date, 'strftime'):
                formatted_date = date.strftime('%B %d, %Y')
            else:
                formatted_date = date

            if hasattr(time, 'strftime'):
                formatted_time = time.strftime('%I:%M %p')
            else:
                formatted_time = time

            return formatted_date, formatted_time

    old_formatted_date, old_formatted_time = format_datetime(old_date, old_time)
    new_formatted_date, new_formatted_time = format_datetime(new_date, new_time)

    # Prepare email context
    email_context = {
        'student_name': f"{student.first_name} {student.last_name}" if student.first_name else student.username,
        'student_email': student.email,
        'instructor_name': f"{instructor.first_name} {instructor.last_name}" if instructor.first_name else instructor.username,
        'course_name': slot.course_name if slot.course_name else 'N/A',
        'old_booking_date': old_formatted_date,
        'old_booking_time': old_formatted_time,
        'new_booking_date': new_formatted_date,
        'new_booking_time': new_formatted_time,
        'duration': slot.duration_minutes,
        'room': slot.room if hasattr(slot, 'room') and slot.room else None,
        'frontend_url': frontend_url,
    }

    # Send email to student
    if not student_sent:
        result = send_email(
            subject='Booking Update - TA Connect',
            template_name='booking_update_email_Student.html',
            context=email_context,
            recipient_email=student.email
        )
        if result:
            student_sent = True
        else:
            errors.append(f"Failed to send booking update email to student: {student.email}")

    # Send email to instructor/TA
    if not instructor_sent:
        result = send_email(
            subject='Booking Update Received - TA Connect',
            template_name='booking_update_email_TA.html',
            context=email_context,
            recipient_email=instructor.email
        )
        if result:
            instructor_sent = True
        else:
            errors.append(f"Failed to send booking update email to instructor: {instructor.email}")

    return {
        'success': student_sent and instructor_sent,
        'student_sent': student_sent,
        'instructor_sent': instructor_sent,
        'errors': errors
    }
