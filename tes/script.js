let events = [
    {
        id: 1,
        title: "Seminar Teknologi 2023",
        description: "Seminar tentang perkembangan AI di kampus.",
        date: "2025-10-15",
        location: "Auditorium Utama",
        organizer: "Himpunan Mahasiswa TI"
    },
    {
        id: 2,
        title: "Lomba Desain Poster",
        description: "Kompetisi desain untuk mahasiswa seni.",
        date: "2025-11-20",
        location: "Ruang Seni",
        organizer: "UKM Seni"
    }
];

function renderEvents(containerId, isAdmin = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <h3>${event.title}</h3>
            <p><strong>Tanggal:</strong> ${event.date}</p>
            <p><strong>Lokasi:</strong> ${event.location}</p>
            <p><strong>Penyelenggara:</strong> ${event.organizer}</p>
            <p>${event.description}</p>
            ${isAdmin ? `
                <button class="btn" onclick="editEvent(${event.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteEvent(${event.id})">Hapus</button>
            ` : ''}
            ${!isAdmin ? `<a href="event-detail.html?id=${event.id}" class="btn">Detail</a>` : ''}
        `;
        container.appendChild(card);
    });
}

function loadEventDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    const event = events.find(e => e.id === id);
    if (event) {
        document.getElementById('event-title').textContent = event.title;
        document.getElementById('event-desc').textContent = event.description;
        document.getElementById('event-date').textContent = event.date;
        document.getElementById('event-location').textContent = event.location;
        document.getElementById('event-organizer').textContent = event.organizer;
    } else {
        document.getElementById('event-detail').innerHTML = '<p>Event tidak ditemukan.</p>';
    }
}

// Fungsi login admin sederhana (simulasi, username: admin, password: 123)
function loginAdmin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'admin' && password === '1234') {
        localStorage.setItem('isAdmin', 'true');
        window.location.href = 'admin-events.html';
    } else {
        alert('Login gagal!');
    }
}

// Fungsi hapus event
function deleteEvent(id) {
    if (confirm('Yakin hapus event ini?')) {
        events = events.filter(e => e.id !== id);
        renderEvents('events-container', true); // Refresh daftar
        alert('Event dihapus!');
    }
}

// Fungsi edit event (buka form edit di dashboard)
function editEvent(id) {
    const event = events.find(e => e.id === id);
    if (event) {
        document.getElementById('edit-id').value = event.id;
        document.getElementById('edit-title').value = event.title;
        document.getElementById('edit-desc').value = event.description;
        document.getElementById('edit-date').value = event.date;
        document.getElementById('edit-location').value = event.location;
        document.getElementById('edit-organizer').value = event.organizer;
        document.getElementById('edit-form').classList.remove('hidden');
    }
}

// Fungsi simpan edit
function saveEdit() {
    const id = parseInt(document.getElementById('edit-id').value);
    const event = events.find(e => e.id === id);
    if (event) {
        event.title = document.getElementById('edit-title').value;
        event.description = document.getElementById('edit-desc').value;
        event.date = document.getElementById('edit-date').value;
        event.location = document.getElementById('edit-location').value;
        event.organizer = document.getElementById('edit-organizer').value;
        renderEvents('events-container', true);
        document.getElementById('edit-form').classList.add('hidden');
        alert('Event diupdate!');
    }
}

function addEvent() {
    const title = document.getElementById('add-title').value;
    const desc = document.getElementById('add-desc').value;
    const date = document.getElementById('add-date').value;
    const location = document.getElementById('add-location').value;
    const organizer = document.getElementById('add-organizer').value;
    
    if (title && desc && date && location && organizer) {
        const newEvent = {
            id: events.length + 1,
            title, description: desc, date, location, organizer
        };
        events.push(newEvent);
        alert('Event ditambahkan!');
        document.getElementById('add-form').reset();
        window.location.href = 'admin-events.html'; // Kembali ke daftar
    } else {
        alert('Semua field harus diisi!');
    }
}

function validateForm(formId) {
    const form = document.getElementById(formId);
    if (form.checkValidity()) {
        return true;
    } else {
        form.reportValidity();
        return false;
    }
}

function checkAdminLogin() {
    if (localStorage.getItem('isAdmin') !== 'true') {
        window.location.href = 'admin-login.html';
    }
}

function logout() {
    localStorage.removeItem('isAdmin');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'events.html') {
        renderEvents('events-container');
    } else if (currentPage === 'event-detail.html') {
        loadEventDetail();
    } else if (currentPage.includes('admin-') && currentPage !== 'admin-login.html') {
        checkAdminLogin();
        if (currentPage === 'admin-events.html') {
            renderEvents('events-container', true);
        }
    }
});