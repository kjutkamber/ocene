// Service Worker za push notifikacije
// Verzija: 1.0

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Prima poruku od glavne stranice i prikazuje notifikaciju
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: './favicon.ico',
      badge: './favicon.ico',
      vibrate: [200, 100, 200],
      tag: 'akademski-portal',
      renotify: true,
      data: { url: self.location.origin }
    });
  }
});

// Prikazuje push notifikaciju primljenu sa servera (Supabase Edge Function)
self.addEventListener('push', e => {
  let data = { title: 'Akademski portal', body: 'Imate novo obaveštenje.' };
  if (e.data) {
    try { data = e.data.json(); } catch(_) { data.body = e.data.text(); }
  }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './favicon.ico',
      badge: './favicon.ico',
      vibrate: [200, 100, 200],
      tag: 'akademski-portal',
      renotify: true,
      data: { url: self.location.origin }
    })
  );
});

// Klik na notifikaciju otvara stranicu
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(e.notification.data?.url || '/');
    })
  );
});
