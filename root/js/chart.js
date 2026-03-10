let currentTitleDate = null; // storing it to be available on re-run of loadTitleData for Translation

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
    const date = String(dateInput);
    try {
        let displayDate = '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const year = date.substring(0, 4);
            const month = date.substring(5, 7);
            const day = date.substring(8, 10);

            console.log("Year:", year, "Month:", month, "Day:", day);

            displayDate = `${day}.${month}.${year}`;
        }
        if (/^\d{8}$/.test(date)) {
            const year = date.substring(0, 4);
            const month = date.substring(4, 6);
            const day = date.substring(6, 8);

            console.log("Year:", year, "Month:", month, "Day:", day);

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
    if (!chartTitle) return;

    currentTitleDate = inputDate; // store for re-use on translation change

    if (inputDate != null) {
        console.log("Loading title data for input date:", inputDate);
        let displayDate = parseDateDisplay(inputDate);
        console.log("Display date:", displayDate);
        chartTitle.textContent = t("diagramHeader", {date: displayDate});
    } else {
        /* Dead tree*/
        chartTitle.textContent = t("diagramHeaderEscape");
    }
}

function updateChartTitleTranslation() {
    if (currentTitleDate !== null) {
        loadTitleData(currentTitleDate);
    }
}

window.updateChartTitleTranslation = updateChartTitleTranslation;

export { loadTitleData }
