const CACHE_NAME = 'aes-cache-v1';

const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'libs/argon2-bundled.min.js',
  'icon-192.png',
  'icon-512.png',
  // Додай інші файли за потреби
];

// Інсталяція: кешуємо базові файли та активуємо нову версію відразу
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Активація: видаляємо старі кеші та контролюємо всі клієнти
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Обробка запитів: відповідаємо з кешу, паралельно оновлюємо його з мережі
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
      return cachedResponse || fetchPromise;
    }).catch(() => {
      // Опційно: показати offline-сторінку або повідомлення
    })
  );
});
