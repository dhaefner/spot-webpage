
function parseDate(dateInput) {
    try {
        let apiDate = '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            apiDate = dateInput.replace(/-/g, '');
        } else  if (/^\d{8}$/.test(dateInput)) {
            apiDate = dateInput;
        } else if (dateInput) {
            const digs = dateInput.replace(/[^0-9]/g, '');
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

function loadTitleData(inputDate = 20250101) {
    const chartTitle = document.getElementById("chartTitle");

    if (inputDate) {
        console.log("Loading title data for input date:", inputDate);
        chartTitle.textContent = "Diagram for " + parseDateDisplay(inputDate);
    } else {
        /* Dead tree*/
        chartTitle.textContent = "Diagram for unknown date";
    }
}
export { loadTitleData }