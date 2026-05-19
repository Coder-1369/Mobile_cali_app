const CACHE = 'training-v3';
const BASE = '/Mobile_cali_app/';

const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Handle navigation requests (important for installed PWA)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(BASE + 'index.html').then(cached => cached || fetch(BASE + 'index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});