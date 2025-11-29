from ta_connect.settings import SITE_DOMAIN, frontend_url
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from ..send_email import send_email

def send_change_email(user, email):
    """Helper function to send verification email"""
    current_site = SITE_DOMAIN.rstrip('/')
    
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    new_email_encoded = urlsafe_base64_encode(force_bytes(email))

    context = {
        'user': user,
        'domain': current_site,
        'frontend_url': frontend_url,
        'uid': uid,
        'token': token,
        'new_email': email,
        'new_email_encoded': new_email_encoded,
        'verification_url': f'{frontend_url}/verify-email-change/{uid}/{token}/{new_email_encoded}'
    }
    
    send_email(
        subject='Verify your new email address',
        template_name='activate_mail_change_send.html',
        context=context,
        recipient_email=email
    )
