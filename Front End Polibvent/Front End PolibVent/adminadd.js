document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("eventForm");
  const posterInput = document.getElementById("poster");
  const posterPreview = document.getElementById("posterPreview");

  // Preview poster
  posterInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        posterPreview.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Submit form
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const event = {
      id: Date.now(),
      titleEvent: document.getElementById("titleEvent").value,
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value,
      startTime: document.getElementById("startTime").value,
      endTime: document.getElementById("endTime").value,
      location: document.getElementById("location").value,
      description: document.getElementById("description").value,
      status: document.getElementById("status").value,
      poster: posterPreview.src
    };

    const events = JSON.parse(localStorage.getItem("events")) || [];
    events.push(event);
    localStorage.setItem("events", JSON.stringify(events));

    alert("Event berhasil ditambahkan!");
    window.location.href = "dashboard.html";
  });
});
