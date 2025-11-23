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
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      // Convert image to base64 if poster is uploaded
      let posterData = posterPreview.src;
      const posterFile = posterInput.files[0];
      
      if (posterFile) {
        posterData = await toBase64(posterFile);
      }

      const event = {
        id: Date.now(),
        title: document.getElementById("titleEvent").value, // Gunakan 'title' bukan 'titleEvent'
        start_date: document.getElementById("startDate").value,
        end_date: document.getElementById("endDate").value,
        start_time: document.getElementById("startTime").value,
        end_time: document.getElementById("endTime").value,
        location: document.getElementById("location").value,
        description: document.getElementById("description").value,
        status: document.getElementById("status").value,
        poster_url: posterData, // Gunakan 'poster_url' untuk konsistensi
        approval_status: "Menunggu" // Tambahkan status persetujuan default
      };

      console.log("Event to be saved:", event);

      // Coba simpan ke database via API
      try {
        const response = await fetch('api_events.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event)
        });

        const result = await response.json();
        console.log("API Response:", result);
        
        if (result.success) {
          alert("Event berhasil ditambahkan ke database!");
          window.location.href = "dashboard.html";
          return;
        }
      } catch (error) {
        console.error('Error saving to API:', error);
        // Fallback ke localStorage
      }

      // Fallback: Simpan ke localStorage
      const events = JSON.parse(localStorage.getItem("events")) || [];
      
      // Convert ke format yang kompatibel dengan halaman lain
      const compatibleEvent = {
        id: event.id,
        titleEvent: event.title, // Backup field untuk kompatibilitas
        title: event.title,
        startDate: event.start_date,
        endDate: event.end_date,
        startTime: event.start_time,
        endTime: event.end_time,
        location: event.location,
        description: event.description,
        status: event.status,
        poster: event.poster_url,
        poster_url: event.poster_url,
        approval: event.approval_status,
        approval_status: event.approval_status
      };
      
      events.push(compatibleEvent);
      localStorage.setItem("events", JSON.stringify(events));

      alert("Event berhasil ditambahkan (offline mode)!");
      window.location.href = "dashboard.html";

    } catch (error) {
      console.error('Error adding event:', error);
      alert("Terjadi kesalahan saat menambahkan event.");
    }
  });

  // Base64 conversion function
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
});