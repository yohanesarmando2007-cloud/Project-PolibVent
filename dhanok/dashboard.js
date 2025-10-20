// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  const eventTable = document.getElementById("eventTable");
  const editForm = document.getElementById("edit-form");
  const cancelEdit = document.getElementById("cancelEdit");
  const saveEdit = document.getElementById("saveEdit");

  let editingId = null;

  function loadEvents() {
    eventTable.innerHTML = "";
    const events = JSON.parse(localStorage.getItem("events")) || [];

    events.forEach((event, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${event.poster}" alt="poster" class="poster-thumb"></td>
        <td>${event.title}</td>
        <td>${event.date}</td>
        <td>${event.time}</td>
        <td>${event.location}</td>
        <td>${event.status === "active" ? "Aktif" : "Nonaktif"}</td>
        <td>
          <button class="btn btn-edit" data-id="${event.id}">Edit</button>
          <button class="btn btn-delete" data-id="${event.id}">Hapus</button>
        </td>
      `;
      eventTable.appendChild(row);
    });
  }

  // Hapus event
  eventTable.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const id = Number(e.target.getAttribute("data-id"));
      let events = JSON.parse(localStorage.getItem("events")) || [];
      events = events.filter((event) => event.id !== id);
      localStorage.setItem("events", JSON.stringify(events));
      loadEvents();
    }

    // Edit event
    if (e.target.classList.contains("btn-edit")) {
      const id = Number(e.target.getAttribute("data-id"));
      const events = JSON.parse(localStorage.getItem("events")) || [];
      const eventData = events.find((ev) => ev.id === id);

      if (eventData) {
        editingId = id;
        document.getElementById("editTitle").value = eventData.title;
        document.getElementById("editDate").value = eventData.date;
        document.getElementById("editTime").value = eventData.time;
        document.getElementById("editLocation").value = eventData.location;
        document.getElementById("editStatus").value = eventData.status;
        editForm.style.display = "flex";
      }
    }
  });

  // Simpan perubahan edit
  saveEdit.addEventListener("click", () => {
    const title = document.getElementById("editTitle").value.trim();
    const date = document.getElementById("editDate").value;
    const time = document.getElementById("editTime").value;
    const location = document.getElementById("editLocation").value.trim();
    const status = document.getElementById("editStatus").value;

    let events = JSON.parse(localStorage.getItem("events")) || [];
    const index = events.findIndex((ev) => ev.id === editingId);

    if (index !== -1) {
      events[index] = {
        ...events[index],
        title,
        date,
        time,
        location,
        status,
      };
      localStorage.setItem("events", JSON.stringify(events));
      loadEvents();
      editForm.style.display = "none";
    }
  });

  cancelEdit.addEventListener("click", () => {
    editForm.style.display = "none";
  });

  loadEvents();
});
