// Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('nutrition-tracker-v1').then((cache) => {
      return cache.addAll([
        '/nutrition-tracker/',
        '/nutrition-tracker/index.html',
        '/nutrition-tracker/nutrition-facts.html',
        '/nutrition-tracker/add-food.html',
        '/nutrition-tracker/script.js',
        '/nutrition-tracker/styles.css',
        '/nutrition-tracker/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});