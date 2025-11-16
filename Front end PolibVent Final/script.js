document.addEventListener("DOMContentLoaded", () => {

  /* =============================
        MENU TOGGLE
  ============================= */
  const menuBar = document.querySelector(".menu-bar");
  const menuNav = document.querySelector(".menu");
  if (menuBar && menuNav) {
    menuBar.addEventListener("click", () => {
      menuNav.classList.toggle("menu-active");
    });
  }

  /* =============================
        NAVBAR SCROLL EFFECT
  ============================= */
  const navBar = document.querySelector(".navbar");
  if (navBar) {
    window.addEventListener("scroll", () => {
      const windowPosition = window.scrollY > 0;
      navBar.classList.toggle("scrolling-active", windowPosition);
    });
  }

  /* =============================
        SEARCH EVENT
  ============================= */
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
      const title = box.querySelector("h3")?.textContent.toLowerCase() || "";
      const description = box.querySelector("p:nth-of-type(1)")?.textContent.toLowerCase() || "";
      const dateText = box.querySelector("p:nth-of-type(2)")?.textContent.toLowerCase() || "";

      const match =
        title.includes(input) ||
        description.includes(input) ||
        dateText.includes(input);

      box.style.display = match ? "block" : "none";
    });
  }

  /* =============================
        LOAD EVENTS FROM LOCALSTORAGE
  ============================= */
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const container = document.getElementById("eventContainer");

  if (container) {
    container.innerHTML = "";

    const isAdmin = window.location.href.includes("admin");

    events.forEach((event) => {
      const box = document.createElement("div");
      box.className = "box";

      // Format tanggal agar lebih rapi
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
        <p><i class="fas fa-calendar"></i> ${formatDate(event.startDate)} - ${formatDate(event.endDate)}</p>

        <div class="button-group">
          <button class="btn-detail" onclick="lihatDetail(${event.id})">Detail</button>
        </div>
      `;

      container.appendChild(box);
    });
  }

});

/* =============================
      GLOBAL DETAIL FUNCTION
============================= */
function lihatDetail(id) {
  localStorage.setItem("selectedEventId", id);
  const isAdmin = window.location.href.includes("admin");
  window.location.href = isAdmin ? "detailevent.html" : "detaileventm.html";
}
