import logging
from webpush import send_user_notification

logger = logging.getLogger(__name__)


def send_push_notification(user, payload, ttl=86400):
    """
    Send a web push notification to a user.
    
    Args:
        user: User object to send notification to
        payload: dict with notification data:
            - head: Notification title
            - body: Notification body text
            - icon: (optional) URL to notification icon
            - url: (optional) URL to open when notification is clicked
            - tag: (optional) Tag for notification grouping
            - requireInteraction: (optional) Whether notification requires user interaction
        ttl: Time to live in seconds (default 24 hours)
    
    Returns:
        dict: {'success': bool, 'message': str}
    """
    try:
        send_user_notification(
            user=user,
            payload=payload,
            ttl=ttl
        )
        logger.info(f"Push notification sent to user {user.id}: {payload.get('head', 'No title')}")
        return {'success': True, 'message': 'Notification sent successfully'}
    except Exception as e:
        logger.warning(f"Failed to send push notification to user {user.id}: {str(e)}")
        return {'success': False, 'message': str(e)}


def send_push_notification_bulk(users, payload, ttl=86400):
    """
    Send web push notifications to multiple users.
    
    Args:
        users: List or QuerySet of User objects
        payload: dict with notification data
        ttl: Time to live in seconds
    
    Returns:
        dict: {'success': bool, 'sent_count': int, 'failed_count': int}
    """
    sent_count = 0
    failed_count = 0
    
    for user in users:
        result = send_push_notification(user, payload, ttl)
        if result['success']:
            sent_count += 1
        else:
            failed_count += 1
    
    return {
        'success': failed_count == 0,
        'sent_count': sent_count,
        'failed_count': failed_count
    }
