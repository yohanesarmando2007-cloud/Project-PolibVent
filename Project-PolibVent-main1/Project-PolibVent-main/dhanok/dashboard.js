document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("eventTable");

  function loadEvents() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    tableBody.innerHTML = "";

    events.forEach((event, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${event.poster}" alt="poster"></td>
        <td>${event.title}</td>
        <td>${formatDate(event.dateStart)} - ${formatDate(event.dateEnd)}</td>
        <td>${event.timeStart} - ${event.timeEnd}</td>
        <td>${event.location}</td>
        <td>${event.status}</td>
        <td>
          <button class="btn-edit" data-id="${event.id}">Edit</button>
          <button class="btn-delete" data-id="${event.id}">Hapus</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "undefined";
    const date = new Date(dateStr);
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear()}`;
  }

  // Hapus event
  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const id = e.target.dataset.id;
      let events = JSON.parse(localStorage.getItem("events")) || [];
      events = events.filter(ev => ev.id != id);
      localStorage.setItem("events", JSON.stringify(events));
      loadEvents();
    }
  });

  loadEvents();
});
