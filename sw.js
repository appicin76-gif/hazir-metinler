// Versiyon numarasını v3'ten v4'e yükselterek tarayıcıya "eski hafızayı sil, yenileri yükle" talimatı veriyoruz
const CACHE_NAME = 'hazir-metin-v4'; 

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Kurulum ve Dosyaları Önbelleğe Alma
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Eski Önbellekleri Temizleme ve Yeni Kodları Aktif Etme
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Eski v3 havuzunu tamamen siler
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Ağ İsteklerini Yakalama (Çevrimdışı Çalışma Desteği)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
