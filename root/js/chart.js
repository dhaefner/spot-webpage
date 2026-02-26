
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
    console.log("Attempting to parse date display for input:", dateInput);
    try {
        let displayDate = '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            let year = dateInput.substring(0, 4);
            let month = dateInput.substring(5, 6);
            let day = dateInput.substring(6, 8);
            displayDate = `${day}.${month}.${year}`;
        }
        return displayDate;
    } catch (err) {
        console.error('Error parsing date display:', err);
        alert('Error parsing date display: ' + err.message);
    }
}

function loadTitleData(inputDate = 20250101) {
    const chartTitle = document.getElementById("chartTitle");

    if (inputDate != null) {
        console.log("Loading title data for input date:", inputDate);
        let displayDate = parseDateDisplay(inputDate);
        console.log("Display date:", displayDate);
        chartTitle.textContent = "Diagram for " + displayDate;
    } else {
        /* Dead tree*/
        chartTitle.textContent = "Diagram for unknown date";
    }
}
export { loadTitleData }