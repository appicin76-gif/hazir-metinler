document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById("mainGridContainer");
    const editModeBtn = document.getElementById("editModeBtn");
    const addBtn = document.getElementById("addBtn");
    const editModal = document.getElementById("editModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const selectType = document.getElementById("selectType");
    const dynamicInputs = document.getElementById("dynamicInputs");
    const saveBtn = document.getElementById("saveBtn");
    const deleteBtn = document.getElementById("deleteBtn");

    let isEditMode = false;
    let activeBtnId = null;

    // 1. Yerel Hafızadan Verileri Çek
    let hafizaMetinleri = {};
    try {
        hafizaMetinleri = JSON.parse(localStorage.getItem("hazirMetinVerileri")) || {};
    } catch (e) {
        hafizaMetinleri = {};
    }
    
    // Hafıza boşsa veya bozuksa temiz 16 adet şablon buton aç
    if (Object.keys(hafizaMetinleri).length === 0) {
        for (let i = 1; i <= 16; i++) {
            hafizaMetinleri[`btn_${i}`] = { isim: "", tip: "standart", renk: "btn-cyan", metin: "" };
        }
        localStorage.setItem("hazirMetinVerileri", JSON.stringify(hafizaMetinleri));
    }

    // 2. Butonları Ekrana Çizen Kusursuz Fonksiyon
    function renderButtons() {
        if (!gridContainer) return;
        gridContainer.innerHTML = ""; // İçeriği tamamen temizle
        
        Object.keys(hafizaMetinleri).forEach((btnId) => {
            const btnData = hafizaMetinleri[btnId];
            const button = document.createElement("button");
            
            // ID'den sadece sayısal numarayı çek (Örn: btn_5 -> 5)
            const btnSiraNo = btnId.split("_")[1] || "1";
            
            button.id = btnId;
            button.className = `gel-button ${btnData.renk || 'btn-cyan'}`;
            
            if (isEditMode) {
                button.classList.add("edit-shake");
            }
            
            // Etiket ismi varsa onu yaz, yoksa varsayılan "Metin [No]" yaz
            button.innerText = btnData.isim ? btnData.isim : `Metin ${btnSiraNo}`;

            // Tıklama Olayı
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

    // Butonları ilk açılışta yükle
    renderButtons();

    // 3. ➕ Yeni Buton Ekleme İşlevi
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            // Mevcut buton sayısının bir fazlasını yeni ID yap
            const yeniIndex = Object.keys(hafizaMetinleri).length + 1;
            const yeniId = `btn_${yeniIndex}`;
            
            hafizaMetinleri[yeniId] = { isim: "", tip: "standart", renk: "btn-cyan", metin: "" };
            localStorage.setItem("hazirMetinVerileri", JSON.stringify(hafizaMetinleri));
            
            renderButtons(); // Ekrana yeni butonu bas
            openEditModal(yeniId); // Ayarlarını yapması için penceresini aç
        });
    }

    // 4. ⚙️ Düzenle Modunu Aç/Kapat
    if (editModeBtn) {
        editModeBtn.addEventListener("click", () => {
            isEditMode = !isEditMode;
            editModeBtn.classList.toggle("active", isEditMode);
            editModeBtn.innerText = isEditMode ? "⏸️ Çıkış" : "⚙️ Düzenle";
            renderButtons(); // Titreme efekti için yeniden çiz
        });
    }

    // 5. Seçilen Tip Değiştiğinde Form Alanlarını Güncelle
    if (selectType) {
        selectType.addEventListener("change", () => {
            updateDynamicInputs(selectType.value);
        });
    }

    function updateDynamicInputs(type, currentData = null) {
        if (!dynamicInputs) return;
        dynamicInputs.innerHTML = "";
        
        if (type === "tab-ayrimli") {
            dynamicInputs.innerHTML = `
                <label>1. Metin (Kullanıcı Adı):</label>
                <input type="text" id="val1" value="${currentData?.metin1 || ''}">
                <label>2. Metin (Şifre):</label>
                <input type="text" id="val2" value="${currentData?.metin2 || ''}">
            `;
        } else if (type === "kart-ayrimli") {
            dynamicInputs.innerHTML = `
                <label>1. Kelime (Kart No):</label>
                <input type="text" id="val1" value="${currentData?.veri1 || ''}">
                <label>2. Kelime (SKT):</label>
                <input type="text" id="val2" value="${currentData?.veri2 || ''}">
                <label>3. Kelime (CVV):</label>
                <input type="text" id="val3" value="${currentData?.veri3 || ''}">
            `;
        } else {
            dynamicInputs.innerHTML = `
                <label>Kopyalanacak Standart Metin:</label>
                <input type="text" id="val1" value="${currentData?.metin || ''}">
            `;
        }
    }

    // 6. Ayar Penceresini (Modal) Doldur ve Aç
    function openEditModal(btnId) {
        if (!editModal) return;
        activeBtnId = btnId;
        const currentData = hafizaMetinleri[btnId] || { isim: "", tip: "standart", renk: "btn-cyan" };
        
        document.getElementById("modalTitle").innerText = "Buton Ayarları";
        document.getElementById("inputIsim").value = currentData.isim || "";
        selectType.value = currentData.type || "standart";
        
        updateDynamicInputs(currentData.tip, currentData);

        const radios = document.getElementsByName("btnColor");
        radios.forEach(r => { if(r.value === currentData.renk) r.checked = true; });

        editModal.style.display = "block";
    }

    // 7. Ayarları Veritabanına Kaydet
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (!activeBtnId) return;
            const type = selectType.value;
            const checkedRadio = document.querySelector('input[name="btnColor"]:checked');
            const chosenColor = checkedRadio ? checkedRadio.value : "btn-cyan";
            const customName = document.getElementById("inputIsim").value;

            let dataPatch = { isim: customName, tip: type, renk: chosenColor };

            if (type === "tab-ayrimli") {
                dataPatch.metin1 = document.getElementById("val1") ? document.getElementById("val1").value : "";
                dataPatch.metin2 = document.getElementById("val2") ? document.getElementById("val2").value : "";
            } else if (type === "kart-ayrimli") {
                dataPatch.veri1 = document.getElementById("val1") ? document.getElementById("val1").value : "";
                dataPatch.veri2 = document.getElementById("val2") ? document.getElementById("val2").value : "";
                dataPatch.veri3 = document.getElementById("val3") ? document.getElementById("val3").value : "";
            } else {
                dataPatch.metin = document.getElementById("val1") ? document.getElementById("val1").value : "";
            }

            hafizaMetinleri[activeBtnId] = dataPatch;
            localStorage.setItem("hazirMetinVerileri", JSON.stringify(hafizaMetinleri));
            
            editModal.style.display = "none";
            renderButtons();
        });
    }

    // 8. 🗑️ Butonu Tamamen Silme Fonksiyonu
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            if (!activeBtnId) return;
            
            // Elemanı hafızadan kaldır
            delete hafizaMetinleri[activeBtnId];
            
            // Kalan tüm butonların ID sırasını baştan kur (Sıralama hatasını önler)
            let yeniHafiza = {};
            Object.values(hafizaMetinleri).forEach((veri, idx) => {
                yeniHafiza[`btn_${idx + 1}`] = veri;
            });
            hafizaMetinleri = yeniHafiza;
            
            localStorage.setItem("hazirMetinVerileri", JSON.stringify(hafizaMetinleri));
            editModal.style.display = "none";
            renderButtons(); // Yeniden çiz
        });
    }

    // 9. Panoya Akıllı Kopyalama Motoru
    function executeCopy(btnId) {
        const data = hafizaMetinleri[btnId];
        const button = document.getElementById(btnId);
        let content = "";

        if (!data || !button) return;

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

    if (closeModalBtn) closeModalBtn.addEventListener("click", () => editModal.style.display = "none");
    window.addEventListener("click", (e) => { if(editModal && e.target === editModal) editModal.style.display = "none"; });

    // Arka Plan Kontrolleri
    const bgColorPicker = document.getElementById("bgColorPicker");
    const bgImageUpper = document.getElementById("bgImageUpper");
    const resetBgBtn = document.getElementById("resetBg");

    const savedBgColor = localStorage.getItem("appBgColor");
    const savedBgImage = localStorage.getItem("appBgImage");
    if (savedBgImage) document.body.style.backgroundImage = `url(${savedBgImage})`;
