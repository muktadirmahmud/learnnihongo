const CACHE_NAME = 'jp-app-v1';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(['/index.html', '/style.css', '/app.js', '/progress.js', '/data-loader.js', '/quiz.js'])));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => {
    return response || fetch(event.request).then(fetchRes => {
      return caches.open(CACHE_NAME).then(cache => {
        if (event.request.url.includes('/data/')) cache.put(event.request, fetchRes.clone());
        return fetchRes;
      });
    });
  }));
});
