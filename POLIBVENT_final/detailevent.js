// Konfigurasi
const API_BASE_URL = 'api_events.php';
let currentEvent = null;

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showLoading(text = "Memproses...") {
  const overlay = document.getElementById("loadingOverlay");
  const textEl = document.getElementById("loadingText");
  if (textEl) textEl.textContent = text;
  if (overlay) overlay.classList.add("active");
}

function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.remove("active");
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTimeForDisplay(timeStr) {
  if (!timeStr) return '00:00';
  // if HH:MM:SS -> return HH:MM
  if (timeStr.includes(':') && timeStr.split(':').length === 3) {
    return timeStr.substring(0,5);
  }
  return timeStr;
}

function formatTimeForInput(timeStr) {
  if (!timeStr) return '';
  if (timeStr.includes(':') && timeStr.split(':').length === 3) {
    return timeStr.substring(0,5);
  }
  return timeStr;
}

function normalizeTime(timeStr) {
  if (!timeStr || timeStr === 'null' || timeStr === 'undefined' || timeStr === '') return '00:00';
  if (typeof timeStr !== 'string') timeStr = String(timeStr);

  if (timeStr.includes(':') && timeStr.split(':').length === 3) {
    const [h, m] = timeStr.split(':');
    const hh = String(Math.max(0, Math.min(23, parseInt(h) || 0))).padStart(2,'0');
    const mm = String(Math.max(0, Math.min(59, parseInt(m) || 0))).padStart(2,'0');
    return `${hh}:${mm}`;
  }

  // If contains 2 parts -> HH:MM
  if (timeStr.includes(':')) {
    const [h, m] = timeStr.split(':');
    const hh = String(Math.max(0, Math.min(23, parseInt(h) || 0))).padStart(2,'0');
    const mm = String(Math.max(0, Math.min(59, parseInt(m) || 0))).padStart(2,'0');
    return `${hh}:${mm}`;
  }

  // fallback
  return '00:00';
}

function normalizeStatus(status) {
  if (!status) return 'Aktif';
  const map = {
    'altif': 'Aktif', 'active': 'Aktif', 'aktif': 'Aktif',
    'nonactive': 'Nonaktif', 'inactive': 'Nonaktif', 'nonaktif': 'Nonaktif',
    'pending': 'Aktif', 'approved': 'Aktif', 'rejected': 'Nonaktif'
  };
  return map[String(status).toLowerCase()] || status;
}

function normalizeEventData(ev) {
  if (!ev) return null;
  return {
    ...ev,
    start_time: normalizeTime(ev.start_time),
    end_time: normalizeTime(ev.end_time),
    status: normalizeStatus(ev.status),
    poster_url: ev.poster_url || ev.poster || null,
    title: ev.title || ev.titleEvent || 'Judul tidak tersedia',
    description: ev.description || ev.desc || ev.description || 'Deskripsi tidak tersedia',
    location: ev.location || 'Lokasi belum diisi'
  };
}

// Extract JSON substring from server response (handle stray chars)
function extractJson(text) {
  if (!text) return null;
  text = text.trim();
  const firstBrace = Math.min(
    ...( ['{','['].map(c => {
      const idx = text.indexOf(c);
      return idx === -1 ? Infinity : idx;
    }) )
  );
  if (firstBrace === Infinity) return null;
  try {
    return JSON.parse(text.substring(firstBrace));
  } catch (e) {
    // Try more naive: remove HTML tags then search for JSON-like substring
    const withoutHtml = text.replace(/<[^>]*>/g, ' ');
    const idx = withoutHtml.indexOf('{');
    if (idx === -1) return null;
    try {
      return JSON.parse(withoutHtml.substring(idx));
    } catch (e2) {
      return null;
    }
  }
}

// -----------------------------
// FUNGSI VALIDASI FILE
// -----------------------------
function validateFileSize(fileInput) {
  const file = fileInput.files[0];
  const errorElementId = fileInput.id + 'SizeError';
  const errorElement = document.getElementById(errorElementId);
  
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

// -----------------------------
// DISPLAY EVENT DATA
// -----------------------------
function displayEventData(ev) {
  if (!ev) {
    alert("❌ Data event tidak valid.");
    return;
  }

  const e = normalizeEventData(ev);
  currentEvent = e;

  const titleEl = document.getElementById("eventTitle");
  const dateEl = document.getElementById("eventDate");
  const timeEl = document.getElementById("eventTime");
  const locEl = document.getElementById("eventLocation");
  const statusEl = document.getElementById("eventStatus");
  const descEl = document.getElementById("eventDescription");
  const posterImg = document.getElementById("eventPoster");

  if (titleEl) titleEl.textContent = e.title;
  if (dateEl) dateEl.textContent = `${ formatDate(e.start_date) } - ${ formatDate(e.end_date) }`;
  if (timeEl) timeEl.textContent = `${ formatTimeForDisplay(e.start_time) } - ${ formatTimeForDisplay(e.end_time) }`;
  if (locEl) locEl.textContent = e.location;
  if (statusEl) statusEl.textContent = e.status;
  
  // PERUBAHAN: Agar link bisa diklik
  if (descEl) {
    // Ubah URL dalam teks menjadi link
    const textWithLinks = e.description.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" style="color: blue; text-decoration: underline;">$1</a>'
    );
    descEl.innerHTML = textWithLinks;
  }

  if (posterImg) {
    if (e.poster_url && e.poster_url !== 'null' && e.poster_url !== 'undefined') {
      posterImg.src = e.poster_url;
      posterImg.alt = `Poster ${e.title}`;
      posterImg.onerror = function() {
        this.src = 'picture/default.jpg';
        this.alt = 'Poster default';
      };
    } else {
      posterImg.src = 'picture/default.jpg';
      posterImg.alt = 'Poster default';
    }
  }

  hideLoading();
}

// -----------------------------
// LOAD DATA (API) + LOCALSTORAGE FALLBACK
// -----------------------------
async function loadEventData(selectedId) {
  showLoading("Memuat data event...");
  
  try {
    const res = await fetch(`${API_BASE_URL}?id=${encodeURIComponent(selectedId)}`, { cache: 'no-store' });
    const text = await res.text();

    // Try parse tolerant JSON
    const parsed = extractJson(text);
    if (!parsed || !parsed.id) {
      throw new Error("Response server tidak berisi data event valid.");
    }
    displayEventData(parsed);
    return parsed;
  } catch (err) {
    console.warn('Load from API failed, trying localStorage. Err:', err);
    // Fallback to localStorage
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const ev = events.find(x => String(x.id) === String(selectedId));
    if (ev) {
      displayEventData(ev);
      return ev;
    } else {
      alert("❌ Gagal memuat event dari server dan localStorage.");
      throw err;
    }
  }
}

// -----------------------------
// EDIT MODAL, POPULATE, VALIDATION
// -----------------------------
function initializeEditModal() {
  const editBtn = document.getElementById("editEventBtn");
  const modal = document.getElementById("editEventModal");
  const cancelBtn = document.getElementById("cancelEditEvent");
  const form = document.getElementById("editEventForm");
  const posterInput = document.getElementById("editPoster");

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      if (!currentEvent) {
        alert("❌ Data event belum dimuat. Refresh halaman.");
        return;
      }
      populateEditForm(currentEvent);
      modal.style.display = 'flex';
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      if (form) form.reset();
      const preview = document.getElementById("editPosterPreview");
      if (preview) preview.style.display = 'none';
      // Reset error messages
      const errorElement = document.getElementById("editPosterSizeError");
      if (errorElement) errorElement.style.display = 'none';
    });
  }

  // Close when click outside
  window.addEventListener('click', (evt) => {
    if (evt.target === modal) {
      modal.style.display = 'none';
      if (form) form.reset();
      const preview = document.getElementById("editPosterPreview");
      if (preview) preview.style.display = 'none';
      // Reset error messages
      const errorElement = document.getElementById("editPosterSizeError");
      if (errorElement) errorElement.style.display = 'none';
    }
  });

  // Poster preview & client validation
  if (posterInput) {
    posterInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const preview = document.getElementById("editPosterPreview");
      const errEl = document.getElementById("editPosterError");
      const sizeErrEl = document.getElementById("editPosterSizeError");
      
      // Reset error messages
      if (errEl) errEl.textContent = '';
      if (sizeErrEl) sizeErrEl.style.display = 'none';
      
      if (!file) {
        if (preview) { preview.style.display = 'none'; preview.src = ''; }
        return;
      }
      
      // Validasi file size
      if (!validateFileSize(posterInput)) {
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(evt) {
        if (preview) { preview.src = evt.target.result; preview.style.display = 'block'; }
      };
      reader.readAsDataURL(file);
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleEditEventForm();
    });
  }

  // Setup simple validation listeners
  const startDate = document.getElementById('editStartDate');
  const endDate = document.getElementById('editEndDate');
  const startTime = document.getElementById('editStartTime');
  const endTime = document.getElementById('editEndTime');

  if (startDate && endDate) {
    startDate.addEventListener('change', validateDates);
    endDate.addEventListener('change', validateDates);
  }
  if (startTime && endTime) {
    startTime.addEventListener('change', validateTimes);
    endTime.addEventListener('change', validateTimes);
  }
}

function populateEditForm(ev) {
  if (!ev) return;
  const e = normalizeEventData(ev);

  const idEl = document.getElementById("editEventId");
  const titleEl = document.getElementById("editTitle");
  const startDateEl = document.getElementById("editStartDate");
  const endDateEl = document.getElementById("editEndDate");
  const startTimeEl = document.getElementById("editStartTime");
  const endTimeEl = document.getElementById("editEndTime");
  const locationEl = document.getElementById("editLocation");
  const descEl = document.getElementById("editDescription");
  const statusEl = document.getElementById("editStatus");
  const posterPreview = document.getElementById("editPosterPreview");

  if (idEl) idEl.value = e.id || '';
  if (titleEl) titleEl.value = e.title || '';
  if (startDateEl) startDateEl.value = e.start_date || '';
  if (endDateEl) endDateEl.value = e.end_date || '';
  if (startTimeEl) startTimeEl.value = formatTimeForInput(e.start_time) || '';
  if (endTimeEl) endTimeEl.value = formatTimeForInput(e.end_time) || '';
  if (locationEl) locationEl.value = e.location || '';
  if (descEl) descEl.value = e.description || '';
  if (statusEl) statusEl.value = e.status || 'Aktif';

  if (posterPreview) {
    const url = e.poster_url;
    if (url && url !== 'null' && url !== 'undefined') {
      posterPreview.src = url;
      posterPreview.style.display = 'block';
    } else {
      posterPreview.style.display = 'none';
      posterPreview.src = '';
    }
  }
}

function validateDates() {
  const start = document.getElementById('editStartDate');
  const end = document.getElementById('editEndDate');
  const err = document.getElementById('editEndDateError');
  if (!start || !end || !err) return true;
  if (start.value && end.value) {
    if (new Date(end.value) < new Date(start.value)) {
      err.textContent = 'Tanggal selesai tidak boleh sebelum tanggal mulai.';
      return false;
    } else {
      err.textContent = '';
      return true;
    }
  }
  err.textContent = '';
  return true;
}

function validateTimes() {
  const sd = document.getElementById('editStartDate');
  const ed = document.getElementById('editEndDate');
  const st = document.getElementById('editStartTime');
  const et = document.getElementById('editEndTime');
  const err = document.getElementById('editEndTimeError');
  if (!sd || !ed || !st || !et || !err) return true;
  if (sd.value && ed.value && st.value && et.value) {
    const startDT = new Date(`${sd.value}T${st.value}`);
    const endDT = new Date(`${ed.value}T${et.value}`);
    if (endDT <= startDT) {
      err.textContent = 'Waktu selesai harus setelah waktu mulai.';
      return false;
    } else {
      err.textContent = '';
      return true;
    }
  }
  err.textContent = '';
  return true;
}

function validateEditForm() {
  let ok = true;
  const required = [
    {id:'editTitle', name:'Judul'},
    {id:'editStartDate', name:'Tanggal mulai'},
    {id:'editEndDate', name:'Tanggal selesai'},
    {id:'editStartTime', name:'Waktu mulai'},
    {id:'editEndTime', name:'Waktu selesai'},
    {id:'editLocation', name:'Lokasi'},
    {id:'editDescription', name:'Deskripsi'}
  ];
  required.forEach(f => {
    const el = document.getElementById(f.id);
    const err = document.getElementById(f.id + 'Error');
    if (!el || !err) return;
    if (!String(el.value || '').trim()) {
      err.textContent = `${f.name} harus diisi.`;
      ok = false;
    } else {
      err.textContent = '';
    }
  });

  if (!validateDates()) ok = false;
  if (!validateTimes()) ok = false;
  return ok;
}

// -----------------------------
// IMAGE HELPERS (kompresi ringan & base64)
// -----------------------------
function compressImage(file, maxWidth=800, maxHeight=600, quality=0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Gagal membuat blob.'));
          return;
        }
        const newFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
        resolve(newFile);
      }, 'image/jpeg', quality);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function toBase64(file) {
  return new Promise(async (resolve, reject) => {
    try {
      const MAX_SIZE = 500 * 1024;
      let useFile = file;
      if (file.size > MAX_SIZE) {
        try {
          useFile = await compressImage(file);
        } catch (e) {
          useFile = file; // fallback
        }
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(useFile);
    } catch (e) {
      reject(e);
    }
  });
}

// -----------------------------
// HANDLE SUBMIT (EDIT) + PUT
// -----------------------------
async function handleEditEventForm() {
  if (!validateEditForm()) {
    alert("❌ Harap isi semua field yang wajib diisi dengan benar.");
    return;
  }

  // Validasi file size sebelum submit
  const posterInput = document.getElementById('editPoster');
  if (posterInput.files[0] && !validateFileSize(posterInput)) {
    alert("❌ File poster tidak valid. Pastikan ukuran dan format sesuai.");
    return;
  }

  const submitBtn = document.querySelector('#editEventForm .btn-submit') || document.querySelector('#submitEditBtn');
  const originalText = submitBtn ? submitBtn.innerHTML : null;
  if (submitBtn) { 
    submitBtn.disabled = true; 
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...'; 
  }

  try {
    const form = document.getElementById('editEventForm');
    const fd = new FormData(form);

    let posterData = currentEvent.poster_url || currentEvent.poster || null;
    const posterFile = fd.get('poster');
    if (posterFile && posterFile.size && posterFile.size > 0) {
      posterData = await toBase64(posterFile);
    }

    const updatedEvent = {
      id: parseInt(fd.get('id') || currentEvent.id),
      title: String(fd.get('title') || '').trim(),
      description: String(fd.get('description') || '').trim(),
      start_date: fd.get('start_date'),
      end_date: fd.get('end_date'),
      start_time: (fd.get('start_time') ? fd.get('start_time') + ':00' : '00:00:00'),
      end_time: (fd.get('end_time') ? fd.get('end_time') + ':00' : '23:59:00'),
      location: String(fd.get('location') || '').trim(),
      status: fd.get('status') || currentEvent.status,
      poster_url: posterData,
      approval_status: "Menunggu" // RESET STATUS PERSETUJUAN SETELAH EDIT
    };

    // Kirim ke server (PUT)
    const res = await fetch(API_BASE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent)
    });
    const text = await res.text();

    const parsed = extractJson(text);
    if (!parsed) {
      // Jika server tidak mengembalikan JSON, coba update di localStorage sebagai fallback
      updateEventInLocalStorage(updatedEvent);
      await loadEventData(updatedEvent.id);
      alert("✅ Event berhasil diperbarui! Status persetujuan direset ke 'Menunggu'.");
    } else {
      if (parsed.success) {
        // Update sukses di server -> reload data dari server untuk sinkron
        await loadEventData(updatedEvent.id);
        alert("✅ Data event berhasil diperbarui! Menunggu persetujuan admin.");
      } else {
        throw new Error(parsed.message || 'Server menolak update.');
      }
    }

    // Tutup modal & reset
    setTimeout(() => {
      const modal = document.getElementById('editEventModal');
      if (modal) modal.style.display = 'none';
      if (form) form.reset();
      const preview = document.getElementById('editPosterPreview');
      if (preview) preview.style.display = 'none';
    }, 500);

  } catch (err) {
    alert("❌ Gagal mengupdate event: " + err.message);
    console.error('Update error:', err);
  } finally {
    if (submitBtn) { 
      submitBtn.disabled = false; 
      if (originalText) submitBtn.innerHTML = originalText; 
    }
  }
}

// -----------------------------
// localStorage update helper
// -----------------------------
function updateEventInLocalStorage(eventData) {
  try {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const idx = events.findIndex(x => String(x.id) === String(eventData.id));
    const normalized = {
      id: eventData.id,
      title: eventData.title,
      poster: eventData.poster_url || eventData.poster || null,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      location: eventData.location,
      description: eventData.description,
      status: eventData.status,
      approval_status: "Menunggu", // Reset status persetujuan
      updated_at: new Date().toISOString()
    };
    if (idx !== -1) {
      events[idx] = { ...events[idx], ...normalized };
    } else {
      events.push(normalized);
    }
    localStorage.setItem('events', JSON.stringify(events));
    return true;
  } catch (e) {
    console.warn('localStorage update failed', e);
    return false;
  }
}

// -----------------------------
// INIT
// -----------------------------
document.addEventListener('DOMContentLoaded', async () => {
  const selectedId = localStorage.getItem('selectedEventId');
  initializeEditModal();

  if (!selectedId) {
    alert("❌ Tidak ada event yang dipilih.");
    return;
  }

  try {
    await loadEventData(selectedId);
  } catch (e) {
    console.error('Init load error:', e);
  }
});