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
  '/js/helpers/scroll.js',
  '/js/helpers/views/auth.view.js',
  '/js/helpers/views/feed.view.js',
  '/js/helpers/views/upload.view.js',
  '/js/helpers/views/profile.view.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Network first for API calls
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
