const CONFIG = {
  SHEET_ID: "1Ch1QiJIZaX1Nr4zHdbuNYPlzeLPdHJabHTJ_ZFXs82w",
  API_KEY: "AIzaSyDlV3SCfV4DNIRApbut9341pUdxwrkjjzQ"
};

// ===================== FUNGSI AMBIL DATA =====================
async function loadSheetData(sheetName, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${sheetName}!${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.values || [];
}

// ===================== FUNGSI DASHBOARD UTAMA =====================
async function loadDashboard(type) {
  document.getElementById("chartContainer").style.display = "flex";
  document.getElementById("detailPage").style.display = "none";
  const container = document.getElementById("chartContainer");
  container.innerHTML = "";

  // ================== 1. DAFTAR TUNGGU ==================
  if (type === "daftarTunggu") {
    const data = await loadSheetData("DAFTAR TUNGGU", "A1:L3145");
    const header = data[0];
    const rows = data.slice(1);
    const kategoriIndex = header.indexOf("KATEGORI") !== -1 ? header.indexOf("KATEGORI") : 11;
    const countMap = {};

    rows.forEach(r => {
      const kategori = r[kategoriIndex] || "Tidak Diketahui";
      countMap[kategori] = (countMap[kategori] || 0) + 1;
    });

    Object.keys(countMap).forEach(kategori => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<h3>${kategori}</h3><p class="number">${countMap[kategori]}</p>`;
      card.onclick = () => showDaftarTungguDetail(kategori, rows, header);
      container.appendChild(card);
    });
  }

  // ================== 2. STOCK MATERIAL ==================
  if (type === "stockMaterial") {
    const data = await loadSheetData("STOCK MATERIAL", "A1:D72");
    const header = data[0];
    const rows = data.slice(1);

    rows.forEach(r => {
      const nama = r[0];
      const kode = r[1];
      const stok = r[2];
      const belum = r[3];

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${nama}</h3>
        <p>${kode}</p>
        <p class="number"><span class="green">${stok}</span> | <span class="red">${belum}</span></p>
      `;
      card.onclick = () => showStockDetail(nama, kode, stok, belum);
      container.appendChild(card);
    });
  }

  // ================== 3. MATERIAL KURANG ==================
  if (type === "materialKurang") {
    const data = await loadSheetData("MATERIAL KURANG", "A1:C74");
    const header = data[0];
    const rows = data.slice(1);

    rows.forEach(r => {
      const nama = r[0];
      const kode = r[1];
      const jumlah = parseFloat(r[2]) || 0;
      if (jumlah > 0) {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>${nama}</h3>
          <p>${kode}</p>
          <p class="number red">${jumlah}</p>
        `;
        card.onclick = () => showMaterialKurangDetail(nama, kode, jumlah);
        container.appendChild(card);
      }
    });
  }
}

// ===================== HALAMAN DETAIL (DAFTAR TUNGGU) =====================
function showDaftarTungguDetail(kategori, rows, header) {
  document.getElementById("chartContainer").style.display = "none";
  document.getElementById("detailPage").style.display = "block";
  document.getElementById("detailTitle").innerText = `Daftar Pelanggan (${kategori})`;

  const tbody = document.querySelector("#detailTable tbody");
  tbody.innerHTML = "";

  const indexes = {
    ulp: header.indexOf("ULP"),
    bulan: header.indexOf("BULAN KEBUTUHAN"),
    prioritas: header.indexOf("PRIORITAS"),
    tarif: header.indexOf("TARIF"),
    dayaLama: header.indexOf("DAYA LAMA"),
    dayaBaru: header.indexOf("DAYA BARU"),
    jumlah: header.indexOf("JUMLAH PELANGGAN"),
    kategori: header.indexOf("KATEGORI")
  };

  let no = 1;
  rows.forEach(r => {
    if (r[indexes.kategori] === kategori) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${no++}</td>
        <td>${r[indexes.ulp] || ""}</td>
        <td>${r[indexes.bulan] || ""}</td>
        <td>${r[indexes.prioritas] || ""}</td>
        <td>${r[indexes.tarif] || ""}</td>
        <td>${r[indexes.dayaLama] || ""}</td>
        <td>${r[indexes.dayaBaru] || ""}</td>
        <td>${r[indexes.jumlah] || ""}</td>
      `;
      tbody.appendChild(tr);
    }
  });
}

// ===================== HALAMAN DETAIL (STOCK MATERIAL) =====================
function showStockDetail(nama, kode, stok, belum) {
  document.getElementById("chartContainer").style.display = "none";
  document.getElementById("detailPage").style.display = "block";
  document.getElementById("detailTitle").innerText = `Detail Stock Material: ${nama}`;

  const tbody = document.querySelector("#detailTable tbody");
  tbody.innerHTML = `
    <tr><td colspan="8"><b>Kode:</b> ${kode}</td></tr>
    <tr><td colspan="8"><b>Stok:</b> <span class="green">${stok}</span></td></tr>
    <tr><td colspan="8"><b>Belum Datang:</b> <span class="red">${belum}</span></td></tr>
  `;
}

// ===================== HALAMAN DETAIL (MATERIAL KURANG) =====================
function showMaterialKurangDetail(nama, kode, jumlah) {
  document.getElementById("chartContainer").style.display = "none";
  document.getElementById("detailPage").style.display = "block";
  document.getElementById("detailTitle").innerText = `Detail Material Kurang: ${nama}`;

  const tbody = document.querySelector("#detailTable tbody");
  tbody.innerHTML = `
    <tr><td colspan="8"><b>Kode:</b> ${kode}</td></tr>
    <tr><td colspan="8"><b>Jumlah Kekurangan:</b> <span class="red">${jumlah}</span></td></tr>
  `;
}

// ===================== TOMBOL KEMBALI =====================
function goBack() {
  document.getElementById("chartContainer").style.display = "flex";
  document.getElementById("detailPage").style.display = "none";
}
