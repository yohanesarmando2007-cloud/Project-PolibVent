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
      const index = events.findIndex(ev => ev.id == id);

      if (index !== -1) {
        let posterData = events[index].poster;

        if (formEdit.posterFile.files[0]) {
          posterData = await toBase64(formEdit.posterFile.files[0]);
        }

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

  function openEditModal(eventData) {
    editModal.style.display = "flex";

    formEdit.idEvent.value = eventData.id;
    formEdit.title.value = eventData.titleEvent;
    formEdit.dateStart.value = eventData.startDate;
    formEdit.dateEnd.value = eventData.endDate;
    formEdit.timeStart.value = eventData.startTime;
    formEdit.timeEnd.value = eventData.endTime;
    formEdit.location.value = eventData.location;
    formEdit.description.value = eventData.description;

    // Status auto terisi
    formEdit.status.value = eventData.status || "Aktif";

    // Poster preview
    document.getElementById("previewPoster").src = eventData.poster;
  }

  function loadEvents() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const pending = JSON.parse(localStorage.getItem("pendingEvents")) || [];

    tableBody.innerHTML = "";

    if (events.length === 0 && pending.length === 0) {
      tableBody.innerHTML =
        `<tr><td colspan="9" style="text-align:center; color:#777;">Belum ada event</td></tr>`;
      return;
    }

    events.forEach((event, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
  <td>${index + 1}</td>
  <td><img src="${event.poster}" style="width:80px; border-radius:6px;"></td>
  <td>${event.titleEvent}</td>
  <td>${formatDate(event.startDate)} - ${formatDate(event.endDate)}</td>
  <td>${event.startTime} - ${event.endTime}</td>
  <td>${event.location}</td>

  <!-- STATUS sebenarnya -->
  <td>
    <span style="color:${event.status === "Aktif" ? "green" : "red"};">
      ${event.status}
    </span>
  </td>

  <!-- PERSETUJUAN sebenarnya -->
  <td><span style="color:green;">Disetujui</span></td>

  <td>
    <button class="btn-edit" data-id="${event.id}">Edit</button>
    <button class="btn-delete" data-id="${event.id}">Hapus</button>
  </td>
`;

      tableBody.appendChild(row);
    });

    pending.forEach((event, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>Pending-${event.id}</td>
        <td><img src="${event.poster}" style="width:80px; border-radius:6px;"></td>
        <td>${event.titleEvent}</td>
        <td>${formatDate(event.startDate)} - ${formatDate(event.endDate)}</td>
        <td>${event.startTime} - ${event.endTime}</td>
        <td>${event.location}</td>
        <td><span style="color:orange;">Menunggu Persetujuan</span></td>
        <td>
            <button onclick="approveEvent(${event.id})" style="background:green;color:white;">Setujui</button>
            <button onclick="rejectEvent(${event.id})" style="background:red;color:white;">Tolak</button>
        </td>
        <td>-</td>
      `;
      tableBody.appendChild(row);
    });
  }

window.approveEvent = (id) => {
    const pending = JSON.parse(localStorage.getItem("pendingEvents")) || [];
    let events = JSON.parse(localStorage.getItem("events")) || [];

    const ev = pending.find(e => e.id == id);
    if (!ev) return;

    ev.status = "Aktif";

    events.push(ev);
    localStorage.setItem("events", JSON.stringify(events));

    const newPending = pending.filter(e => e.id != id);
    localStorage.setItem("pendingEvents", JSON.stringify(newPending));

    alert("Event disetujui! Status berubah menjadi Aktif.");
    loadEvents();
};


window.rejectEvent = (id) => {
    let pending = JSON.parse(localStorage.getItem("pendingEvents")) || [];
    let events = JSON.parse(localStorage.getItem("events")) || [];

    const ev = pending.find(e => e.id == id);
    if (ev) {
        ev.status = "Nonaktif";

        events.push(ev);
        localStorage.setItem("events", JSON.stringify(events));
    }

    pending = pending.filter(e => e.id != id);
    localStorage.setItem("pendingEvents", JSON.stringify(pending));

    alert("Event ditolak! Status berubah menjadi Nonaktif.");
    loadEvents();
};


  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const id = e.target.dataset.id;
      if (confirm("Yakin ingin menghapus event?")) {
        let events = JSON.parse(localStorage.getItem("events")) || [];
        events = events.filter(ev => ev.id != id);
        localStorage.setItem("events", JSON.stringify(events));
        loadEvents();
      }
    }

    if (e.target.classList.contains("btn-edit")) {
      const id = e.target.dataset.id;
      const events = JSON.parse(localStorage.getItem("events")) || [];
      const event = events.find(ev => ev.id == id);
      if (event) openEditModal(event);
    }
  });

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  }

  function searchEvent() {
    const keyword = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll("#eventTable tr");

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(keyword) ? "" : "none";
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", searchEvent);
  }

  createEditModal();
  loadEvents();
});
