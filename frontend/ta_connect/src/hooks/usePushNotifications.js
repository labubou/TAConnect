import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BDLnRsPxtyKUf2WxhE0DgYoOSJk_6yhalzM6Qb1KO0yEOPMtJ0CwUzlhsBk0QazQOs28TKENIoksCmea0eh143s';

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

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function getBrowserName() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'chrome';
  if (userAgent.includes('Firefox')) return 'firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'safari';
  if (userAgent.includes('Edg')) return 'edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'opera';
  return 'unknown';
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if push notifications are supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  // Check current subscription status
  const checkSubscription = useCallback(async () => {
    try {
      // Check with backend
      const response = await axios.get('/api/push/subscribe/');
      setIsSubscribed(response.data?.subscribed || false);
    } catch (err) {
      // If backend check fails, check locally
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (localErr) {
        console.error('Error checking subscription:', localErr);
        setIsSubscribed(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return { success: false, error: 'Not supported' };
    }

    setLoading(true);
    setError(null);

    try {
      // Request permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        setError('Notification permission denied');
        setLoading(false);
        return { success: false, error: 'Permission denied' };
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Convert keys to base64 strings
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');

      if (!p256dh || !auth) {
        throw new Error('Failed to get subscription keys');
      }

      // Send subscription to backend
      const response = await axios.post('/api/push/subscribe/', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(p256dh),
          auth: arrayBufferToBase64(auth)
        },
        browser: getBrowserName()
      });

      if (response.data?.success) {
        setIsSubscribed(true);
        setLoading(false);
        return { success: true };
      } else {
        throw new Error(response.data?.error || 'Failed to save subscription');
      }
    } catch (err) {
      console.error('Error subscribing to push:', err);
      setError(err.response?.data?.error || err.message || 'Failed to subscribe');
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, [isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Notify backend first
        await axios.delete('/api/push/subscribe/', {
          data: { endpoint: subscription.endpoint }
        });
        
        // Unsubscribe locally
        await subscription.unsubscribe();
      } else {
        // Just notify backend to clean up
        await axios.delete('/api/push/subscribe/', {
          data: {}
        });
      }

      setIsSubscribed(false);
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error unsubscribing:', err);
      setError(err.response?.data?.error || err.message || 'Failed to unsubscribe');
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  // Toggle subscription
  const toggle = useCallback(async () => {
    if (isSubscribed) {
      return unsubscribe();
    } else {
      return subscribe();
    }
  }, [isSubscribed, subscribe, unsubscribe]);

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
    toggle,
    checkSubscription
  };
}

export default usePushNotifications;
