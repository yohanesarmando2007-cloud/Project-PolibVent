function updateEventInLocalStorage(eventData) {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    const index = events.findIndex(ev => ev.id == eventData.id);

    if (index !== -1) {
        events[index] = {
            ...events[index],
            id: eventData.id,
            titleEvent: eventData.title,
            poster: eventData.poster_url,
            startDate: eventData.start_date,
            endDate: eventData.end_date,
            startTime: eventData.start_time,
            endTime: eventData.end_time,
            location: eventData.location,
            description: eventData.description,
            status: eventData.status,
            approval: eventData.approval_status,
            // Keep database fields for compatibility
            title: eventData.title,
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            start_time: eventData.start_time,
            end_time: eventData.end_time,
            poster_url: eventData.poster_url,
            approval_status: eventData.approval_status || "Menunggu" // Pastikan ada status persetujuan
        };

        localStorage.setItem("events", JSON.stringify(events));
        editModal.style.display = "none";
        loadEvents();
        alert("Event berhasil diupdate (offline mode)! Status persetujuan: " + eventData.approval_status);
    }
}