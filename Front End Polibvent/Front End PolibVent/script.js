document.addEventListener("DOMContentLoaded", () => {
  // 🔹 Menu toggle
  const menuBar = document.querySelector(".menu-bar");
  const menuNav = document.querySelector(".menu");
  if (menuBar && menuNav) {
    menuBar.addEventListener("click", () => {
      menuNav.classList.toggle("menu-active");
    });
  }

  // 🔹 Scroll navbar effect
  const navBar = document.querySelector(".navbar");
  if (navBar) {
    window.addEventListener("scroll", () => {
      const windowPosition = window.scrollY > 0;
      navBar.classList.toggle("scrolling-active", windowPosition);
    });
  }

  // 🔹 Search event
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
      box.style.display = title.includes(input) || description.includes(input) ? "block" : "none";
    });
  }

  // 🔹 Tampilkan event dari localStorage
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const container = document.getElementById("eventContainer");
  if (container) {
    container.innerHTML = "";

    const isAdmin = window.location.href.includes("admin");

    events.forEach((event) => {
      const box = document.createElement("div");
      box.className = "box";
      box.innerHTML = `
        <img src="${event.poster || 'picture/default.jpg'}" alt="Poster Event">
        <h3>${event.titleEvent}</h3>
        <p>${event.description.substring(0, 100)}...</p>
        <div class="button-group">
          <button class="btn-detail" onclick="lihatDetail(${event.id})">Detail</button>
          ${isAdmin ? `<button class="btn-hapus" onclick="hapusEvent(${event.id})">Hapus</button>` : ""}
        </div>
      `;

      container.appendChild(box);
    });
  }
});

// 🔹 Fungsi global agar bisa dipanggil dari tombol HTML
function lihatDetail(id) {
  localStorage.setItem("selectedEventId", id);
  const isAdmin = window.location.href.includes("admin");
  window.location.href = isAdmin ? "detailevent.html" : "detaileventm.html";
}

function hapusEvent(id) {
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const filtered = events.filter((e) => e.id !== id);
  localStorage.setItem("events", JSON.stringify(filtered));
  location.reload();
}
