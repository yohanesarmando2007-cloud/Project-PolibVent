document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("eventTable");

  // 🔹 Modal edit
  let editModal;
  let formEdit;

  // 🔹 Buat modal edit secara dinamis saat halaman dimuat
  function createEditModal() {
    const modal = document.createElement("div");
    modal.id = "editModal";
    modal.style.cssText = `
      display:none;
      position:fixed;
      inset:0;
      background:rgba(0,0,0,0.5);
      justify-content:center;
      align-items:center;
      z-index:1000;
    `;

    modal.innerHTML = `
      <div style="background:#fff; padding:20px; border-radius:8px; width:400px;">
        <h3>Edit Event</h3>
        <form id="formEdit">
          <input type="hidden" name="idEvent">

          <label>Judul:</label>
          <input type="text" name="title" required><br><br>

          <label>URL Poster:</label>
          <input type="text" name="poster"><br><br>

          <label>Tanggal Mulai:</label>
          <input type="date" name="dateStart" required><br><br>

          <label>Tanggal Selesai:</label>
          <input type="date" name="dateEnd" required><br><br>

          <label>Waktu Mulai:</label>
          <input type="time" name="timeStart" required><br><br>

          <label>Waktu Selesai:</label>
          <input type="time" name="timeEnd" required><br><br>

          <label>Lokasi:</label>
          <input type="text" name="location" required><br><br>

          <label>Deskripsi:</label>
          <textarea name="description" rows="4" required></textarea><br><br>
          
          <label>Status:</label>
          <input type="text" name="status"><br><br>

          <button type="submit" style="margin-right:8px;">Simpan</button>
          <button type="button" id="closeModal">Batal</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    editModal = modal;
    formEdit = modal.querySelector("#formEdit");

    // Tutup modal
    modal.querySelector("#closeModal").addEventListener("click", () => {
      modal.style.display = "none";
    });

    // Simpan perubahan
    formEdit.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = formEdit.idEvent.value;
      let events = JSON.parse(localStorage.getItem("events")) || [];
      const index = events.findIndex(ev => ev.id == id);

      if (index !== -1) {
        events[index] = {
          ...events[index],
          id: formEdit.idEvent.value,
          titleEvent: formEdit.title.value,
          poster: formEdit.poster.value,
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
  }

  // 🔹 Fungsi memuat event
  function loadEvents() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    tableBody.innerHTML = "";

    if (events.length === 0) {
      tableBody.innerHTML = `
        <tr><td colspan="8" style="text-align:center; color:#777;">Belum ada event</td></tr>
      `;
      return;
    }

    events.forEach((event, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${event.poster || 'no-image.png'}" alt="poster" style="width:80px; border-radius:6px;"></td>
        <td>${event.titleEvent || '-'}</td>
        <td>${formatDate(event.startDate)} - ${formatDate(event.endDate)}</td>
        <td>${event.startTime || '-'} - ${event.endTime || '-'}</td>
        <td>${event.location || '-'}</td>
        <td>${event.status || '-'}</td>
        <td>
          <button class="btn-edit" data-id="${event.id}">Edit</button>
          <button class="btn-delete" data-id="${event.id}">Hapus</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // 🔹 Format tanggal (DD/MM/YYYY)
  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  }

  // 🔹 Klik tombol Hapus / Edit
  tableBody.addEventListener("click", (e) => {
    // Hapus event
    if (e.target.classList.contains("btn-delete")) {
      const id = e.target.dataset.id;
      if (confirm("Apakah Anda yakin ingin menghapus event ini?")) {
        let events = JSON.parse(localStorage.getItem("events")) || [];
        events = events.filter(ev => ev.id != id);
        localStorage.setItem("events", JSON.stringify(events));
        loadEvents();
      }
    }

    // Edit event
    if (e.target.classList.contains("btn-edit")) {
      const id = e.target.dataset.id;
      const events = JSON.parse(localStorage.getItem("events")) || [];
      const event = events.find(ev => ev.id == id);
      if (event) openEditModal(event);
    }
  });

  // 🔹 Buka modal edit
  function openEditModal(event) {
    editModal.style.display = "flex";
    formEdit.idEvent.value = event.id;
    formEdit.title.value = event.titleEvent || "";
    formEdit.poster.value = event.poster || "";
    formEdit.dateStart.value = event.startDate || "";
    formEdit.dateEnd.value = event.endDate || "";
    formEdit.timeStart.value = event.startTime || "";
    formEdit.timeEnd.value = event.endTime || "";
    formEdit.location.value = event.location || "";
    formEdit.description.value = event.description || "";
    formEdit.status.value = event.status || "";
  }

  // Jalankan
  createEditModal();
  loadEvents();
});
