const CACHE_NAME = 'hizli-pano-cache-v2';

// Dosya yollarını GitHub Pages'in alt klasör yapısına göre esnetiyoruz
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                './',
                'index.html',
                'style.css',
                'script.js',
                'manifest.json'
            ]).catch(err => console.log("Önbelleğe alma hatası yok sayıldı:", err));
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// Chrome'un "Offline çalışabiliyor" onayını vermesini sağlayan zorunlu kod
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => {
                return caches.match('index.html');
            });
        })
    );
});
