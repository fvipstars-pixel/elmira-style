const CACHE_NAME = 'elmira-style-v8';
const ASSETS = [
  './',
  './index.html',
  './oferta.html',
  './privacy.html',
  './consent-personal-data.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './media/hero-portrait.jpg',
  './media/portrait-secondary.jpg',
  './media/service-wardrobe.jpg',
  './media/service-shopping.jpg',
  './media/service-styling.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

function networkFirst(event) {
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
}

function cacheFirst(event) {
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          })
          .catch(() => cached)
    )
  );
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Pages, styles, and scripts go network-first so visitors always get the
  // latest content; the cache is only a fallback for offline viewing.
  // Images rarely change once deployed, so they stay cache-first for speed.
  const isImage = /\/(icons|media)\//.test(event.request.url);

  if (isImage) {
    cacheFirst(event);
  } else {
    networkFirst(event);
  }
});
