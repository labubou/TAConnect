from ta_connect.settings import SITE_DOMAIN, frontend_url
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
import logging

logger = logging.getLogger(__name__)

def send_welcome_email(user):
    """Helper function to send welcome email"""
    try:
        mail_subject = 'Welcome to TAConnect!'
        current_site = SITE_DOMAIN.rstrip('/')
        
        context = {
            'user': user,
            'domain': current_site,
            'uid': user.pk, # Not needed here, but template expects it
            'token': '', # Not needed here, but template expects it
            'frontend_url': frontend_url
        }
        
        message = render_to_string('welcome_email.html', context)
        send_mail(
            mail_subject, 
            message, 
            'taconnect.team@gmail.com', 
            [user.email], 
            html_message=message,
            fail_silently=False
        )
        logger.info(f"Verification email sent to {user.email}")
        print(f"Verification email sent to {user.email}")
    except Exception as e:
        print(f"Failed to send verification email to {user.email}: {str(e)}")
        logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
