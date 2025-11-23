document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("eventTable");
  const searchInput = document.getElementById("searchInput");

  // === Modal Edit ===
  const editModal = document.createElement("div");
  editModal.id = "editModal";
  editModal.style.cssText = `
    display:none; position:fixed; inset:0;
    background:rgba(0,0,0,0.5); justify-content:center; align-items:center;
    z-index:1000;
  `;
  editModal.innerHTML = `
    <div style="background:#fff; padding:20px; border-radius:8px; width:100%; max-width:400px;">
      <h3>Edit Event</h3>
      <form id="formEdit">
        <input type="hidden" name="idEvent">

        <label>Judul:</label>
        <input type="text" name="title" required style="width:100%;"><br><br>

        <label>Tanggal Mulai:</label>
        <input type="date" name="dateStart" required style="width:100%;"><br><br>

        <label>Tanggal Selesai:</label>
        <input type="date" name="dateEnd" required style="width:100%;"><br><br>

        <label>Waktu Mulai:</label>
        <input type="time" name="timeStart" required style="width:100%;"><br><br>

        <label>Waktu Selesai:</label>
        <input type="time" name="timeEnd" required style="width:100%;"><br><br>

        <label>Lokasi:</label>
        <input type="text" name="location" required style="width:100%;"><br><br>

        <label>Deskripsi:</label>
        <textarea name="description" rows="3" required style="width:100%;"></textarea><br><br>

        <label>Status:</label>
        <select name="status" style="width:100%;">
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select><br><br>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button type="submit">Simpan</button>
          <button type="button" id="closeModal">Batal</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(editModal);

  const formEdit = editModal.querySelector("#formEdit");
  editModal.querySelector("#closeModal").addEventListener("click", () => {
    editModal.style.display = "none";
  });

  // === Update status otomatis ===
  function updateEventStatus() {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    const now = new Date();
    events.forEach(ev => {
      if (ev.approval === "Disetujui" && ev.status === "Aktif") {
        const endDateTime = new Date(ev.endDate + "T" + (ev.endTime || "23:59"));
        if (now > endDateTime) {
          ev.status = "Nonaktif";
        }
      }
    });
    localStorage.setItem("events", JSON.stringify(events));
  }

  // === Load events ke tabel ===
  function loadEvents() {
    updateEventStatus();
    let events = JSON.parse(localStorage.getItem("events")) || [];
    tableBody.innerHTML = "";

    if (events.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#777;">Belum ada event</td></tr>`;
      return;
    }

    events.sort((a, b) => {
      if (a.approval === "Menunggu" && b.approval !== "Menunggu") return -1;
      if (a.approval !== "Menunggu" && b.approval === "Menunggu") return 1;
      return 0;
    });

    events.forEach((event, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td data-label="No">${index + 1}</td>
        <td data-label="Poster"><img src="${event.poster || 'picture/default.jpg'}" style="width:60px; height:60px; object-fit:cover; border-radius:6px;"></td>
        <td data-label="Judul">${event.titleEvent || '-'}</td>
        <td data-label="Tanggal">${formatDate(event.startDate)} - ${formatDate(event.endDate)}</td>
        <td data-label="Waktu">${event.startTime || '-'} - ${event.endTime || '-'}</td>
        <td data-label="Lokasi">${event.location || '-'}</td>
        <td data-label="Status">${event.status || '-'}</td>
        <td data-label="Aksi">
          <button class="btn-edit" data-id="${event.id}">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-delete" data-id="${event.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
        <td data-label="Persetujuan">
          <span>${event.approval}</span>
          ${event.approval === "Menunggu" ? `
            <div style="margin-top:8px;">
              <button class="btn-approve" data-id="${event.id}">
                <i class="fa-solid fa-check"></i>
              </button>
              <button class="btn-reject" data-id="${event.id}">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          ` : ""}
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
  }

  // === Delegasi klik tabel ===
    tableBody.addEventListener("click", (e) => {
      const target = e.target.closest("button");
      if (!target) return;
      const id = target.dataset.id;
      let events = JSON.parse(localStorage.getItem("events")) || [];
      const ev = events.find(ev => String(ev.id) === String(id));
      if (!ev) return;

      if (target.classList.contains("btn-approve")) {
        ev.approval = "Disetujui";
        ev.status = "Aktif";
      }
      if (target.classList.contains("btn-reject")) {
        ev.approval = "Ditolak";
        ev.status = "Nonaktif";
      }
      if (target.classList.contains("btn-delete")) {
        // Tambahkan peringatan sebelum hapus
        if (confirm(`Yakin ingin menghapus event "${ev.titleEvent}"?`)) {
          events = events.filter(ev => String(ev.id) !== String(id));
        }
      }
      if (target.classList.contains("btn-edit")) {
        // buka modal edit
        formEdit.idEvent.value = ev.id;
        formEdit.title.value = ev.titleEvent;
        formEdit.dateStart.value = ev.startDate;
        formEdit.dateEnd.value = ev.endDate;
        formEdit.timeStart.value = ev.startTime;
        formEdit.timeEnd.value = ev.endTime;
        formEdit.location.value = ev.location;
        formEdit.description.value = ev.description;
        formEdit.status.value = ev.status || "Aktif";
        editModal.style.display = "flex";
      }

      localStorage.setItem("events", JSON.stringify(events));
      loadEvents();
    });


  // === Submit form edit ===
  formEdit.addEventListener("submit", (e) => {
    e.preventDefault();
    let events = JSON.parse(localStorage.getItem("events")) || [];
    const id = formEdit.idEvent.value;
    const index = events.findIndex(ev => String(ev.id) === String(id));
    if (index !== -1) {
      events[index] = {
        ...events[index],
        titleEvent: formEdit.title.value,
        startDate: formEdit.dateStart.value,
        endDate: formEdit.dateEnd.value,
        startTime: formEdit.timeStart.value,
        endTime: formEdit.timeEnd.value,
        location: formEdit.location.value,
        description: formEdit.description.value,
        status: formEdit.status.value
      };
      localStorage.setItem("events", JSON.stringify(events));
      editModal.style.display = "none";
      loadEvents();
    }
  });

    // === Tutup modal dengan tombol cancel/close ===
  document.getElementById("closeModal").addEventListener("click", () => {
    editModal.style.display = "none";
  });

  // === Search input ===
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const keyword = searchInput.value.toLowerCase();
      const rows = document.querySelectorAll("#eventTable tr");
      rows.forEach(row => {
        const title = row.querySelector("td:nth-child(3)")?.textContent.toLowerCase() || "";
        const location = row.querySelector("td:nth-child(6)")?.textContent.toLowerCase() || "";
        const match = title.includes(keyword) || location.includes(keyword);
        row.style.display = match ? "" : "none";
      });
    });
  }

  loadEvents();
});
