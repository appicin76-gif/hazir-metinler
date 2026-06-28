document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById("mainGridContainer");
    const editModeBtn = document.getElementById("editModeBtn");
    const addNewBtn = document.getElementById("addNewBtn"); // Yeni eklenen buton
    const editModal = document.getElementById("editModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const selectType = document.getElementById("selectType");
    const dynamicInputs = document.getElementById("dynamicInputs");
    const saveBtn = document.getElementById("saveBtn");
    const deleteBtn = document.getElementById("deleteBtn");

    let isEditMode = false;
    let activeBtnId = null;

    // Yerel Hafızadan Buton Verilerini Yükle
    let hafizaMetinleri = JSON.parse(localStorage.getItem("hazirMetinVerileri"));
    
    // Eğer hafıza tamamen boşsa ilk açılış için 4 tane örnek boş buton kuralı koyalım
    if (!hafizaMetinleri) {
        hafizaMetinleri = {
            "btn_1": { isim: "", tip: "standart", renk: "btn-cyan", metin: "" },
            "btn_2": { isim: "", tip: "standart", renk: "btn-purple", metin: "" },
            "btn_3": { isim: "", tip: "standart", renk: "btn-green", metin: "" },
            "btn_4": { isim: "", tip: "standart", renk: "btn-red", metin: "" }
        };
        localStorage.setItem("hazirMetinVerileri", JSON.stringify(hafizaMetinleri));
    }
    
    // Hafızadaki tüm butonları ekrana basan fonksiyon
    function butonlariArayuzeBas() {
        gridContainer.innerHTML = ""; // Önce içini temizle
        Object.keys(hafizaMetinleri).forEach((btnId) => {
            const btnData = hafizaMetinleri[btnId];
            const button = document.createElement("button");
            button.id = btnId;
            button.className = `gel-button ${btnData.renk}`;
            
            // İsim yoksa buton id numarasını yaz
            const num = btnId.split("_")[1];
            button.innerText = btnData.isim ? btnData.isim : `Metin ${num}`;

            if (isEditMode) button.classList.add("edit-shake");

            button.addEventListener("click", () => {
                if (isEditMode) {
                    openEditModal(btnId);
                } else {
                    executeCopy(btnId);
                }
            });

            gridContainer.appendChild(button);
        });
    }

    // ➕ YENİ BUTON EKLEME MANTIĞI
    addNewBtn.addEventListener("click", () => {
        // Benzersiz yeni bir ID üret (Mevcut en yüksek sayıyı bulup 1 ekler)
        const mevcutIdler = Object.keys(hafizaMetinleri).map(id => parseInt(id.split("_")[1]) || 0);
        const enYuksekId = mevcutIdler.length > 0 ? Math.max(...mevcutIdler) : 0;
        const yeniId = `btn_${enYuksekId + 1}`;

        // Hafızaya boş şablon ekle
        hafizaMetinleri[yeniId] = { isim: "", tip: "standart", renk: "btn-cyan", metin: "" };
        localStorage.setItem("hazirMetinVerileri", JSON.stringify(hafizaMetinleri));
        
        // Arayüzü tazele ve otomatik olarak o butonun düzenleme panelini aç
        butonlariArayuzeBas();
        if (!isEditMode) {
            editModeBtn.click(); // Kullanıcı rahat etsin diye düzenleme moduna geçir
        }
        openEditModal(yeniId);
    });

    // Düzenle Modu Aç/Kapat
    editModeBtn.addEventListener("click", () => {
        isEditMode = !isEditMode;
        editModeBtn.classList.toggle("active", isEditMode);
        editModeBtn.innerText = isEditMode ? "⏸️ Çıkış" : "⚙️ Düzenle";
        
        Object.keys(hafizaMetinleri).forEach((btnId) => {
            const btn = document.getElementById(btnId);
            if (btn) btn.classList.toggle("edit-shake", isEditMode);
        });
    });

    selectType.addEventListener("change", () => {
        updateDynamicInputs(selectType.value);
    });

    function updateDynamicInputs(type, currentData = null) {
        dynamicInputs.innerHTML = "";
        if (type === "tab-ayrimli") {
            dynamicInputs.innerHTML = `
                <label>1. Metin (Örn: Kullanıcı Adı):</label>
                <input type="text" id="val1" value="${currentData?.metin1 || ''}">
                <label>2. Metin (Örn: Şifre):</label>
                <input type="text" id="val2" value="${currentData?.metin2 || ''}">
            `;
        } else if (type === "kart-ayrimli") {
            dynamicInputs.innerHTML = `
                <label>1. Kelime (Örn: Kart No):</label>
                <input type="text" id="val1" value="${currentData?.veri1 || ''}">
                <label>2. Kelime (Örn: SKT):</label>
                <input type="text" id="val2" value="${currentData?.veri2 || ''}">
                <label>3. Kelime (Örn: CVV):</label>
                <input type="text" id="val3" value="${currentData?.veri3 || ''}">
            `;
        } else {
            dynamicInputs.innerHTML = `
                <label>Kopyalanacak Standart Metin:</label>
                <input type="text" id="val1" value="${currentData?.metin || ''}">
            `;
        }
    }

    function openEditModal(btnId) {
        activeBtnId = btnId;
        const currentData = hafizaMetinleri[btnId];
        const num = btnId.split("_")[1];
        document.getElementById("modalTitle").innerText = `Buton ${num} Ayarları`;
        document.getElementById("inputIsim").value = currentData.isim || "";
        selectType.value = currentData.tip || "standart";
        
        updateDynamicInputs(currentData.tip, currentData);

        const radios = document.getElementsByName("btnColor");
        radios.forEach(r => { if(r.value === currentData.renk) r.checked = true; });

        editModal.style.display = "block";
    }

    saveBtn.addEventListener("click", () => {
        if (!activeBtnId) return;
        const type = selectType.value;
        const chosenColor = document.querySelector('input[name="btnColor"]:checked').value;
        const customName = document.getElementById("inputIsim").value;

        let dataPatch = { isim: customName, tip: type, renk: chosenColor };

        if (type === "tab-ayrimli") {
            dataPatch.metin1 = document.getElementById("val1").value;
            dataPatch.metin2 = document.getElementById("val2").value;
        } else if (type === "kart-ayrimli") {
            dataPatch.veri1 = document.getElementById("val1").value;
            dataPatch.veri2 = document.getElementById("val2").value;
            dataPatch.veri3 = document.getElementById("val3").value;
        } else {
            dataPatch.metin = document.getElementById("val1").value;
        }

        hafizaMetinleri[activeBtnId] = dataPatch;
        localStorage.setItem("hazirMetinVerileri", JSON.stringify(hafizaMetinleri));

        const btnEl = document.getElementById(activeBtnId);
        btnEl.className = `gel-button ${chosenColor} ${isEditMode ? 'edit-shake' : ''}`;
        btnEl.innerText = customName ? customName : `Metin ${activeBtnId.split("_")[1]}`;

        editModal.style.display = "none";
    });

    // 🗑️ BUTONU TAMAMEN SİLME MANTIĞI
    deleteBtn.addEventListener("click", () => {
        if (!activeBtnId) return;
        
        // Butonu hafızadan tamamen siler (Sadece içini boşaltmaz, listeyi daraltır)
        delete hafizaMetinleri[activeBtnId];
        localStorage.setItem("hazirMetinVerileri", JSON.stringify(hafizaMetinleri));

        // Değişikliği ekrana yansıt
        butonlariArayuzeBas();
        editModal.style.display = "none";
    });

    function executeCopy(btnId) {
        const data = hafizaMetinleri[btnId];
        const button = document.getElementById(btnId);
        let content = "";

        if (data.tip === "tab-ayrimli") {
            if(data.metin1 || data.metin2) content = `${data.metin1}\t${data.metin2}`;
        } else if (data.tip === "kart-ayrimli") {
            if(data.veri1 || data.veri2 || data.veri3) content = `${data.veri1}\t${data.veri2}\t${data.veri3}`;
        } else {
            content = data.metin || "";
        }

        if (!content) {
            const oldTxt = button.innerText;
            button.innerText = "⚠️ İçi Boş!";
            setTimeout(() => button.innerText = oldTxt, 1000);
            return;
        }

        navigator.clipboard.writeText(content).then(() => {
            const oldTxt = button.innerText;
            button.innerText = "📋 Kopyalandı!";
            setTimeout(() => button.innerText = oldTxt, 1200);
        });
    }

    closeModalBtn.addEventListener("click", () => editModal.style.display = "none");
    window.addEventListener("click", (e) => { if(e.target === editModal) editModal.style.display = "none"; });

    // Arka Plan Kontrolleri
    const bgColorPicker = document.getElementById("bgColorPicker");
    const bgImageUpper = document.getElementById("bgImageUpper");
    const resetBgBtn = document.getElementById("resetBg");

    const savedBgColor = localStorage.getItem("appBgColor");
    const savedBgImage = localStorage.getItem("appBgImage");
    if (savedBgImage) document.body.style.backgroundImage = `url(${savedBgImage})`;
    else if (savedBgColor) { document.body.style.backgroundColor = savedBgColor; bgColorPicker.value = savedBgColor; }

    bgColorPicker.addEventListener("input", (e) => {
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = e.target.value;
        localStorage.setItem("appBgColor", e.target.value);
        localStorage.removeItem("appBgImage");
    });

    bgImageUpper.addEventListener("change", (e) => {
        const file = e.target.files;
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
