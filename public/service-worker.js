const CACHE_NAME = 'morning-stars-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/animations.css',
  '/js/app.js',
  '/js/state.js',
  '/js/api.js',
  '/js/ui.js',
  '/js/helpers/validators.js',
  '/js/helpers/media.js',
  '/js/helpers/scroll.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  // Ne pas mettre en cache les requêtes API
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Stratégie Cache First pour les assets statiques
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
