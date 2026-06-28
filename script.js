// ==========================================================================
// GELİŞMİŞ PWA MOTORU & DOĞRUDAN UYGULAMA YÜKLEME TETİKLEYİCİSİ
// ==========================================================================
let deparPrompt;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((reg) => console.log('PWA Motoru Aktif:', reg.scope))
            .catch((err) => console.log('PWA Hatası:', err));
    });
}

// Tarayıcının yükleme pop-up'ını yakalayıp kendi butonumuza bağlıyoruz (Örn: Android Chrome)
window.addEventListener('beforeinstallprompt', (e) => {
    // Tarayıcının kendi otomatik çıkanı engelle
    e.preventDefault();
    // Etkinliği hafızada tut
    deparPrompt = e;
    
    // HTML'e eklediğimiz "Uygulamayı Yükle" butonunu görünür yap
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
        installBtn.style.display = 'block';
        
        // Butona tıklandığında yükleme ekranını zorla aç
        installBtn.addEventListener('click', () => {
            installBtn.style.display = 'none'; // Butonu gizle
            deparPrompt.prompt(); // Yükleme penceresini göster
            
            deparPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Kullanıcı uygulamayı yüklemeyi kabul etti.');
                } else {
                    installBtn.style.display = 'block'; // Reddedilirse butonu geri getir
                }
                deparPrompt = null;
            });
        });
    }
});

// Uygulama telefona başarıyla kurulduğunda butonu tamamen kaldır
window.addEventListener('appinstalled', () => {
    console.log('Uygulama telefona başarıyla yüklendi!');
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) installBtn.style.display = 'none';
});
