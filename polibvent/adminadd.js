// Convert file to Base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Fungsi validasi ukuran file
function validateFileSize(fileInput) {
    const file = fileInput.files[0];
    const errorElement = document.getElementById("posterSizeError");
    
    if (!file) return true;
    
    const minSize = 10 * 1024; // 10KB
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (file.size < minSize) {
        if (errorElement) {
            errorElement.textContent = `File terlalu kecil. Minimal ${minSize/1024}KB.`;
            errorElement.style.display = 'block';
        }
        fileInput.value = '';
        return false;
    }
    
    if (file.size > maxSize) {
        if (errorElement) {
            errorElement.textContent = `File terlalu besar. Maksimal ${maxSize/(1024*1024)}MB.`;
            errorElement.style.display = 'block';
        }
        fileInput.value = '';
        return false;
    }
    
    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        if (errorElement) {
            errorElement.textContent = 'Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.';
            errorElement.style.display = 'block';
        }
        fileInput.value = '';
        return false;
    }
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    
    return true;
}

document.addEventListener("DOMContentLoaded", function() {
    // Preview image
    document.getElementById("poster").addEventListener("change", function(e) {
        const file = e.target.files[0];
        const preview = document.getElementById("posterPreview");
        const errorElement = document.getElementById("posterSizeError");
        
        // Validasi ukuran file
        if (file && !validateFileSize(this)) {
            return;
        }
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                preview.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Form submission
    document.getElementById("eventForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        
        // Validasi file size sebelum submit
        const posterInput = document.getElementById("poster");
        if (posterInput.files[0] && !validateFileSize(posterInput)) {
            return;
        }
        
        const formData = new FormData(this);
        let posterData = "";

        if (formData.get("poster").size > 0) {
            posterData = await toBase64(formData.get("poster"));
        } else {
            posterData = "https://via.placeholder.com/300x200?text=Event+Poster";
        }

        const newEvent = {
            title: formData.get("titleEvent"),
            description: formData.get("description"),
            start_date: formData.get("startDate"),
            end_date: formData.get("endDate"),
            start_time: formData.get("startTime"),
            end_time: formData.get("endTime"),
            location: formData.get("location"),
            poster_url: posterData,
            status: formData.get("status"),
            approval_status: "Menunggu" // Status persetujuan
        };

        // Simpan ke database atau localStorage
        try {
            const response = await fetch('api_events.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert("Event berhasil ditambahkan! Status: Menunggu Persetujuan");
                window.location.href = "dashboard.html";
            } else {
                alert("Gagal menambahkan event.");
            }
        } catch (error) {
            console.error('Error:', error);
            // Fallback ke localStorage
            const events = JSON.parse(localStorage.getItem("events")) || [];
            newEvent.id = Date.now();
            events.push(newEvent);
            localStorage.setItem("events", JSON.stringify(events));
            
            alert("Event berhasil ditambahkan (offline mode)! Status: Menunggu Persetujuan");
            window.location.href = "dashboard.html";
        }
    });
});