async function fetchSheetData(sheetName, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${sheetName}!${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.values;
}

async function loadDashboard(type) {
  const container = document.getElementById("chartContainer");
  container.innerHTML = ""; // hapus tampilan sebelumnya

  if (type === "daftarTunggu") {
    container.className = "card-container daftar-tunggu";
    const data = await fetchSheetData("DAFTAR TUNGGU", "A1:L3145");

    const kategoriCount = {};
    data.slice(1).forEach(row => {
      const kategori = row[11];
      if (kategori) {
        kategoriCount[kategori] = (kategoriCount[kategori] || 0) + 1;
      }
    });

    Object.entries(kategoriCount).forEach(([kategori, jumlah]) => {
      createCard(
        kategori,
        `${jumlah} proyek`,
        "#17a2b8",
        "daftar-tunggu"
      );
    });

  } else if (type === "stockMaterial") {
    container.className = "card-container stock-material";
    const data = await fetchSheetData("STOCK MATERIAL", "A1:D72");

    data.slice(1).forEach(row => {
      const nama = row[0] || "-";
      const kode = row[1] || "-";
      const stock = parseInt(row[2] || 0);
      const belumDatang = parseInt(row[3] || 0);

      const card = document.createElement("div");
      card.className = "card stock-material";
      card.innerHTML = `
        <div class="card-title" title="${nama}">${nama}</div>
        <div class="card-subtitle">Kode: ${kode}</div>
        <div class="card-value green">${stock}</div>
        <div class="card-value red">${belumDatang}</div>
      `;
      container.appendChild(card);
    });

  } else if (type === "materialKurang") {
    container.className = "card-container material-kurang";
    const data = await fetchSheetData("MATERIAL KURANG", "A1:C74");

    data.slice(1).forEach(row => {
      const nama = row[0];
      const kode = row[1];
      const jumlah = parseInt(row[2] || 0);
      if (jumlah > 0) {
        const card = document.createElement("div");
        card.className = "card material-kurang";
        card.innerHTML = `
          <div class="card-title">${nama}</div>
          <div class="card-subtitle">Kode: ${kode}</div>
          <div class="card-value yellow">${jumlah}</div>
        `;
        container.appendChild(card);
      }
    });
  }
}

function createCard(title, subtitle, color, extraClass = "") {
  const container = document.getElementById("chartContainer");
  const card = document.createElement("div");
  card.className = `card ${extraClass}`;
  card.style.borderLeft = `8px solid ${color}`;
  card.innerHTML = `
    <div class="card-title">${title}</div>
    <div class="card-value" style="font-size:36px;color:${color};margin-top:20px;">${subtitle}</div>
  `;
  container.appendChild(card);
}
