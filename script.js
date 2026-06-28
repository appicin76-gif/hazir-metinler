// İlk açılışta boş şablon butonlar hazırlar
let varsayilanButonlar = Array.from({length: 16}, (_, i) => ({
    id: Date.now() + i,
    ad: `Buton ${i+1}`,
    metin: `Kopyalanacak metin ${i+1}`,
    renk: '#ffffff'
}));

let butonlar = JSON.parse(localStorage.getItem('hizliButonlar')) || varsayilanButonlar;
let duzenlemeModu = false;
let mevcutBoyut = localStorage.getItem('butonBoyutu') || 'medium';

function karsitYaziRengiSec(hexcolor) {
    if (!hexcolor || hexcolor === '#ffffff') return '#007bff';
    const hex = hexcolor.replace('#', '');
    const r = parseInt(hex.substr(0,2),16);
    const g = parseInt(hex.substr(2,2),16);
    const b = parseInt(hex.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#333333' : '#ffffff';
}

function butonlariCiz() {
    const container = document.getElementById('gridContainer');
    container.innerHTML = '';
    container.className = `grid-container size-${mevcutBoyut}`;
    document.getElementById('editPanel').style.display = duzenlemeModu ? 'flex' : 'none';

    butonlar.forEach(btn => {
        const button = document.createElement('button');
        button.className = `copy-btn ${duzenlemeModu ? 'edit-mode' : ''}`;
        button.innerText = btn.ad;
        button.style.backgroundColor = btn.renk || '#ffffff';
        button.style.color = karsitYaziRengiSec(btn.renk);
        button.style.borderColor = (btn.renk && btn.renk !== '#ffffff') ? btn.renk : '#007bff';
        button.onclick = () => islemYap(btn.id, btn.metin);
        container.appendChild(button);
    });
}

function modDegistir() {
    duzenlemeModu = !duzenlemeModu;
    const btn = document.getElementById('editToggle');
    btn.innerText = duzenlemeModu ? '✅ Tamam' : '⚙️ Düzenle';
    btn.classList.toggle('active', duzenlemeModu);
    butonlariCiz();
}

function boyutDegistir() {
    if (mevcutBoyut === 'small') mevcutBoyut = 'medium';
    else if (mevcutBoyut === 'medium') mevcutBoyut = 'large';
    else mevcutBoyut = 'small';
    localStorage.setItem('butonBoyutu', mevcutBoyut);
    butonlariCiz();
}

function renkSeciciKutusu() {
    const renkler = [
        {ad: 'Beyaz', hex: '#ffffff'}, {ad: 'Kırmızı', hex: '#dc3545'},
        {ad: 'Yeşil', hex: '#28a745'}, {ad: 'Mavi', hex: '#007bff'},
        {ad: 'Sarı', hex: '#ffc107'}, {ad: 'Turuncu', hex: '#fd7e14'},
        {ad: 'Mor', hex: '#6f42c1'}, {ad: 'Siyah', hex: '#212529'}
    ];
    let mesaj = "Bir renk numarası seçin:\n";
    renkler.forEach((r, index) => { mesaj += `${index + 1} - ${r.ad}\n`; });
    const secim = prompt(mesaj, "1");
    if (secim === null) return '#ffffff';
    const secilenIndex = parseInt(secim) - 1;
    return renkler[secilenIndex] ? renkler[secilenIndex].hex : '#ffffff';
}

// YENİ: Otomatik TAB ekleyen sihirbaz fonksiyonu
function metinSihirbaziHazirla() {
    const tur = prompt("Ne tür bir buton oluşturmak istiyorsunuz?\n1 - Normal Tek Metin\n2 - Giriş Bilgisi (E-posta + Şifre)\n3 - Kredi Kartı (4 Kutulu formlar)", "1");
    
    if (tur === "2") {
        const eposta = prompt("E-posta adresinizi girin:");
        if (eposta === null) return null;
        const sifre = prompt("Şifrenizi girin:");
        if (sifre === null) return null;
        // İkisinin arasına \t (TAB) karakterini uygulama otomatik ekliyor
        return eposta + "\t" + sifre;
    } 
    else if (tur === "3") {
        const isim = prompt("Kart üzerindeki isim:");
        if (isim === null) return null;
        const kartNo = prompt("16 haneli kart numarası:");
        if (kartNo === null) return null;
        const skt = prompt("Son kullanma tarihi (Örn: 1228):");
        if (skt === null) return null;
        const cvc = prompt("CVC / Güvenlik kodu:");
        if (cvc === null) return null;
        // Tüm alanların arasına TAB karakterlerini uygulama otomatik diziyor
        return isim + "\t" + kartNo + "\t" + skt + "\t" + cvc;
    } 
    else {
        // Normal düz metin kopyalama
        return prompt("Butona basınca kopyalanacak metni girin:");
    }
}

function butonEkle() {
    const yeniAd = prompt("Yeni butonun kısa ismi ne olsun?", "Yeni Buton");
    if (!yeniAd) return;
    
    const birlesmisMetin = metinSihirbaziHazirla();
    if (birlesmisMetin === null) return; // İptal edildiyse çık
    
    const yeniRenk = renkSeciciKutusu();
    
    butonlar.push({
        id: Date.now(),
        ad: yeniAd,
        metin: birlesmisMetin,
        renk: yeniRenk
    });
    veriyiKaydet();
}

function islemYap(id, metin) {
    const index = butonlar.findIndex(b => b.id === id);
    if (index === -1) return;

    if (duzenlemeModu) {
        const secim = confirm(`"${butonlar[index].ad}" butonunu DÜZENLEMEK için 'Tamam'a, SİLMEK için 'İptal'e basın.`);
        if (secim) {
            const yeniAd = prompt("Butonun üzerindeki kısa isim:", butonlar[index].ad);
            if (yeniAd === null) return;
            
            const birlesmisMetin = metinSihirbaziHazirla();
            if (birlesmisMetin === null) return;
            
            const yeniRenk = renkSeciciKutusu();

            butonlar[index].ad = yeniAd || 'İsimsiz';
            butonlar[index].metin = birlesmisMetin;
            butonlar[index].renk = yeniRenk;
        } else {
            const silOnay = confirm(`"${butonlar[index].ad}" butonunu silmek istediğinize emin misiniz?`);
            if (silOnay) butonlar.splice(index, 1);
        }
        veriyiKaydet();
    } else {
        navigator.clipboard.writeText(metin).then(() => {
            const toast = document.getElementById("toast");
            toast.className = "show";
            setTimeout(() => { toast.className = ""; }, 1200);
        });
    }
}

function veriyiKaydet() {
    localStorage.setItem('hizliButonlar', JSON.stringify(butonlar));
    butonlariCiz();
}

butonlariCiz();
