from ta_connect.settings import SITE_DOMAIN, frontend_url
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from .send_email import send_email

def send_password_reset_email(user):
    """Helper function to send password reset email"""
    current_site = SITE_DOMAIN.rstrip('/')
    
    context = {
        'user': user,
        'domain': current_site,
        'frontend_url': frontend_url,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': default_token_generator.make_token(user),
    }
    
    send_email(
        subject='Reset your TAConnect password',
        template_name='password_reset_email.html',
        context=context,
        recipient_email=user.email
    )
