function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("eventTable");
  const searchInput = document.getElementById("searchInput");

  let editModal;
  let formEdit;

  // Buat modal edit dinamis
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
      <div style="
        background:#fff;
        padding:20px;
        border-radius:8px;
        width:100%;
        max-width:400px;
        max-height:90vh;
        overflow-y:auto;
        box-sizing:border-box;
      ">
        <h3>Edit Event</h3>
        <form id="formEdit">
          <input type="hidden" name="idEvent">
          <label>Judul:</label>
          <input type="text" name="title" required style="width:100%;"><br><br>
          <label>Upload Poster:</label>
          <input type="file" name="posterFile" accept="image/*" style="width:100%;"><br><br>
          <img id="previewPoster" src="" style="width:100%; max-height:150px; object-fit:cover; border-radius:6px;"><br><br>
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
          <textarea name="description" rows="3" required style="width:100%; resize:vertical;"></textarea><br><br>
          <label>Status:</label>
          <input type="text" name="status" style="width:100%;"><br><br>
          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button type="submit">Simpan</button>
            <button type="button" id="closeModal">Batal</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    editModal = modal;
    formEdit = modal.querySelector("#formEdit");

    modal.querySelector("#closeModal").addEventListener("click", () => {
      modal.style.display = "none";
    });

    formEdit.posterFile.addEventListener("change", () => {
      const file = formEdit.posterFile.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          document.getElementById("previewPoster").src = reader.result;
        };
        reader.readAsDataURL(file);
      }
    });

    formEdit.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = formEdit.idEvent.value;
      let events = JSON.parse(localStorage.getItem("events")) || [];
      const index = events.findIndex(ev => String(ev.id) === String(id));

      if (index !== -1) {
        const fileInput = formEdit.posterFile;
        let posterData = events[index].poster;

        if (fileInput.files[0]) {
          posterData = await toBase64(fileInput.files[0]);
        }

        events[index] = {
          ...events[index],
          id: formEdit.idEvent.value,
          titleEvent: formEdit.title.value,
          poster: posterData,
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

  // Render tabel event
  function loadEvents() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    tableBody.innerHTML = "";

    if (events.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#777;">Belum ada event</td></tr>`;
      return;
    }

    events.forEach((event, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td data-label="No">${index + 1}</td>
        <td data-label="Poster"><img src="${event.poster || 'picture/default.jpg'}" alt="poster" style="width:80px; height:80px; object-fit:cover; border-radius:6px;"></td>
        <td data-label="Judul">${event.titleEvent || '-'}</td>
        <td data-label="Tanggal">${formatDate(event.startDate)} - ${formatDate(event.endDate)}</td>
        <td data-label="Waktu">${event.startTime || '-'} - ${event.endTime || '-'}</td>
        <td data-label="Lokasi">${event.location || '-'}</td>
        <td data-label="Status">${event.status || '-'}</td>
        <td data-label="Aksi">
          <button class="btn-edit" data-id="${event.id}">Edit</button>
          <button class="btn-delete" data-id="${event.id}">Hapus</button>
        </td>
        <td data-label="Persetujuan">
          <button class="btn-approve" data-id="${event.id}">Setujui</button>
          <button class="btn-reject" data-id="${event.id}">Tolak</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  }

  function searchEvent() {
    const keyword = (searchInput?.value || "").toLowerCase();
    const rows = document.querySelectorAll("#eventTable tr");

    rows.forEach(row => {
      const title = row.querySelector("td:nth-child(3)")?.textContent.toLowerCase() || "";
      const location = row.querySelector("td:nth-child(6)")?.textContent.toLowerCase() || "";
      const match = title.includes(keyword) || location.includes(keyword);
      row.style.display = match ? "" : "none";
    });
  }

  // Delegasi klik untuk hapus, edit, setujui, tolak
  tableBody.addEventListener("click", async (e) => {
    const target = e.target;
    // Hapus
    if (target.classList.contains("btn-delete")) {
      const id = target.dataset.id;
      if (confirm("Apakah Anda yakin ingin menghapus event ini?")) {
        let events = JSON.parse(localStorage.getItem("events")) || [];
        events = events.filter(ev => String(ev.id) !== String(id));
        localStorage.setItem("events", JSON.stringify(events));
        loadEvents();
      }
      return;
    }

    // Edit
    if (target.classList.contains("btn-edit")) {
      const id = target.dataset.id;
      const events = JSON.parse(localStorage.getItem("events")) || [];
      const event = events.find(ev => String(ev.id) === String(id));
      if (event) openEditModal(event);
      return;
    }

    // Setujui
    if (target.classList.contains("btn-approve")) {
      const id = target.dataset.id;
      const events = JSON.parse(localStorage.getItem("events")) || [];
      const ev = events.find(ev => String(ev.id) === String(id));
      if (ev) {
        ev.status = "Disetujui";
        localStorage.setItem("events", JSON.stringify(events));
        loadEvents();
      }
      return;
    }

    // Tolak
    if (target.classList.contains("btn-reject")) {
      const id = target.dataset.id;
      const events = JSON.parse(localStorage.getItem("events")) || [];
      const ev = events.find(ev => String(ev.id) === String(id));
      if (ev) {
        ev.status = "Ditolak";
        localStorage.setItem("events", JSON.stringify(events));
        loadEvents();
      }
      return;
    }
  });

  function openEditModal(event) {
    editModal.style.display = "flex";
    formEdit.idEvent.value = event.id;
    formEdit.title.value = event.titleEvent || "";
    formEdit.dateStart.value = event.startDate || "";
    formEdit.dateEnd.value = event.endDate || "";
    formEdit.timeStart.value = event.startTime || "";
    formEdit.timeEnd.value = event.endTime || "";
    formEdit.location.value = event.location || "";
    formEdit.description.value = event.description || "";
    formEdit.status.value = event.status || "";
    document.getElementById("previewPoster").src = event.poster || "picture/default.jpg";
  }

  if (searchInput) {
    searchInput.addEventListener("input", searchEvent);
    searchInput.addEventListener("keypress", function (evt) {
      if (evt.key === "Enter") {
        evt.preventDefault();
        searchEvent();
      }
    });
  }

  createEditModal();
  loadEvents();
});

// Script popup Tambah Event (kalau kamu pakai modal di dashboard)
const modal = document.getElementById("eventModal");
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");
const closeModalBtn = document.getElementById("closeModalBtn");

if (openBtn && modal) {
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "block";
  });
}
if (closeBtn && modal) {
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
}
if (closeModalBtn && modal) {
  closeModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "none";
  });
}
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
