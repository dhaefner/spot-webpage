
function parseDate(dateInput) {
    try {
        const rawDate = (document.getElementById(dateInput).value || '').toString().trim();
        let apiDate = '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
            apiDate = rawDate.replace(/-/g, '');
        } else  if (/^\d{8}$/.test(rawDate)) {
            apiDate = rawDate;
        } else if (rawDate) {
            const digs = rawDate.replace(/[^0-9]/g, '');
            apiDate = (digs + '00000000').slice(0, 8);
        } else {
            apiDate = '20250101'
        }
        return apiDate;
    } catch (err) {
        console.error('Error parsing date:', err);
        alert('Error parsing date: ' + err.message);
    }
}

function parseDateDisplay(dateInput) {
    const rawDate = (document.getElementById(dateInput).value || '').toString().trim();
    let displayDate = '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        let year = rawDate.substring(0, 4);
        let month = rawDate.substring(5, 7);
        let day = rawDate.substring(8, 10);
        displayDate = `${day}.${month}.${year}`;
    }
    return displayDate;
}

function loadTitleData() {
    const dateValue = document.getElementById("dateInput").value;
    const chartTitle = document.getElementById("chartTitle");

    if (dateValue) {
        chartTitle.textContent = "Diagram for " + parseDateDisplay("dateInput");
    } else {
        chartTitle.textContent = "Diagram for 01.01.2025"
    }
}
export { loadTitleData }