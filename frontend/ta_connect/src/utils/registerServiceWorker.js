export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Service Worker registered successfully:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('Service Worker update found');
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('New Service Worker installed, refresh to update');
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();
    console.log('Service Worker unregistered:', success);
    return success;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
}
