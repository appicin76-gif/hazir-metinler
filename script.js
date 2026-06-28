document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById("mainGridContainer");
    const editModeBtn = document.getElementById("editModeBtn");
    const addNewBtn = document.getElementById("addNewBtn"); // Yeni eklenen buton elementi
    const editModal = document.getElementById("editModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const selectType = document.getElementById("selectType");
    const dynamicInputs = document.getElementById("dynamicInputs");
    const saveBtn = document.getElementById("saveBtn");
    const deleteBtn = document.getElementById("deleteBtn");

    let isEditMode = false;
    let activeBtnId = null;

    // Yerel Hafızadan Buton Verilerini Yükle
    let hafizaMetinleri = JSON.parse(localStorage.getItem("hazirMetinVerileri")) || {};
    
    // Eğer hafıza tamamen boşsa ilk açılışta 16 adet varsayılan buton tanımla
    if (Object.keys(hafizaMetinleri).length === 0) {
        for (let i = 1; i <= 16; i++) {
            hafizaMetinleri[`btn_${i}`] = { isim: "", tip: "standart", renk: "btn-cyan", metin: "" };
        }
        localStorage.setItem("hazirMetinVerileri", JSON.stringify(hafizaMetinleri));
    }

    // Buton Oluşturma Fonksiyonu (Arayüze basar ve tıklama olaylarını bağlar)
    function createButtonElement(btnId, indexNumber) {
        const btnData = hafizaMetinleri[btnId];
        const button = document.createElement("button");
        button.id = btnId;
        button.className = `gel-button ${btnData.renk}`;
        button.innerText = btnData.isim ? btnData.isim : `Metin ${indexNumber}`;
        
        if (isEditMode) button.classList.add("edit-shake");

        button.addEventListener("click", () => {
            if (isEditMode) {
                openEditModal(btnId);
            } else {
                executeCopy(btnId);
            }
        });

        if (gridContainer) gridContainer.appendChild(button);
    }

    // Hafızadaki tüm butonları ekrana sırasıyla basıyoruz
    function renderAllButtons() {
        if (gridContainer) gridContainer.innerHTML = "";
        // Butonları sayısal sıralarına göre dizmek için ID'leri ayıklıyoruz
        Object.keys(hafizaMetinleri).forEach((btnId) => {
            const num = btnId.split("_")[1];
            createButtonElement(btnId, num);
        });
    }
    renderAllButtons();

    // ==========================================================================
    // ➕ YENİ BUTON EKLEME ÖZELLİĞİ (AKTİF EDİLEN ALAN)
    // ==========================================================================
    if (addNewBtn) {
        addNewBtn.addEventListener("click", () => {
            // Mevcut buton sayısını bulup bir fazlasını alıyoruz (Örn: 16 ise 17 oluyor)
            const mevcutButonSayisi = Object.keys(hafizaMetinleri).length;
            const yeniButonNo = mevcutButonSayisi + 1;
            const yeniBtnId = `btn_${yeniButonNo}`;

            // Hafızaya yeni boş buton şablonu ekle
            hafizaMetinleri[yeniBtnId] = { isim: "", tip: "standart", renk: "btn-cyan", metin: "" };
            localStorage.setItem("hazirMetinVerileri", JSON.stringify(hafizaMetinleri));

            // Yeni butonu anında ekrana ekle
            createButtonElement(yeniBtnId, yeniButonNo);
            
            // Eğer o an düzenleme modundaysak yeni buton da titresin
            if (isEditMode) {
                const yeniBtnEl = document.getElementById(yeniBtnId);
                if (yeniBtnEl) yeniBtnEl.classList.add("edit-shake");
            }
        });
    }

    // Düzenle Modu Aç/Kapat
    if (editModeBtn) {
        editModeBtn.addEventListener("click", () => {
            isEditMode = !isEditMode;
            editModeBtn.classList.toggle("active", isEditMode);
            editModeBtn.innerText = isEditMode ? "⏸️ Çıkış" : "⚙️ Düzenle";
            
            Object.keys(hafizaMetinleri).forEach((btnId) => {
                const btn = document.getElementById(btnId);
                if (btn) btn.classList.toggle("edit-shake", isEditMode);
            });
        });
    }

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
        if (!editModal) return;
        activeBtnId = btnId;
        const currentData = hafizaMetinleri[btnId];
        const num = btnId.split("_")[1];
        document.getElementById("modalTitle").innerText = `Buton ${num} Ayarları`;
        document.getElementById("inputIsim").value = currentData.isim || "";
        selectType.value = currentData.type || "standart";
        
        updateDynamicInputs(currentData.tip, currentData);

        const radios = document.getElementsByName("btnColor");
        radios.forEach(r => { if(r.value === currentData.renk) r.checked = true; });

        editModal.style.display = "block";
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (!activeBtnId) return;
            const type = selectType.value;
            const chosenColor = document.querySelector('input[name="btnColor"]:checked').value;
            const customName = document.getElementById("inputIsim").value;
            const num = activeBtnId.split("_")[1];

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
            if (btnEl) {
                btnEl.className = `gel-button ${chosenColor}`;
                if (isEditMode) btnEl.classList.add("edit-shake");
                btnEl.innerText = customName ? customName : `Metin ${num}`;
            }

            editModal.style.display = "none";
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            if (!activeBtnId) return;
            const num = activeBtnId.split("_")[1];
            hafizaMetinleri[activeBtnId] = { isim: "", tip: "standart", renk: "btn-cyan", metin: "" };
            localStorage.setItem("hazirMetinVerileri", JSON.stringify(hafizaMetinleri));

            const btnEl = document.getElementById(activeBtnId);
            if (btnEl) {
                btnEl.className = `gel-button btn-cyan`;
                if (isEditMode) btnEl.classList.add("edit-shake");
                btnEl.innerText = `Metin ${num}`;
            }

            editModal.style.display = "none";
        });
    }

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

    if (closeModalBtn) closeModalBtn.addEventListener("click", () => editModal.style.display = "none");
    window.addEventListener("click", (e) => { if(editModal && e.target === editModal) editModal.style.display = "none"; });

    // Arka Plan Kontrolleri
    const bgColorPicker = document.getElementById("bgColorPicker");
    const bgImageUpper = document.getElementById("bgImageUpper");
    const resetBgBtn = document.getElementById("resetBg");

    const savedBgColor = localStorage.getItem("appBgColor");
    const savedBgImage = localStorage.getItem("appBgImage");
