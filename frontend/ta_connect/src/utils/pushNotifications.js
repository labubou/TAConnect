import axios from 'axios';

// VAPID public key from your backend settings
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BDLnRsPxtyKUf2WxhE0DgYoOSJk_6yhalzM6Qb1KO0yEOPMtJ0CwUzlhsBk0QazQOs28TKENIoksCmea0eh143s';

/**
 * Convert a base64 string to Uint8Array (required for applicationServerKey)
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission() {
  if (!isPushNotificationSupported()) {
    return { success: false, error: 'Push notifications not supported' };
  }

  try {
    const permission = await Notification.requestPermission();
    return { 
      success: permission === 'granted', 
      permission 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe user to push notifications
 */
export async function subscribeToPushNotifications() {
  if (!isPushNotificationSupported()) {
    return { success: false, error: 'Push notifications not supported' };
  }

  try {
    // Request permission first
    const permissionResult = await requestNotificationPermission();
    if (!permissionResult.success) {
      return permissionResult;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    // If no subscription exists, create one
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    // Send subscription to backend
    const response = await axios.post('/api/push/subscribe/', {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
      }
    });

    return { 
      success: true, 
      subscription,
      serverResponse: response.data 
    };
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      
      // Notify backend
      await axios.delete('/api/push/subscribe/', {
        data: { endpoint: subscription.endpoint }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isSubscribedToPushNotifications() {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}
