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
    const editEventModal = document.getElementById("editEventModal");
    const addEventForm = document.getElementById("addEventForm");
    const editEventForm = document.getElementById("editEventForm");
    const addEventBtn = document.getElementById("addEventBtn");
    const cancelAddEvent = document.getElementById("cancelAddEvent");
    const cancelEditEvent = document.getElementById("cancelEditEvent");
    const adminLink = document.getElementById("adminLink");
    const loginBtn = document.getElementById("loginBtn");

    // Check if user is admin (for demo purposes)
    let isAdmin = localStorage.getItem('isAdmin') === 'true';
    updateUIForUserRole();

    // Toggle admin status
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isAdmin = !isAdmin;
        localStorage.setItem('isAdmin', isAdmin);
        updateUIForUserRole();
        loadEvents();
        loadAdminEvents();
    });

    function updateUIForUserRole() {
        if (isAdmin) {
            adminLink.style.display = 'block';
            loginBtn.textContent = 'Keluar (Admin)';
            document.getElementById('admin').style.display = 'block';
        } else {
            adminLink.style.display = 'none';
            loginBtn.textContent = 'Masuk sebagai Admin';
            document.getElementById('admin').style.display = 'none';
        }
    }

    // Show add event modal
    addEventBtn.addEventListener("click", () => {
        addEventModal.style.display = "flex";
    });

    // Hide add event modal
    cancelAddEvent.addEventListener("click", () => {
        addEventModal.style.display = "none";
    });

    // Hide edit event modal
    cancelEditEvent.addEventListener("click", () => {
        editEventModal.style.display = "none";
    });

    // Preview image for add event form
    document.getElementById("poster").addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById("posterPreview").src = e.target.result;
                document.getElementById("posterPreview").style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    });

    // Preview image for edit event form
    document.getElementById("editPoster").addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById("editPosterPreview").src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Add event form submission
    addEventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = new FormData(addEventForm);
        let posterData = "";
        
        // Convert image to base64 if provided
        if (formData.get("poster").size > 0) {
            posterData = await toBase64(formData.get("poster"));
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
            approval: "Menunggu"  // Initial approval status
        };
        
        // Save to localStorage
        const events = JSON.parse(localStorage.getItem("events")) || [];
        events.push(newEvent);
        localStorage.setItem("events", JSON.stringify(events));
        
        // Reset form and close modal
        addEventForm.reset();
        document.getElementById("posterPreview").style.display = "none";
        addEventModal.style.display = "none";
        
        // Reload events
        loadEvents();
        if (isAdmin) {
            loadAdminEvents();
        }
        
        alert("Event berhasil ditambahkan! Menunggu persetujuan admin.");
    });

    // Edit event form submission
    editEventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = new FormData(editEventForm);
        const id = parseInt(formData.get("id"));
        
        let events = JSON.parse(localStorage.getItem("events")) || [];
        const eventIndex = events.findIndex(ev => ev.id === id);
        
        if (eventIndex !== -1) {
            let posterData = events[eventIndex].poster;
            
            // Update poster if new one is provided
            if (formData.get("poster").size > 0) {
                posterData = await toBase64(formData.get("poster"));
            }
            
            // Update event
            events[eventIndex] = {
                ...events[eventIndex],
                titleEvent: formData.get("title"),
                poster: posterData,
                startDate: formData.get("startDate"),
                endDate: formData.get("endDate"),
                startTime: formData.get("startTime"),
                endTime: formData.get("endTime"),
                location: formData.get("location"),
                description: formData.get("description"),
                status: formData.get("status")
            };
            
            localStorage.setItem("events", JSON.stringify(events));
            editEventModal.style.display = "none";
            
            // Reload events
            loadEvents();
            loadAdminEvents();
            
            alert("Event berhasil diperbarui!");
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
                    <p>Silakan tambahkan event baru atau hubungi admin untuk persetujuan.</p>
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
                <div class="box-content">
                    <h3>${event.titleEvent}</h3>
                    <p>${event.description.substring(0, 100)}...</p>
                    <p><i class="fas fa-calendar"></i> ${formatDate(event.startDate)} - ${formatDate(event.endDate)}</p>
                    <p><i class="fas fa-clock"></i> ${event.startTime} - ${event.endTime}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                    <div class="button-group">
                        <button class="btn-detail" onclick="viewEventDetail(${event.id})">Detail</button>
                    </div>
                </div>
            `;
            
            container.appendChild(box);
        });
    }
    
    // Load events for admin view
    function loadAdminEvents() {
        const events = JSON.parse(localStorage.getItem("events")) || [];
        const tableBody = document.getElementById("adminEventTable");
        
        if (!tableBody) return;
        
        tableBody.innerHTML = "";
        
        if (events.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; color: #777; padding: 40px;">
                        <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 10px;"></i>
                        <p>Belum ada event</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        events.forEach((event, index) => {
            const row = document.createElement("tr");
            
            let approveUI = "";
            
            // Approval UI
            if (event.approval === "Disetujui") {
                approveUI = `<span style="color:green;">✔ Disetujui</span>`;
            } else if (event.approval === "Ditolak") {
                approveUI = `<span style="color:red;">✖ Ditolak</span>`;
            } else {
                approveUI = `
                    <button class="btn-approve" data-id="${event.id}">Setujui</button>
                    <button class="btn-reject" data-id="${event.id}">Tolak</button>
                `;
            }
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><img src="${event.poster || 'https://via.placeholder.com/80x60?text=No+Image'}" style="width:80px; border-radius:6px;"></td>
                <td>${event.titleEvent}</td>
                <td>${formatDate(event.startDate)} - ${formatDate(event.endDate)}</td>
                <td>${event.startTime} - ${event.endTime}</td>
                <td>${event.location}</td>
                <td>
                    <span style="color:${event.status === "Aktif" ? "green" : "red"};">
                        ${event.status}
                    </span>
                </td>
                <td>${approveUI}</td>
                <td>
                    <button class="btn-edit" data-id="${event.id}">Edit</button>
                    <button class="btn-delete" data-id="${event.id}">Hapus</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners for admin buttons
        tableBody.addEventListener("click", (e) => {
            // Delete event
            if (e.target.classList.contains("btn-delete")) {
                const id = e.target.dataset.id;
                if (confirm("Yakin ingin menghapus event?")) {
                    let events = JSON.parse(localStorage.getItem("events")) || [];
                    events = events.filter(ev => ev.id != id);
                    localStorage.setItem("events", JSON.stringify(events));
                    loadEvents();
                    loadAdminEvents();
                }
            }
            
            // Edit event
            if (e.target.classList.contains("btn-edit")) {
                const id = e.target.dataset.id;
                const events = JSON.parse(localStorage.getItem("events")) || [];
                const event = events.find(ev => ev.id == id);
                if (event) openEditModal(event);
            }
            
            // Approve event
            if (e.target.classList.contains("btn-approve")) {
                const id = e.target.dataset.id;
                let events = JSON.parse(localStorage.getItem("events")) || [];
                
                const event = events.find(ev => ev.id == id);
                if (event) {
                    event.approval = "Disetujui";
                    localStorage.setItem("events", JSON.stringify(events));
                    loadEvents();
                    loadAdminEvents();
                }
            }
            
            // Reject event
            if (e.target.classList.contains("btn-reject")) {
                const id = e.target.dataset.id;
                let events = JSON.parse(localStorage.getItem("events")) || [];
                
                const event = events.find(ev => ev.id == id);
                if (event) {
                    event.approval = "Ditolak";
                    localStorage.setItem("events", JSON.stringify(events));
                    loadEvents();
                    loadAdminEvents();
                }
            }
        });
    }
    
    // Open edit modal
    function openEditModal(eventData) {
        document.getElementById("editId").value = eventData.id;
        document.getElementById("editTitle").value = eventData.titleEvent;
        document.getElementById("editStartDate").value = eventData.startDate;
        document.getElementById("editEndDate").value = eventData.endDate;
        document.getElementById("editStartTime").value = eventData.startTime;
        document.getElementById("editEndTime").value = eventData.endTime;
        document.getElementById("editLocation").value = eventData.location;
        document.getElementById("editDescription").value = eventData.description;
        document.getElementById("editStatus").value = eventData.status;
        
        if (eventData.poster) {
            document.getElementById("editPosterPreview").src = eventData.poster;
        }
        
        editEventModal.style.display = "flex";
    }
    
    // Format date for display
    function formatDate(dateStr) {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return `${String(date.getDate()).padStart(2, "0")}/${String(
            date.getMonth() + 1
        ).padStart(2, "0")}/${date.getFullYear()}`;
    }
    
    // Search events
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
    
    // View event detail
    window.viewEventDetail = (id) => {
        const events = JSON.parse(localStorage.getItem("events")) || [];
        const event = events.find(ev => ev.id === id);
        
        if (event) {
            alert(`Detail Event:\n\nJudul: ${event.titleEvent}\nDeskripsi: ${event.description}\nTanggal: ${formatDate(event.startDate)} - ${formatDate(event.endDate)}\nWaktu: ${event.startTime} - ${event.endTime}\nLokasi: ${event.location}`);
        }
    };
    
    // Initialize
    loadEvents();
    if (isAdmin) {
        loadAdminEvents();
    }
    
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
                description: "Seminar tentang kewirausahaan dan peluang bisnis di era digital.",
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
                description: "Festival musik menampilkan band-band dari berbagai jurusan.",
                status: "Aktif",
                approval: "Disetujui"
            }
        ];
        
        localStorage.setItem("events", JSON.stringify(sampleEvents));
        loadEvents();
        if (isAdmin) {
            loadAdminEvents();
        }
    }
});