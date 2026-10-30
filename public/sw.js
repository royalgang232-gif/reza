const CACHE_NAME = 'reza-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Periodic background sync or keepalive
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'reza-keepalive') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'KEEPALIVE_PULSE', timestamp: Date.now() });
        });
      })
    );
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Do not cache API proxy routes or WebSockets
  if (url.pathname.startsWith('/api/') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => cached);
    })
  );
});

// Listen to message from client to stay active
self.addEventListener('message', (event) => {
  if (event.data?.type === 'PING_BACKGROUND') {
    event.source?.postMessage({
      type: 'PONG_BACKGROUND',
      status: 'active',
      timestamp: Date.now(),
    });
  }
});
