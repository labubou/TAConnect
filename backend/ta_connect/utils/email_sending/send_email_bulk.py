from django.core.mail import get_connection, EmailMultiAlternatives
from django.template.loader import render_to_string
import logging

logger = logging.getLogger(__name__)

def send_mass_html_mail(datatuple, fail_silently=False, user=None, password=None, 
                        connection=None):
    """
    Given a datatuple of (subject, text_content, html_content, from_email,
    recipient_list), sends each message to each recipient list. Returns the
    number of emails sent.

    If from_email is None, the DEFAULT_FROM_EMAIL setting is used.
    If auth_user and auth_password are set, they're used to log in.
    If auth_user is None, the EMAIL_HOST_USER setting is used.
    If auth_password is None, the EMAIL_HOST_PASSWORD setting is used.
    
    Source: https://stackoverflow.com/a/10215091/2142093
    Posted by semente, modified by community
    Retrieved 2025-11-29
    """
    connection = connection or get_connection(
        username=user, password=password, fail_silently=fail_silently)
    messages = []
    for subject, text, html, from_email, recipient in datatuple:
        message = EmailMultiAlternatives(subject, text, from_email, recipient)
        message.attach_alternative(html, 'text/html')
        messages.append(message)
    return connection.send_messages(messages)

def send_email_bulk(email_data_list, sender_email='taconnect.team@gmail.com'):
    """
    Generic helper function to send bulk emails using send_mass_html_mail
    
    Args:
        email_data_list: List of dictionaries, each containing:
            - subject: Email subject line
            - template_name: Name of the HTML template to render
            - context: Context dictionary for template rendering
            - recipient_email: Recipient's email address
        sender_email: Sender's email address (defaults to taconnect.team@gmail.com)
    
    Returns:
        dict: {'success': bool, 'sent_count': int, 'failed': list}
    """
    if not email_data_list:
        return {
            'success': True,
            'sent_count': 0,
            'failed': []
        }
    
    failed = []
    datatuple = []
    
    # Single loop to prepare all email data
    for email_data in email_data_list:
        try:
            subject = email_data['subject']
            template_name = email_data['template_name']
            context = email_data['context']
            recipient_email = email_data['recipient_email']
            
            html_content = render_to_string(template_name, context)
            
            # Add to datatuple: (subject, text_content, html_content, from_email, recipient_list)
            datatuple.append((
                subject,
                '',  # Plain text content (empty for HTML-only emails)
                html_content,
                sender_email,
                [recipient_email]
            ))
            
        except Exception as e:
            error_msg = f"Failed to prepare email for {email_data.get('recipient_email', 'unknown')}: {str(e)}"
            logger.error(error_msg)
            print(error_msg)
            failed.append({
                'recipient': email_data.get('recipient_email', 'unknown'),
                'error': str(e)
            })
    
    sent_count = 0
    if datatuple:
        try:
            # Send all emails in one connection - most efficient
            sent_count = send_mass_html_mail(datatuple, fail_silently=False)
            logger.info(f"Bulk email: {sent_count} emails sent successfully")
            print(f"Bulk email: {sent_count} emails sent successfully")
            
        except Exception as e:
            error_msg = f"Failed to send bulk emails: {str(e)}"
            logger.error(error_msg)
            print(error_msg)
            return {
                'success': False,
                'sent_count': 0,
                'failed': failed
            }
    
    return {
        'success': sent_count > 0,
        'sent_count': sent_count,
        'failed': failed
    }
