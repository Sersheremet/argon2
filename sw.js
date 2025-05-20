const CACHE_NAME = 'aes-cache-v1'; // Назва кешу
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'libs/argon2-bundled.min.js', // Додано бібліотеку для кешу
  'icon-192.png', // Іконка
  'icon-512.png', // Іконка
  // Додавай сюди інші ресурси, якщо потрібно
];

// Інсталяція Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Оновлення кешу (кешуємо нові ресурси, якщо вони змінюються)
self.addEventListener('activate', (e) => {
  const cacheWhitelist = [CACHE_NAME];
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Видаляємо старі кеші
          }
        })
      );
    })
  );
});

// Обробка запитів
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request); // Якщо ресурс є в кеші — віддаємо його, якщо ні — завантажуємо з мережі
    })
  );
});
