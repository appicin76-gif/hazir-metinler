// Örnek Hazır Metin Verileri (İçeriği dilediğiniz gibi çoğaltın)
const hazirMetinler = [
    { id: 1, metin: "Günaydın, dün kaldığımız yerden devam etmeye hazırım.", renkSınıfı: "btn-cyan" },
    { id: 2, metin: "Harika bir çalışma oldu, elinize sağlık.", renkSınıfı: "btn-purple" },
    { id: 3, metin: "İlgili dosyaları ve güncel dökümanları ekte iletiyorum.", renkSınıfı: "btn-green" },
    { id: 4, metin: "Konuyla ilgili dönüşünüzü bekliyorum, iyi çalışmalar.", renkSınıfı: "btn-red" },
    { id: 5, metin: "Toplantı linkini aşağıda bulabilirsiniz.", renkSınıfı: "btn-orange" },
    { id: 6, metin: "Süreci yakından takip edip güncelliyor olacağım.", renkSınıfı: "btn-blue" },
    { id: 7, metin: "Bu revizyonu en kısa sürede tamamlayıp iletiyorum.", renkSınıfı: "btn-black" }
];

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("textButtonsContainer");
    const bgColorPicker = document.getElementById("bgColorPicker");
    const bgImageUpper = document.getElementById("bgImageUpper");
    const resetBgBtn = document.getElementById("resetBg");

    // 1. Kayıtlı Arka Planı Yükle
    const savedBgColor = localStorage.getItem("appBgColor");
    const savedBgImage = localStorage.getItem("appBgImage");

    if (savedBgImage) {
        document.body.style.backgroundImage = `url(${savedBgImage})`;
    } else if (savedBgColor) {
        document.body.style.backgroundColor = savedBgColor;
        bgColorPicker.value = savedBgColor;
    }

    // 2. Metin Butonlarını Arayüze Ekle
    hazirMetinler.forEach(item => {
        const btn = document.createElement("button");
        btn.className = `gel-button ${item.renkSınıfı}`;
        btn.innerText = item.metin; // Buton yazısı yerine metnin kendisi yazılıyor

        // Butona tıklandığında metni panoya kopyalama işlevi
        btn.addEventListener("click", () => {
            navigator.clipboard.writeText(item.metin).then(() => {
                // Basit bir kopyalandı görsel efekti
                const orijinalYazi = btn.innerText;
                btn.innerText = "📋 Kopyalandı!";
                setTimeout(() => { btn.innerText = orijinalYazi; }, 1200);
            });
        });

        container.appendChild(btn);
    });

    // 3. Arka Plan Renk Ataması Değişimi
    bgColorPicker.addEventListener("input", (e) => {
        const color = e.target.value;
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = color;
        localStorage.setItem("appBgColor", color);
        localStorage.removeItem("appBgImage");
    });

    // 4. Arka Plan Resim Yükleme İşlemi (Base64 formatında hafızaya kaydeder)
    bgImageUpper.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Image = event.target.result;
                document.body.style.backgroundImage = `url(${base64Image})`;
                localStorage.setItem("appBgImage", base64Image);
            };
            reader.readAsDataURL(file);
        }
    });

    // 5. Ayarları Sıfırlama Butonu
    resetBgBtn.addEventListener("click", () => {
        localStorage.removeItem("appBgColor");
        localStorage.removeItem("appBgImage");
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = "#f0f2f5";
        bgColorPicker.value = "#f0f2f5";
        bgImageUpper.value = "";
    });
});
