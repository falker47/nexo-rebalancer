const CACHE_NAME = 'nexo-v4'; // Ho incrementato la versione
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './assets/site.webmanifest',
  './assets/web-app-manifest-192x192.png',
  './assets/web-app-manifest-512x512.png',
  './assets/favicon-96x96.png',
  './assets/favicon.svg',
  './assets/apple-touch-icon.png'
];

// Installazione
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Fetch
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
