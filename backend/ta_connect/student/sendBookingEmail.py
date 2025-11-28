from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings


def send_booking_confirmation_email(student, instructor, slot, booking_date, booking_time, send_to_student=True):
    """
    Send booking confirmation emails to both student and instructor.
    
    Args:
        student: User object (student)
        instructor: User object (instructor/TA)
        slot: OfficeHourSlot object
        booking_date: Date object or string (YYYY-MM-DD)
        booking_time: Time object or string (HH:MM)
        send_to_student: bool - Whether to send email to student (default: True)
    
    Returns:
        dict: {'success': bool, 'student_sent': bool, 'instructor_sent': bool, 'errors': []}
    """
    errors = []
    student_sent = False
    instructor_sent = False
    
    if student.student_profile.email_notifications_on_booking is False:
        student_sent = True

    if instructor.instructor_profile.email_notifications_on_booking is False:
        instructor_sent = True

    try:
        from ta_connect.settings import frontend_url
    except ImportError:
        frontend_url = None

    # Format date and time if they're objects
    if hasattr(booking_date, 'strftime'):
        formatted_date = booking_date.strftime('%B %d, %Y')
    else:
        formatted_date = booking_date

    if hasattr(booking_time, 'strftime'):
        formatted_time = booking_time.strftime('%I:%M %p')
    else:
        formatted_time = booking_time

    # Prepare email context
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

    if student_sent is False:
        # Send email to student
        try:
            mail_subject = 'Booking Confirmation - TA Connect'
            message = render_to_string('booking_confirmation_email_Student.html', email_context)
            send_mail(
                mail_subject,
                message,
                'taconnect.team@gmail.com',
                [student.email],
                html_message=message
            )
            student_sent = True
        except Exception as email_error:
            error_msg = f"Failed to send booking confirmation email to student: {str(email_error)}"
            print(error_msg)
            errors.append(error_msg)

    if instructor_sent is False:
        # Send email to instructor/TA
        try:
            mail_subject = 'New Booking Received - TA Connect'
            message = render_to_string('booking_confirmation_email_TA.html', email_context)
            send_mail(
                mail_subject,
                message,
                'taconnect.team@gmail.com',
                [instructor.email],
                html_message=message
            )
            instructor_sent = True
        except Exception as email_error:
            error_msg = f"Failed to send booking confirmation email to instructor: {str(email_error)}"
            print(error_msg)
            errors.append(error_msg)

    return {
        'success': student_sent and instructor_sent,
        'student_sent': student_sent,
        'instructor_sent': instructor_sent,
        'errors': errors
    }

def send_booking_cancelled_email(student, instructor, slot, booking_date, booking_time):
    """
    Send booking cancellation notification emails to both student and instructor.
    
    Args:
        student: User object (student)
        instructor: User object (instructor/TA)
        slot: OfficeHourSlot object
        booking_date: Date object or string (YYYY-MM-DD)
        booking_time: Time object or string (HH:MM)
        send_to_student: bool - Whether to send email to student (default: True)
    
    Returns:
        dict: {'success': bool, 'student_sent': bool, 'instructor_sent': bool, 'errors': []}
    """
    errors = []
    student_sent = False
    instructor_sent = False
    
    if student.student_profile.email_notifications_on_cancellation is False:
        student_sent = True

    if instructor.instructor_profile.email_notifications_on_cancellation is False:
        instructor_sent = True

    try:
        from ta_connect.settings import frontend_url
    except ImportError:
        frontend_url = None

    # Format date and time if they're objects
    if hasattr(booking_date, 'strftime'):
        formatted_date = booking_date.strftime('%B %d, %Y')
    else:
        formatted_date = booking_date

    if hasattr(booking_time, 'strftime'):
        formatted_time = booking_time.strftime('%I:%M %p')
    else:
        formatted_time = booking_time

    # Prepare email context
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

    if student_sent is False:
        # Send email to student
        try:
            mail_subject = 'Booking Cancellation - TA Connect'
            message = render_to_string('booking_cancellation_email_Student.html', email_context)
            send_mail(
                mail_subject,
                message,
                'taconnect.team@gmail.com',
                [student.email],
                html_message=message
            )
            student_sent = True
        except Exception as email_error:
            error_msg = f"Failed to send booking cancellation email to student: {str(email_error)}"
            print(error_msg)
            errors.append(error_msg)

    if instructor_sent is False:
        # Send email to instructor/TA
        try:
            mail_subject = 'Booking Cancellation Received - TA Connect'
            message = render_to_string('booking_cancellation_email_TA.html', email_context)
            send_mail(
                mail_subject,
                message,
                'taconnect.team@gmail.com',
                [instructor.email],
                html_message=message
            )
            instructor_sent = True
        except Exception as email_error:
            error_msg = f"Failed to send booking cancellation email to instructor: {str(email_error)}"
            print(error_msg)
            errors.append(error_msg)

    return {
        'success': student_sent and instructor_sent,
        'student_sent': student_sent,
        'instructor_sent': instructor_sent,
        'errors': errors
    }
