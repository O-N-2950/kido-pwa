// ============================================================
// VIVOKID — Service Worker Push (souverain, VAPID)
// Importé par le SW Workbox généré (injecté via vite-plugin-pwa)
// ============================================================
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload = {};
  try { payload = event.data.json(); } catch { payload = { title: 'VIVOkid', body: event.data.text() }; }

  const options = {
    body: payload.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.tag || 'vivokid',
    renotify: payload.renotify || false,
    requireInteraction: payload.requireInteraction || false,
    vibrate: payload.tag === 'sos' ? [300, 100, 300, 100, 300] : [100, 50, 100],
    data: { url: payload.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(payload.title || 'VIVOkid', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) { c.navigate(url); return c.focus(); }
      }
      return clients.openWindow(url);
    })
  );
});
