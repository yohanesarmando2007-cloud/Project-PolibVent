document.addEventListener("DOMContentLoaded", () => {
  // Menu toggle
  const menuBar = document.querySelector(".menu-bar");
  const menuNav = document.querySelector(".menu");
  if (menuBar && menuNav) {
    menuBar.addEventListener("click", () => {
      menuNav.classList.toggle("menu-active");
    });
  }

  // Scroll navbar effect
  const navBar = document.querySelector(".navbar");
  if (navBar) {
    window.addEventListener("scroll", () => {
      const windowPosition = window.scrollY > 0;
      navBar.classList.toggle("scrolling-active", windowPosition);
    });
  }

  // Search event
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", searchEvent);
    searchInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        searchEvent();
      }
    });
  }

  function searchEvent() {
    const input = searchInput.value.toLowerCase();
    const eventBoxes = document.querySelectorAll(".box-event .box");
    eventBoxes.forEach((box) => {
      const title = box.querySelector("h3").textContent.toLowerCase();
      const description = box.querySelector("p").textContent.toLowerCase();
      const dateText = box.querySelector("p:nth-of-type(2)").textContent.toLowerCase(); 
      // ambil <p> kedua (tanggal)

      box.style.display =
        title.includes(input) ||
        dateText.includes(input)
          ? "block"
          : "none";
    });
  }



  // Tampilkan event dari localStorage
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const container = document.getElementById("eventContainer");
  if (container) {
    container.innerHTML = "";

    const isAdmin = window.location.href.includes("admin");

events.forEach((event) => {
  const box = document.createElement("div");
  box.className = "box";

  // format tanggal agar lebih rapi
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  box.innerHTML = `
    <img src="${event.poster || 'picture/default.jpg'}" alt="Poster Event">
    <h3>${event.titleEvent}</h3>
    <p>${event.description.substring(0, 100)}...</p>
    <p> ${formatDate(event.startDate)} - ${formatDate(event.endDate)}</p>
    <div class="button-group">
      <button class="btn-detail" onclick="lihatDetail(${event.id})">Detail</button>
    </div>
  `;

  container.appendChild(box);
});

  }
});

// Fungsi global
function lihatDetail(id) {
  localStorage.setItem("selectedEventId", id);
  const isAdmin = window.location.href.includes("admin");
  window.location.href = isAdmin ? "detailevent.html" : "detaileventm.html";
}

document.addEventListener("DOMContentLoaded", () => {
document.addEventListener("DOMContentLoaded", () => {
  const eventContainer = document.getElementById("eventContainer");

  // fungsi untuk update status aktif/nonaktif otomatis
  function updateEventStatus() {
  let events = JSON.parse(localStorage.getItem("events")) || [];
  const now = new Date();

  events.forEach(ev => {
    if (ev.status === "Disetujui") {
      const endDateTime = new Date(ev.endDate + "T" + (ev.endTime || "23:59"));
      ev.status = now > endDateTime ? "Nonaktif" : "Aktif";
    }
  });

  localStorage.setItem("events", JSON.stringify(events));
}


  // fungsi render event
  function renderEvents() {
  updateEventStatus(); // cek otomatis aktif/nonaktif

  const events = JSON.parse(localStorage.getItem("events")) || [];
  eventContainer.innerHTML = "";

  events.forEach(ev => {
    const row = document.createElement("div");
    row.className = "box";
    row.innerHTML = `
      <h3>${ev.titleEvent}</h3>
      <p>${ev.startDate} - ${ev.endDate}</p>
      <p>${ev.startTime} - ${ev.endTime}</p>
      <p>${ev.location}</p>
      <p>${ev.description}</p>
      <p>Status: ${ev.status}</p>
    `;

    // kalau masih menunggu → tampilkan tombol persetujuan
    if (ev.status === "Menunggu Persetujuan") {
      row.innerHTML += `
        <div class="button-group">
          <button class="btn-approve" data-id="${ev.id}">Setujui</button>
          <button class="btn-reject" data-id="${ev.id}">Tolak</button>
        </div>
      `;
    }

    eventContainer.appendChild(row);
  });
}

  // ⬇️ di sini kamu taruh listener klik
  eventContainer.addEventListener("click", (e) => {
  let events = JSON.parse(localStorage.getItem("events")) || [];
  const id = e.target.dataset.id;

  if (e.target.classList.contains("btn-approve")) {
    const ev = events.find(ev => String(ev.id) === String(id));
    if (ev) ev.status = "Disetujui"; // langsung berubah jadi Disetujui
    localStorage.setItem("events", JSON.stringify(events));
    renderEvents();
  }

  if (e.target.classList.contains("btn-reject")) {
    const ev = events.find(ev => String(ev.id) === String(id));
    if (ev) ev.status = "Ditolak"; // langsung berubah jadi Ditolak
    localStorage.setItem("events", JSON.stringify(events));
    renderEvents();
  }
});

  // panggil render pertama kali
  renderEvents();
});


  // Elements
  const addEventBtn = document.getElementById("openAddEvent");
  const modal = document.getElementById("addEventModal");
  const closeModal = document.getElementById("closeModal");
  const cancelAddEvent = document.getElementById("cancelAddEvent");
  const addEventForm = document.getElementById("addEventForm");
  const posterInput = document.getElementById("poster");
  const posterPreview = document.getElementById("posterPreview");
  const eventContainer = document.getElementById("eventContainer");

  // Guard if index doesn’t include modal
  if (!modal || !addEventForm) return;

  // Open/close modal
  if (addEventBtn) addEventBtn.onclick = () => modal.style.display = "block";
  closeModal.onclick = () => modal.style.display = "none";
  cancelAddEvent.onclick = () => modal.style.display = "none";
  window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

  // Poster preview
  if (posterInput) {
    posterInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        posterPreview.src = reader.result;
        posterPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }

  // Save new event
  addEventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const events = JSON.parse(localStorage.getItem("events")) || [];

    const event = {
      id: Date.now(),
      titleEvent: document.getElementById("titleEvent").value,
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value,
      startTime: document.getElementById("startTime").value,
      endTime: document.getElementById("endTime").value,
      location: document.getElementById("location").value,
      description: document.getElementById("description").value,
      status: "Menunggu Persetujuan",
      poster: posterPreview && posterPreview.style.display === "block" ? posterPreview.src : "picture/default.jpg"
    };

    events.push(event);
    localStorage.setItem("events", JSON.stringify(events));
    modal.style.display = "none";
    renderPublicEvents();
  });

  // Render public events: only approved
  function renderPublicEvents() {
    if (!eventContainer) return;
    const events = JSON.parse(localStorage.getItem("events")) || [];
    eventContainer.innerHTML = "";
    events.filter(ev => ev.status === "Disetujui").forEach(ev => {
      const box = document.createElement("div");
      box.className = "box";
      box.innerHTML = `
        <img src="${ev.poster || 'picture/default.jpg'}" alt="Poster">
        <h3>${ev.titleEvent}</h3>
        <p>${formatDate(ev.startDate)} - ${formatDate(ev.endDate)}</p>
        <p>${ev.startTime || '-'} - ${ev.endTime || '-'}</p>
        <p>${ev.location}</p>
        <p>${ev.description}</p>
        <div class="button-group">
          <button class="btn-detail" onclick="viewDetail(${ev.id})">Detail</button>
        </div>
      `;
      eventContainer.appendChild(box);
    });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  }

  // Navigate to detail (reuses your detail pages)
  window.viewDetail = function(id) {
    localStorage.setItem("selectedEventId", String(id));
    // Choose whichever detail page you use:
    window.location.href = "detaileventm.html"; // or "detailevent.html"
  };

  // Initial render
  renderPublicEvents();
});

function updateEventStatus() {
  let events = JSON.parse(localStorage.getItem("events")) || [];
  const now = new Date();

  events.forEach(ev => {
    if (ev.status === "Disetujui") {
      const endDateTime = new Date(ev.endDate + "T" + (ev.endTime || "23:59"));
      if (now > endDateTime) {
        ev.status = "Nonaktif";
      } else {
        ev.status = "Aktif";
      }
    }
  });

  localStorage.setItem("events", JSON.stringify(events));
}

