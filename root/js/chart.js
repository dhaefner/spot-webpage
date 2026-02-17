
document.getElementById('loadData').addEventListener('click', async() => {
    const date = parseDate("dateInput")

    const response = await fetch(`https://api.e-spotmarkt.de/data?date=${date}`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()

    updateChart(data)
});

function updateChart(data) {
    const ctx = document.getElementById('chart').getContext('2d')
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Werte',
                data: data.values,
                borderColor: 'blue'
            }]
        }
    });
}

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
        chartTitle.textContent = "Diagramm für " + parseDateDisplay("dateInput");
    } else {
        chartTitle.textContent = "Diagramm"
    }
}

function updateTitle() {
    const dateValue = document.getElementById("dateInput").value;
    document.getElementById("chartTitle").textContent =
        dateValue ? "Diagramm für " + dateValue : "Diagramm"
}