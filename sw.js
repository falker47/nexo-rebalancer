const CACHE_NAME = 'nexo-v2'; // Ho incrementato la versione
const ASSETS = [
  './',
  './index.html',
  './site.webmanifest',              // Era manifest.json
  './web-app-manifest-192x192.png',  // Era icon-192.png
  './web-app-manifest-512x512.png',  // Era icon-512.png
  './favicon-96x96.png',
  './favicon.svg',
  './apple-touch-icon.png'
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
