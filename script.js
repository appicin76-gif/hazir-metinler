// Hazır Metin Veritabanı ve Özel Giriş Özellikleri
const hazirMetinler = {
    btn1: { 
        isim: "Sabah Giriş", 
        metin: "Günaydın, dün kaldığımız yerden devam etmeye hazırım." 
    },
    btn2: { 
        isim: "Teşekkür", 
        metin: "Harika bir çalışma oldu, elinize sağlık." 
    },
    /* İKİ METİN ARASINDA TAB ÖZELLİĞİ (Örn: Kullanıcı Adı [TAB] Şifre) */
    btn3: { 
        isim: "Giriş Bilgileri (TAB)", 
        tip: "tab-ayrimli",
        metin1: "ornek_kullanici", 
        metin2: "Sifre1234!" 
    },
    /* KREDİ KARTI İÇİN 3 KELİME / VERİ ARASINDA TAB ÖZELLİĞİ */
    /* (Örn: Kart No [TAB] SKT [TAB] CVV) */
    btn4: { 
        isim: "Kredi Kartı (TAB)", 
        tip: "kart-ayrimli",
        veri1: "4355 8899 2233 1122", 
        veri2: "12/29", 
        veri3: "455" 
    },
    // Henüz özelleştirilmemiş (kullanıcı metin girmeden önceki) varsayılan butonlar:
    btn5: { isim: "", metin: "" },
    btn6: { isim: "", metin: "" },
    btn7: { isim: "", metin: "" },
    btn8: { isim: "", metin: "" },
    btn9: { isim: "", metin: "" },
    btn10: { isim: "", metin: "" },
    btn11: { isim: "", metin: "" },
    btn12: { isim: "", metin: "" },
    btn13: { isim: "", metin: "" },
    btn14: { isim: "", metin: "" },
    btn15: { isim: "", metin: "" },
    btn16: { isim: "", metin: "" }
};

document.addEventListener("DOMContentLoaded", () => {
    // Üst Panel Ayarları (Hafızadan yükleme)
    const bgColorPicker = document.getElementById("bgColorPicker");
    const bgImageUpper = document.getElementById("bgImageUpper");
    const resetBgBtn = document.getElementById("resetBg");

    const savedBgColor = localStorage.getItem("appBgColor");
    const savedBgImage = localStorage.getItem("appBgImage");
    if (savedBgImage) document.body.style.backgroundImage = `url(${savedBgImage})`;
    else if (savedBgColor) { document.body.style.backgroundColor = savedBgColor; bgColorPicker.value = savedBgColor; }

    // Butonları Yapılandırma Döngüsü
    Object.keys(hazirMetinler).forEach((id, index) => {
        const button = document.getElementById(id);
        if (!button) return;

        const veri = hazirMetinler[id];
        
        // 1. Kural: Eğer özel bir isim verilmişse onu yaz, yoksa varsayılan olarak "Metin [No]" yaz
        const butonNumarasi = index + 1;
        const gorunecekIsim = veri.isim ? veri.isim : `Metin ${butonNumarasi}`;
        button.innerText = gorunecekIsim;

        // 2. Kural: Tıklama ve Kopyalama Mantığı
        button.addEventListener("click", () => {
            let kopyalanacakIcerik = "";

            // Tip kontrolüne göre panoya gidecek veriyi hazırlıyoruz
            if (veri.tip === "tab-ayrimli") {
                // İki metin arasında TAB karakteri (\t) ekler
                kopyalanacakIcerik = `${veri.metin1}\t${veri.metin2}`;
            } else if (veri.tip === "kart-ayrimli") {
                // 3 kelime / veri arasında TAB karakteri (\t) ekler
                kopyalanacakIcerik = `${veri.veri1}\t${veri.veri2}\t${veri.veri3}`;
            } else {
                // Standart tek parça düz metin
                kopyalanacakIcerik = veri.metin;
            }

            // Eğer buton boşsa kopyalama yapma
            if (!kopyalanacakIcerik) {
                button.innerText = "⚠️ İçi Boş!";
                setTimeout(() => { button.innerText = gorunecekIsim; }, 1000);
                return;
            }

            // Panoya Kopyalama İşlemi
            navigator.clipboard.writeText(kopyalanacakIcerik).then(() => {
                button.innerText = "📋 Kopyalandı!";
                setTimeout(() => { button.innerText = gorunecekIsim; }, 1200);
            });
        });
    });

    // Arka Plan Kontrolleri
    bgColorPicker.addEventListener("input", (e) => {
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = e.target.value;
        localStorage.setItem("appBgColor", e.target.value);
        localStorage.removeItem("appBgImage");
    });

    bgImageUpper.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                document.body.style.backgroundImage = `url(${event.target.result})`;
                localStorage.setItem("appBgImage", event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    resetBgBtn.addEventListener("click", () => {
        localStorage.clear();
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = "#eef5fc";
        bgColorPicker.value = "#eef5fc";
    });
});
