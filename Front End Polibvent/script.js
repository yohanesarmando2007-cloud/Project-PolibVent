document.addEventListener("DOMContentLoaded", () => {
  // --- Navbar toggle & scroll effect ---
  const menuBar = document.querySelector(".menu-bar");
  const menuNav = document.querySelector(".menu");
  if (menuBar && menuNav) {
    menuBar.addEventListener("click", () => {
      menuNav.classList.toggle("menu-active");
    });
  }
  const navBar = document.querySelector(".navbar");
  if (navBar) {
    window.addEventListener("scroll", () => {
      navBar.classList.toggle("scrolling-active", window.scrollY > 0);
    });
  }

  // --- Search event ---
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", searchEvent);
    searchInput.addEventListener("keypress", (event) => {
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
      box.style.display =
        title.includes(input) || description.includes(input) ? "block" : "none";
    });
  }

  // --- Update status otomatis ---
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

  // --- Render event publik (hanya yang disetujui & aktif/nonaktif) ---
  function renderPublicEvents() {
    updateEventStatus();
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const container = document.getElementById("eventContainer");
    if (!container) return;
    container.innerHTML = "";
    events.filter(ev => ev.approval === "Disetujui").forEach(ev => {
      const box = document.createElement("div");
      box.className = "box";
      box.innerHTML = `
        <img src="${ev.poster || 'picture/default.jpg'}" alt="Poster">
        <h3>${ev.titleEvent}</h3>
        <p>${formatDate(ev.startDate)} - ${formatDate(ev.endDate)}</p>
        <p>${ev.startTime || '-'} - ${ev.endTime || '-'}</p>
        <p>${ev.location}</p>
        <p>${ev.description}</p>
        <p>Status: ${ev.status}</p>
        <div class="button-group">
          <button class="btn-detail" onclick="viewDetail(${ev.id})">Detail</button>
        </div>
      `;
      container.appendChild(box);
    });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  }

  // --- Tambah event baru dari modal ---
  const addEventForm = document.getElementById("addEventForm");
  const modal = document.getElementById("addEventModal");
  const posterInput = document.getElementById("poster");
  const posterPreview = document.getElementById("posterPreview");

  if (addEventForm) {
    addEventForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const events = JSON.parse(localStorage.getItem("events")) || [];

      const newEvent = {
        id: Date.now(),
        titleEvent: document.getElementById("titleEvent").value,
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        startTime: document.getElementById("startTime").value,
        endTime: document.getElementById("endTime").value,
        location: document.getElementById("location").value,
        description: document.getElementById("description").value,
        poster: posterPreview && posterPreview.style.display === "block" ? posterPreview.src : "picture/default.jpg",
        approval: "Menunggu",   // default persetujuan
        status: "Nonaktif"      // default status
      };

      events.push(newEvent);
      localStorage.setItem("events", JSON.stringify(events));
      if (modal) modal.style.display = "none";
      renderPublicEvents();
    });
  }

  // --- Navigasi ke detail ---
  window.viewDetail = function(id) {
    localStorage.setItem("selectedEventId", String(id));
    window.location.href = window.location.href.includes("admin") ? "detailevent.html" : "detaileventm.html";
  };

  // --- Initial render ---
  renderPublicEvents();
});
document.addEventListener("DOMContentLoaded", () => {
  const addEventBtn = document.getElementById("openAddEvent");
  const modal = document.getElementById("addEventModal");
  const closeModal = document.getElementById("closeModal");
  const cancelAddEvent = document.getElementById("cancelAddEvent");

  // Buka modal
  if (addEventBtn) {
    addEventBtn.addEventListener("click", () => {
      modal.style.display = "block";
    });
  }

  // Tutup modal
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }
  if (cancelAddEvent) {
    cancelAddEvent.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // Tutup modal kalau klik di luar konten
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});

