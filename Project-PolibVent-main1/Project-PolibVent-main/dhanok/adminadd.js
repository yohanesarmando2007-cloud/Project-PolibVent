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

    const newEvent = {
      id: Date.now(),
      title: document.getElementById("titleEvent").value,
      dateStart: document.getElementById("startDate").value,
      dateEnd: document.getElementById("endDate").value,
      timeStart: document.getElementById("startTime").value,
      timeEnd: document.getElementById("endTime").value,
      location: document.getElementById("location").value,
      description: document.getElementById("description").value,
      status: document.getElementById("status").value,
      poster: posterPreview.src
    };

    const events = JSON.parse(localStorage.getItem("events")) || [];
    events.push(newEvent);
    localStorage.setItem("events", JSON.stringify(events));

    alert("Event berhasil ditambahkan!");
    window.location.href = "dashboard.html";
    window.location.href = "detailevent.html";
    window.location.href = "detaileventm.html";
  });
});
