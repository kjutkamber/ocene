// Service Worker — verzija 2.0 (VAPID push)

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Prima push sa servera (Supabase Edge Function)
self.addEventListener('push', e => {
  let data = { title: 'Studentski portal', body: 'Novo obaveštenje.' };
  if (e.data) {
    try { data = e.data.json(); } catch { data.body = e.data.text(); }
  }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './favicon.ico',
      badge: './favicon.ico',
      vibrate: [200, 100, 200],
      tag: 'studentski-portal',
      renotify: true,
      data: { url: self.location.origin }
    })
  );
});

// Prima poruku od stranice (za instant notifikacije)
self.addEventListener('message', e => {
  if (e.data?.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: './favicon.ico',
      vibrate: [200, 100, 200],
      tag: 'studentski-portal',
      renotify: true,
      data: { url: self.location.origin }
    });
  }
});

// Klik na notifikaciju otvara sajt
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(e.notification.data?.url || '/');
    })
  );
});
