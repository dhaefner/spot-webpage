function normalizeDate(rawDate, fallback = '20250101') {
    rawDate = (rawDate || '').toString().trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        return rawDate.replace(/-/g, '');
    }
    if (/^\d{8}$/.test(rawDate)) {
        return rawDate;
    }
    if (rawDate) {
        const digs = rawDate.replace(/[^0-9]/g, '');
        return (digs + '00000000').slice(0, 8);
    }
    return fallback;
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() +1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
}

function setDateLimits() {
    const input = document.getElementById("dateInput");
    if (!input) return;

    const now = new Date();

    const minDate = new Date(2024, 0, 1); // January 1, 2024
    const maxDate = new Date();
    if (now.getHours() >= 12) {
        maxDate.setDate(maxDate.getDate() + 1);
    }
    
    input.min = formatDate(minDate);
    input.max = formatDate(maxDate);
}

function getCustomDate() {
    const now = new Date();

    if (now.getHours() >= 12) {
        now.setDate(now.getDate() +1);
    }

    const year = now.getFullYear();
    const month = now.getMonth() +1;
    const day = now.getDate();
    return year * 10000 + month * 100 + day;
}

function previousYearDate(rawDate) {
    const normalized = normalizeDate(rawDate);
    const year = parseInt(normalized.substring(0, 4));
    const month = normalized.substring(4, 6);
    const day = normalized.substring(6, 8);
    return `${year - 1}${month}${day}`;
}

export { normalizeDate, formatDate, setDateLimits, getCustomDate, previousYearDate }