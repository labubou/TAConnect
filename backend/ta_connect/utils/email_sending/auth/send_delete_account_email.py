from ta_connect.settings import frontend_url
from ..send_email import send_email


def send_delete_account_email(user_email):
    """
    Send account deletion confirmation email to the user.
    
    Args:
        user_email: The email address of the deleted user account
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    context = {
        'user_email': user_email,
        'frontend_url': frontend_url,
        'support_email': 'taconnect.team@gmail.com',
    }
    
    return send_email(
        subject='Account Deleted - TA Connect',
        template_name='account_deleted_email.html',
        context=context,
        recipient_email=user_email
    )
