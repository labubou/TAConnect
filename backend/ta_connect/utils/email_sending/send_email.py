from django.core.mail import send_mail
from django.template.loader import render_to_string
import logging

logger = logging.getLogger(__name__)

def send_email(subject, template_name, context, recipient_email, sender_email='taconnect.team@gmail.com'):
    """
    Generic helper function to send emails
    
    Args:
        subject: Email subject line
        template_name: Name of the HTML template to render
        context: Context dictionary for template rendering
        recipient_email: Recipient's email address
        sender_email: Sender's email address (defaults to taconnect.team@gmail.com)
    """
    try:
        message = render_to_string(template_name, context)
        send_mail(
            subject, 
            '', 
            sender_email, 
            [recipient_email], 
            html_message=message,
            fail_silently=False
        )
        logger.info(f"Email '{subject}' sent to {recipient_email}")
        print(f"Email '{subject}' sent to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email '{subject}' to {recipient_email}: {str(e)}")
        print(f"Failed to send email '{subject}' to {recipient_email}: {str(e)}")
        return False
