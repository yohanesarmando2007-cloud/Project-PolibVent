// Base64 conversion function
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Menu toggle
    const menuBar = document.querySelector(".menu-bar");
    const menuNav = document.querySelector(".menu");
    if (menuBar && menuNav) {
        menuBar.addEventListener("click", () => {
            menuNav.classList.toggle("menu-active");
        });
    }

    // Navbar scroll effect
    const navBar = document.querySelector(".navbar");
    if (navBar) {
        window.addEventListener("scroll", () => {
            const windowPosition = window.scrollY > 0;
            navBar.classList.toggle("scrolling-active", windowPosition);
        });
    }

    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", searchEvent);
    }

    // Modal elements
    const addEventModal = document.getElementById("addEventModal");
    const addEventForm = document.getElementById("addEventForm");
    const addEventBtn = document.getElementById("addEventBtn");
    const cancelAddEvent = document.getElementById("cancelAddEvent");

    // Show add event modal
    if (addEventBtn && addEventModal) {
        addEventBtn.addEventListener("click", () => {
            addEventModal.style.display = "flex";
        });
    }

    // Hide add event modal
    if (cancelAddEvent && addEventModal) {
        cancelAddEvent.addEventListener("click", () => {
            addEventModal.style.display = "none";
            addEventForm.reset();
            document.getElementById("posterPreview").style.display = "none";
        });
    }

    // Preview image for add event form
    const posterInput = document.getElementById("poster");
    if (posterInput) {
        posterInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            const posterPreview = document.getElementById("posterPreview");
            if (file && posterPreview) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    posterPreview.src = e.target.result;
                    posterPreview.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Add event form submission
    if (addEventForm) {
        addEventForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const formData = new FormData(addEventForm);
            let posterData = "";
            
            // Convert image to base64 if provided
            const posterFile = formData.get("poster");
            if (posterFile && posterFile.size > 0) {
                posterData = await toBase64(posterFile);
            } else {
                // Default poster if no image uploaded
                posterData = "https://via.placeholder.com/300x200?text=Poster+Event";
            }
            
            // Create new event object
            const newEvent = {
                id: Date.now(),
                titleEvent: formData.get("title"),
                poster: posterData,
                startDate: formData.get("startDate"),
                endDate: formData.get("endDate"),
                startTime: formData.get("startTime"),
                endTime: formData.get("endTime"),
                location: formData.get("location"),
                description: formData.get("description"),
                status: "Aktif",
                approval: "Menunggu"  // Initial approval status - butuh persetujuan admin
            };
            
            // Save to localStorage
            const events = JSON.parse(localStorage.getItem("events")) || [];
            events.push(newEvent);
            localStorage.setItem("events", JSON.stringify(events));
            
            // Reset form and close modal
            addEventForm.reset();
            const posterPreview = document.getElementById("posterPreview");
            if (posterPreview) {
                posterPreview.style.display = "none";
            }
            if (addEventModal) {
                addEventModal.style.display = "none";
            }
            
            // Reload events
            loadEvents();
            
            alert("Event berhasil ditambahkan! Menunggu persetujuan admin.");
        });
    }

    // Load events for public view
    loadEvents();
    
    // Add some sample events if none exist
    if (!localStorage.getItem("events") || JSON.parse(localStorage.getItem("events")).length === 0) {
        const sampleEvents = [
            {
                id: 1,
                titleEvent: "Seminar Kewirausahaan",
                poster: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
                startDate: "2024-06-15",
                endDate: "2024-06-15",
                startTime: "09:00",
                endTime: "12:00",
                location: "Aula Utama Polibatam",
                description: "Seminar tentang kewirausahaan dan peluang bisnis di era digital. Acara ini menghadirkan pembicara dari dunia usaha dan akademisi.",
                status: "Aktif",
                approval: "Disetujui"
            },
            {
                id: 2,
                titleEvent: "Festival Musik Kampus",
                poster: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
                startDate: "2024-07-20",
                endDate: "2024-07-21",
                startTime: "16:00",
                endTime: "22:00",
                location: "Lapangan Kampus Polibatam",
                description: "Festival musik menampilkan band-band dari berbagai jurusan. Acara dua hari dengan berbagai genre musik.",
                status: "Aktif",
                approval: "Disetujui"
            }
        ];
        
        localStorage.setItem("events", JSON.stringify(sampleEvents));
        loadEvents();
    }
});

// Load events for public view
function loadEvents() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const container = document.getElementById("eventContainer");
    
    if (!container) return;
    
    container.innerHTML = "";
    
    // Filter only approved events for public view
    const approvedEvents = events.filter(event => event.approval === "Disetujui" && event.status === "Aktif");
    
    if (approvedEvents.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #777;">
                <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3>Belum ada event yang tersedia</h3>
                <p>Silakan tambah event baru atau hubungi admin untuk persetujuan.</p>
            </div>
        `;
        return;
    }
    
    approvedEvents.forEach((event) => {
        const box = document.createElement("div");
        box.className = "box";
        
        // Format date
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
            <img src="${event.poster || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="Poster Event">
            <h3>${event.titleEvent}</h3>
            <p>${event.description.substring(0, 100)}...</p>
            <p><i class="fas fa-calendar"></i> ${formatDate(event.startDate)} - ${formatDate(event.endDate)}</p>
            <p><i class="fas fa-clock"></i> ${event.startTime} - ${event.endTime}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
            <div class="button-group">
                <button class="btn-detail" onclick="viewEventDetail(${event.id})">Lihat Detail</button>
            </div>
        `;
        
        container.appendChild(box);
    });
}

// Search events
function searchEvent() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;
    
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

// View event detail - redirect to detail page
function viewEventDetail(id) {
    localStorage.setItem("selectedEventId", id);
    window.location.href = "detaileventm.html";
}

// Format date for display
function formatDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('addEventModal');
    if (event.target === modal) {
        modal.style.display = 'none';
        const form = document.getElementById('addEventForm');
        if (form) form.reset();
        const posterPreview = document.getElementById('posterPreview');
        if (posterPreview) posterPreview.style.display = 'none';
    }
});