// Convert file to Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("eventTable");
  const searchInput = document.getElementById("searchInput");

  let editModal;
  let formEdit;

  // Create edit modal
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
          <input type="file" name="posterFile" accept="image/*"><br><br>
          <img id="previewPoster" src="" style="width:100%; max-height:150px;">

          <br><br><label>Tanggal Mulai:</label>
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
          </select>
          <br><br>

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

    // Close modal handler
    modal.querySelector("#closeModal").addEventListener("click", () => {
      modal.style.display = "none";
    });

    // Image preview handler
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

    // Form submit handler
    formEdit.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = formEdit.idEvent.value;
      let events = JSON.parse(localStorage.getItem("events")) || [];
      const index = events.findIndex(ev => ev.id == id);

      if (index !== -1) {
        let posterData = events[index].poster;

        // Handle new poster upload
        if (formEdit.posterFile.files[0]) {
          posterData = await toBase64(formEdit.posterFile.files[0]);
        }

        // Update event data
        events[index] = {
          ...events[index],
          id,
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

  // Open edit modal with event data
  function openEditModal(eventData) {
    editModal.style.display = "flex";

    // Populate form fields
    formEdit.idEvent.value = eventData.id;
    formEdit.title.value = eventData.titleEvent;
    formEdit.dateStart.value = eventData.startDate;
    formEdit.dateEnd.value = eventData.endDate;
    formEdit.timeStart.value = eventData.startTime;
    formEdit.timeEnd.value = eventData.endTime;
    formEdit.location.value = eventData.location;
    formEdit.description.value = eventData.description;
    formEdit.status.value = eventData.status || "Aktif";

    // Set poster preview
    document.getElementById("previewPoster").src = eventData.poster;
  }

  // Load events to table
  function loadEvents() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    tableBody.innerHTML = "";

    if (events.length === 0) {
      tableBody.innerHTML =
        `<tr><td colspan="9" style="text-align:center; color:#777;">Belum ada event</td></tr>`;
      return;
    }

    events.forEach((event, index) => {
      const row = document.createElement("tr");

      let approveUI = "";

      // UI untuk kolom persetujuan
      if (event.approval === "Disetujui") {
        approveUI = `<span style="color:green;">✔ Disetujui</span>`;
      } else if (event.approval === "Ditolak") {
        approveUI = `<span style="color:red;">✖ Ditolak</span>`;
      } else {
        approveUI = `
          <button class="btn-approve" data-id="${event.id}" style="background:green;color:white;">Setujui</button>
          <button class="btn-reject" data-id="${event.id}" style="background:red;color:white;">Tolak</button>
        `;
      }

      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${event.poster}" style="width:80px; border-radius:6px;"></td>
        <td>${event.titleEvent}</td>
        <td>${formatDate(event.startDate)} - ${formatDate(event.endDate)}</td>
        <td>${event.startTime} - ${event.endTime}</td>
        <td>${event.location}</td>

        <!-- STATUS (Aktif / Nonaktif) -->
        <td>
          <span style="color:${event.status === "Aktif" ? "green" : "red"};">
            ${event.status}
          </span>
        </td>

        <!-- PERSETUJUAN -->
        <td>${approveUI}</td>

        <!-- Aksi -->
        <td>
          <button class="btn-edit" data-id="${event.id}">Edit</button>
          <button class="btn-delete" data-id="${event.id}">Hapus</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  // Format date to DD/MM/YYYY
  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  }

  // Search events
  function searchEvent() {
    const keyword = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll("#eventTable tr");

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(keyword) ? "" : "none";
    });
  }

  // Table event delegation
  tableBody.addEventListener("click", (e) => {
    // DELETE event
    if (e.target.classList.contains("btn-delete")) {
      const id = e.target.dataset.id;
      if (confirm("Yakin ingin menghapus event?")) {
        let events = JSON.parse(localStorage.getItem("events")) || [];
        events = events.filter(ev => ev.id != id);
        localStorage.setItem("events", JSON.stringify(events));
        loadEvents();
      }
    }

    // EDIT event
    if (e.target.classList.contains("btn-edit")) {
      const id = e.target.dataset.id;
      const events = JSON.parse(localStorage.getItem("events")) || [];
      const event = events.find(ev => ev.id == id);
      if (event) openEditModal(event);
    }

    // APPROVE event
    if (e.target.classList.contains("btn-approve")) {
      const id = e.target.dataset.id;
      let events = JSON.parse(localStorage.getItem("events")) || [];

      const event = events.find(ev => ev.id == id);
      if (event) {
        event.approval = "Disetujui";
        localStorage.setItem("events", JSON.stringify(events));
        loadEvents();
      }
    }

    // REJECT event
    if (e.target.classList.contains("btn-reject")) {
      const id = e.target.dataset.id;
      let events = JSON.parse(localStorage.getItem("events")) || [];

      const event = events.find(ev => ev.id == id);
      if (event) {
        event.approval = "Ditolak";
        localStorage.setItem("events", JSON.stringify(events));
        loadEvents();
      }
    }
  });

  // Search input event listener
  if (searchInput) {
    searchInput.addEventListener("input", searchEvent);
  }

  // Initialize
  createEditModal();
  loadEvents();
});

// Function to create new event (for reference)
function createNewEvent() {
  const newEvent = {
    id: Date.now(),
    titleEvent: "Judul Event",
    poster: "data:image/png;base64,...",
    startDate: "2024-01-01",
    endDate: "2024-01-02",
    startTime: "10:00",
    endTime: "17:00",
    location: "Lokasi Event",
    description: "Deskripsi event",
    status: "Aktif",
    approval: "Menunggu"  // Important: Initial approval status
  };
  
  return newEvent;
}