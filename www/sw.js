const CACHE = 'training-v5';
const BASE = '/Mobile_cali_app/';

const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png'
];

// Install and cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Network-first for HTML pages
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache =>
            cache.put(BASE + 'index.html', copy)
          );
          return response;
        })
        .catch(() => caches.match(BASE + 'index.html'))
    );
    return;
  }

  // Cache-first for all other assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});