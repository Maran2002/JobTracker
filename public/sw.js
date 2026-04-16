/* =============================================================
   CareerTrack — Service Worker (public/sw.js)
   Handles Web Push notifications
   ============================================================= */

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

/* ── Push received ── */
self.addEventListener('push', (e) => {
  if (!e.data) return;

  let payload;
  try {
    payload = e.data.json();
  } catch {
    payload = { title: 'CareerTrack', body: e.data.text(), link: '/' };
  }

  const { title = 'CareerTrack', body = '', link = '/', icon = '/favicon.ico' } = payload;

  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/favicon.ico',
      data: { link },
      vibrate: [200, 100, 200],
    })
  );
});

/* ── Notification clicked — open or focus the app ── */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();

  const link = e.notification.data?.link || '/';
  const fullUrl = new URL(link, self.location.origin).href;

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const existingWindow = windowClients.find(
        (w) => w.url.startsWith(self.location.origin)
      );
      if (existingWindow) {
        existingWindow.focus();
        existingWindow.navigate(fullUrl);
      } else {
        clients.openWindow(fullUrl);
      }
    })
  );
});
