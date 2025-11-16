from ta_connect.settings import SITE_DOMAIN, frontend_url
from .send_email import send_email

def send_welcome_email(user):
    """Helper function to send welcome email"""
    current_site = SITE_DOMAIN.rstrip('/')
    
    context = {
        'user': user,
        'domain': current_site,
        'uid': user.pk,
        'token': '',
        'frontend_url': frontend_url
    }
    
    send_email(
        subject='Welcome to TAConnect!',
        template_name='welcome_email.html',
        context=context,
        recipient_email=user.email
    )
