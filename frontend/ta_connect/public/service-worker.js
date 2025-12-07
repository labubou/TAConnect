/* eslint-disable no-restricted-globals */

// Handle push notifications
self.addEventListener('push', function(event) {
  if (!event.data) {
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      head: 'TA Connect',
      body: event.data.text()
    };
  }

  const options = {
    body: data.body || 'New notification from TA Connect',
    icon: data.icon || '/logo192.png',
    badge: '/logo192.png',
    tag: data.tag || 'ta-connect-notification',
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/'
    },
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.head || 'TA Connect', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  // Optional: track notification dismissals
  console.log('Notification closed:', event.notification.tag);
});
