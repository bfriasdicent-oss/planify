const CACHE = 'planify-v2';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// Recibir mensaje desde la app para mostrar notificación
self.addEventListener('message', e => {
  if(e.data && e.data.type === 'NOTIFY'){
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: e.data.tag || 'planify',
      data: { url: e.data.url || './' },
      requireInteraction: true,
      actions: [
        { action: 'open', title: '📋 Ver tarea' },
        { action: 'dismiss', title: 'Cerrar' }
      ]
    });
  }
});

// Al hacer clic en la notificación, abrir la app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if(e.action === 'dismiss') return;
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for(const client of list){
        if(client.url.includes('planify') && 'focus' in client){
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
