from ta_connect.settings import SITE_DOMAIN, frontend_url
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
import logging

logger = logging.getLogger(__name__)

def send_verification_email(user):
    """Helper function to send verification email"""
    try:
        mail_subject = 'Activate your TAConnect account'
        current_site = SITE_DOMAIN.rstrip('/')
        
        context = {
            'user': user,
            'domain': current_site,
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': default_token_generator.make_token(user),
            'frontend_url': frontend_url
        }
        
        message = render_to_string('activate_mail_send.html', context)
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
        
