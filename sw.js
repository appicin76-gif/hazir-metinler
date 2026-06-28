// sw.js dosyanızın en üstündeki ismi değiştirin
const CACHE_NAME = 'hazir-metinler-cache-v2'; // v1 ise v2 yapın

const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

// Yeni kodların hemen devreye girmesi için "activate" olayını güncelleyin
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Eski önbelleği siler
          }
        })
      );
    }).then(() => self.clients.claim()) // Yeni dosyaları hemen zorunlu kılar
  );
});
