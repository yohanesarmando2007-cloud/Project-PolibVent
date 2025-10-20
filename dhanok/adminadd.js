// adminadd.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("eventForm");
  const posterInput = document.getElementById("poster");
  const posterPreview = document.getElementById("posterPreview");

  // Tampilkan preview gambar
  posterInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        posterPreview.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Saat tombol submit ditekan
  const addBtn = document.querySelector("a.primary");
  addBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const title = document.getElementById("titleEvent").value.trim();
    const date = document.getElementById("dateEvent").value;
    const time = document.getElementById("timeEvent").value;
    const location = document.getElementById("location").value.trim();
    const description = document.getElementById("description").value.trim();
    const status = document.getElementById("status").value;
    const posterSrc = posterPreview.src;

    if (!title || !date || !time || !location || !description) {
      alert("Harap isi semua data wajib (*).");
      return;
    }

    // Ambil data lama dari localStorage
    const storedEvents = JSON.parse(localStorage.getItem("events")) || [];

    // Buat event baru
    const newEvent = {
      id: Date.now(),
      title,
      date,
      time,
      location,
      description,
      status,
      poster: posterSrc,
    };

    // Simpan ke localStorage
    storedEvents.push(newEvent);
    localStorage.setItem("events", JSON.stringify(storedEvents));

    alert("Event berhasil ditambahkan!");
    window.location.href = "dashboard.html";
  });
});
