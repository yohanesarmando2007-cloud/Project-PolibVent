// dashboard.js - TABLE COMPATIBLE VERSION
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Dashboard loaded");
    
    if (!checkAuth()) return;
    
    initializeDashboard();
});

function checkAuth() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn || isLoggedIn !== "true") {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function initializeDashboard() {
    console.log("🔄 Initializing dashboard...");
    loadEvents();
    initializeEventListeners();
    updateUserInfo();
}

function updateUserInfo() {
    const adminUser = localStorage.getItem("adminUser");
    const userInfoElement = document.getElementById("userInfo");
    if (userInfoElement && adminUser) {
        userInfoElement.textContent = `Halo, ${adminUser}`;
    }
}

function initializeEventListeners() {
    console.log("🔗 Setting up event listeners...");
    
    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", searchEvents);
    }
}

// LOAD EVENTS - TABLE COMPATIBLE
async function loadEvents() {
    console.log("🔄 loadEvents() called");
    
    const tableBody = document.querySelector("#eventTable");
    if (!tableBody) {
        console.error("❌ Event table body not found!");
        return;
    }
    
    console.log("✅ Table body found");
    
    try {
        let events = [];
        
        // Try API first
        try {
            console.log("🌐 Attempting API fetch...");
            const response = await fetch('api_events.php');
            
            if (response.ok) {
                events = await response.json();
                console.log("✅ API events loaded:", events.length);
            } else {
                throw new Error('API response not OK');
            }
        } catch (apiError) {
            console.warn("⚠️ API failed, using localStorage:", apiError);
            events = JSON.parse(localStorage.getItem("events")) || [];
            console.log("📁 LocalStorage events:", events.length);
        }
        
        console.log("📊 Final events to display:", events);
        
        // Display events in table format
        displayEventsTable(events);
        
    } catch (error) {
        console.error("❌ Load events error:", error);
        const tableBody = document.querySelector("#eventTable");
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; color: red; padding: 20px;">
                        <h3>Error loading events</h3>
                        <p>${error.message}</p>
                        <button onclick="loadEvents()">Retry</button>
                    </td>
                </tr>
            `;
        }
    }
}

// DISPLAY EVENTS IN TABLE FORMAT
function displayEventsTable(events) {
    console.log("🎨 displayEventsTable() called with:", events.length, "events");
    
    const tableBody = document.querySelector("#eventTable");
    if (!tableBody) {
        console.error("❌ Table body not found!");
        return;
    }
    
    tableBody.innerHTML = "";
    
    if (!events || events.length === 0) {
        console.log("📭 No events to display");
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px;">
                    <h3>Belum ada event</h3>
                    <p>Tambahkan event pertama Anda!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    console.log(`🖼️ Displaying ${events.length} events in table`);
    
    events.forEach((event, index) => {
        console.log(`   Creating table row for event ${index + 1}:`, event);
        
        const row = document.createElement("tr");
        
        // Normalize event data - handle semua field names
        const normalizedEvent = normalizeEventData(event);
        const title = normalizedEvent.title;
        const poster = normalizedEvent.poster_url;
        const startDate = normalizedEvent.start_date;
        const endDate = normalizedEvent.end_date;
        const startTime = normalizedEvent.start_time;
        const endTime = normalizedEvent.end_time;
        const location = normalizedEvent.location;
        const status = normalizedEvent.status;
        const approvalStatus = normalizedEvent.approval_status;
        const eventId = normalizedEvent.id;
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <img src="${poster}" 
                     alt="${title}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"
                     onerror="this.src='https://via.placeholder.com/50x50?text=No+Img'">
            </td>
            <td>${title}</td>
            <td>${formatDate(startDate)} - ${formatDate(endDate)}</td>
            <td>${startTime} - ${endTime}</td>
            <td>${location}</td>
            <td>
                <span class="status-badge ${status === 'Aktif' ? 'status-active' : 'status-inactive'}">
                    ${status}
                </span>
            </td>
            <td>
                <span class="approval-badge ${getApprovalClass(approvalStatus)}">
                    ${approvalStatus}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editEvent(${eventId})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteEvent(${eventId})" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${getApprovalButtons(eventId, approvalStatus)}
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// NORMALIZE EVENT DATA - handle semua field names
function normalizeEventData(event) {
    if (!event) return null;
    
    console.log('🔍 Normalizing event:', event);
    
    return {
        id: event.id || event.eventId || Date.now(),
        title: event.title || event.titleEvent || event.nama_event || "Judul Event",
        description: event.description || event.deskripsi || event.desc || "",
        start_date: event.start_date || event.startDate || event.tanggal_mulai,
        end_date: event.end_date || event.endDate || event.tanggal_selesai,
        start_time: event.start_time || event.startTime || event.waktu_mulai || "00:00",
        end_time: event.end_time || event.endTime || event.waktu_selesai || "23:59",
        location: event.location || event.lokasi || event.tempat || "Lokasi tidak tersedia",
        poster_url: event.poster_url || event.poster || event.gambar || event.image || 'https://via.placeholder.com/300x200?text=Event+Poster',
        status: normalizeStatus(event.status || event.status_event),
        approval_status: event.approval_status || event.approval || event.status_persetujuan || "Menunggu"
    };
}

function normalizeStatus(status) {
    if (!status) return 'Aktif';
    const statusStr = String(status).toLowerCase();
    if (statusStr === 'aktif' || statusStr === 'active') return 'Aktif';
    if (statusStr === 'nonaktif' || statusStr === 'inactive' || statusStr === 'nonactive') return 'Nonaktif';
    return status;
}

function getApprovalClass(approvalStatus) {
    switch(approvalStatus) {
        case 'Disetujui': return 'approval-approved';
        case 'Ditolak': return 'approval-rejected';
        default: return 'approval-pending';
    }
}

function getApprovalButtons(eventId, approvalStatus) {
    if (approvalStatus === 'Menunggu') {
        return `
            <button class="btn-approve" onclick="approveEvent(${eventId})" title="Setujui">
                <i class="fas fa-check"></i>
            </button>
            <button class="btn-reject" onclick="rejectEvent(${eventId})" title="Tolak">
                <i class="fas fa-times"></i>
            </button>
        `;
    }
    return '';
}

// SEARCH FUNCTIONALITY
function searchEvents() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    const tableRows = document.querySelectorAll("#eventTable tr");
    
    tableRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) return; // Skip header/empty rows
        
        const title = cells[2]?.textContent.toLowerCase() || '';
        const location = cells[5]?.textContent.toLowerCase() || '';
        
        const match = title.includes(searchTerm) || location.includes(searchTerm);
        row.style.display = match ? '' : 'none';
    });
}

// CRUD OPERATIONS
async function editEvent(eventId) {
    try {
        let event = null;
        
        try {
            const response = await fetch(`api_events.php?id=${eventId}`);
            if (response.ok) {
                event = await response.json();
            } else {
                throw new Error('API failed');
            }
        } catch (apiError) {
            const events = JSON.parse(localStorage.getItem("events")) || [];
            event = events.find(ev => ev.id == eventId);
        }
        
        if (event) {
            // Redirect to edit page or open modal
            localStorage.setItem("selectedEventId", eventId);
            window.location.href = "adminadd.html?edit=" + eventId;
        } else {
            alert('Event tidak ditemukan');
        }
    } catch (error) {
        console.error('Error loading event for edit:', error);
        alert('Gagal memuat data event untuk edit');
    }
}

async function deleteEvent(eventId) {
    if (!confirm("Apakah Anda yakin ingin menghapus event ini?")) {
        return;
    }

    try {
        let result = { success: false };
        
        try {
            const response = await fetch('api_events.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: eventId })
            });
            
            if (response.ok) {
                result = await response.json();
            } else {
                throw new Error('API failed');
            }
        } catch (apiError) {
            result = deleteEventFromLocalStorage(eventId);
        }
        
        if (result.success) {
            alert("Event berhasil dihapus!");
            loadEvents();
        } else {
            throw new Error(result.error || 'Gagal menghapus event');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Gagal menghapus event: ' + error.message);
    }
}

async function approveEvent(eventId) {
    await updateEventApproval(eventId, "Disetujui", "Event disetujui!");
}

async function rejectEvent(eventId) {
    await updateEventApproval(eventId, "Ditolak", "Event ditolak!");
}

async function updateEventApproval(eventId, status, successMessage) {
    try {
        let event = null;
        
        try {
            const response = await fetch(`api_events.php?id=${eventId}`);
            if (response.ok) {
                event = await response.json();
            } else {
                throw new Error('API failed');
            }
        } catch (apiError) {
            const events = JSON.parse(localStorage.getItem("events")) || [];
            event = events.find(ev => ev.id == eventId);
        }
        
        if (!event) {
            alert('Event tidak ditemukan');
            return;
        }

        const normalizedEvent = normalizeEventData(event);
        const updatedEvent = {
            ...normalizedEvent,
            approval_status: status
        };

        let result = { success: false };
        
        try {
            const response = await fetch('api_events.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEvent)
            });
            
            if (response.ok) {
                result = await response.json();
            } else {
                throw new Error('API failed');
            }
        } catch (apiError) {
            result = updateEventInLocalStorage(updatedEvent);
        }
        
        if (result.success) {
            alert(successMessage);
            loadEvents();
        } else {
            throw new Error('Gagal mengupdate status persetujuan');
        }
    } catch (error) {
        console.error('Error updating approval:', error);
        alert('Gagal mengupdate status persetujuan');
    }
}

// LOCALSTORAGE HELPERS
function updateEventInLocalStorage(eventData) {
    try {
        let events = JSON.parse(localStorage.getItem("events")) || [];
        const index = events.findIndex(ev => ev.id == eventData.id);

        const updatedEvent = {
            ...(index !== -1 ? events[index] : {}),
            id: eventData.id,
            title: eventData.title,
            titleEvent: eventData.title,
            description: eventData.description,
            start_date: eventData.start_date,
            startDate: eventData.start_date,
            end_date: eventData.end_date,
            endDate: eventData.end_date,
            start_time: eventData.start_time,
            startTime: eventData.start_time,
            end_time: eventData.end_time,
            endTime: eventData.end_time,
            location: eventData.location,
            poster_url: eventData.poster_url,
            poster: eventData.poster_url,
            status: eventData.status,
            approval_status: eventData.approval_status || "Menunggu",
            approval: eventData.approval_status || "Menunggu",
            updated_at: new Date().toISOString()
        };

        if (index !== -1) {
            events[index] = updatedEvent;
        } else {
            updatedEvent.id = updatedEvent.id || Date.now();
            updatedEvent.created_at = new Date().toISOString();
            events.push(updatedEvent);
        }

        localStorage.setItem("events", JSON.stringify(events));
        loadEvents();
        
        return { success: true };
    } catch (error) {
        console.error('Error updating event in localStorage:', error);
        return { success: false, error: error.message };
    }
}

function deleteEventFromLocalStorage(eventId) {
    try {
        let events = JSON.parse(localStorage.getItem("events")) || [];
        events = events.filter(event => event.id != eventId);
        localStorage.setItem("events", JSON.stringify(events));
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting event from localStorage:', error);
        return { success: false, error: error.message };
    }
}

// UTILITY FUNCTIONS
function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (error) {
        return '-';
    }
}

// DEBUG FUNCTION
function debugEvents() {
    console.log('=== DEBUG EVENTS ===');
    const events = JSON.parse(localStorage.getItem("events") || '[]');
    console.log('Total events:', events.length);
    events.forEach((event, index) => {
        console.log(`Event ${index + 1}:`, {
            id: event.id,
            title: event.title,
            titleEvent: event.titleEvent,
            approval_status: event.approval_status,
            approval: event.approval,
            status: event.status
        });
    });
    return events;
}

// Auto debug on load
setTimeout(() => {
    debugEvents();
}, 1000);