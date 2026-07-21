const CACHE_NAME = 'pinaqualifi-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let browser fetch normally, with fallback to network
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
