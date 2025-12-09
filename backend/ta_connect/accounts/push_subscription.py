#This file is Vibe-Coded
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from webpush.models import PushInformation, SubscriptionInfo, Group
import json
import logging

logger = logging.getLogger(__name__)

class PushSubscriptionView(APIView):
    """
    Handle web push notification subscriptions.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Subscribe to push notifications.
        
        Expected payload:
        {
            "endpoint": "https://...",
            "keys": {
                "p256dh": "...",
                "auth": "..."
            }
        }
        """
        try:
            subscription_data = request.data
            
            endpoint = subscription_data.get('endpoint')
            if not endpoint:
                return Response(
                    {'error': 'Endpoint is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            keys = subscription_data.get('keys', {})
            p256dh = keys.get('p256dh', '')
            auth = keys.get('auth', '')
            
            if not p256dh or not auth:
                return Response(
                    {'error': 'Keys (p256dh and auth) are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if subscription already exists for this endpoint
            existing_subscription = SubscriptionInfo.objects.filter(endpoint=endpoint).first()
            
            if existing_subscription:
                # Update existing subscription
                existing_subscription.p256dh = p256dh
                existing_subscription.auth = auth
                existing_subscription.save()
                
                # Check if PushInformation exists for this user
                push_info = PushInformation.objects.filter(user=request.user).first()
                if push_info:
                    # Update to use this subscription
                    push_info.subscription = existing_subscription
                    push_info.save()
                else:
                    # Create new PushInformation
                    PushInformation.objects.create(
                        user=request.user,
                        subscription=existing_subscription
                    )
                
                logger.info(f"Updated push subscription for user {request.user.id}")
                return Response({
                    'success': True,
                    'message': 'Subscription updated successfully',
                    'created': False
                }, status=status.HTTP_200_OK)
            else:
                # Create new subscription
                new_subscription = SubscriptionInfo.objects.create(
                    endpoint=endpoint,
                    p256dh=p256dh,
                    auth=auth,
                    browser=subscription_data.get('browser', 'unknown')
                )
                
                # Check if user already has PushInformation
                push_info = PushInformation.objects.filter(user=request.user).first()
                if push_info:
                    # Update to use new subscription (delete old one if orphaned)
                    old_subscription = push_info.subscription
                    push_info.subscription = new_subscription
                    push_info.save()
                    
                    # Clean up old subscription if no longer used
                    if old_subscription and not PushInformation.objects.filter(subscription=old_subscription).exists():
                        old_subscription.delete()
                else:
                    # Create new PushInformation
                    PushInformation.objects.create(
                        user=request.user,
                        subscription=new_subscription
                    )
                
                logger.info(f"Created push subscription for user {request.user.id}")
                return Response({
                    'success': True,
                    'message': 'Subscription saved successfully',
                    'created': True
                }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating push subscription: {str(e)}")
            return Response(
                {'error': "An error occurred while processing the subscription."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request):
        """
        Unsubscribe from push notifications.
        """
        try:
            endpoint = request.data.get('endpoint')
            
            if endpoint:
                # Delete specific subscription
                subscription = SubscriptionInfo.objects.filter(endpoint=endpoint).first()
                if subscription:
                    # Delete associated PushInformation first
                    PushInformation.objects.filter(
                        user=request.user,
                        subscription=subscription
                    ).delete()
                    
                    # Delete subscription if no longer used
                    if not PushInformation.objects.filter(subscription=subscription).exists():
                        subscription.delete()
            else:
                # Delete all subscriptions for user
                push_infos = PushInformation.objects.filter(user=request.user)
                for push_info in push_infos:
                    subscription = push_info.subscription
                    push_info.delete()
                    # Delete subscription if orphaned
                    if subscription and not PushInformation.objects.filter(subscription=subscription).exists():
                        subscription.delete()
            
            logger.info(f"Removed push subscription for user {request.user.id}")
            return Response({
                'success': True,
                'message': 'Unsubscribed successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error removing push subscription: {str(e)}")
            return Response(
                {'error': "An error occurred while processing the subscription."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        """
        Check if user is subscribed to push notifications.
        """
        try:
            is_subscribed = PushInformation.objects.filter(
                user=request.user,
                subscription__isnull=False
            ).exists()
            
            return Response({
                'subscribed': is_subscribed
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error checking push subscription: {str(e)}")
            return Response(
                {'error': "An error occurred while processing the subscription."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
