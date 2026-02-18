/* api-client.js */
import { loadTitleData } from './chart.js';

let stromChart = null

const API_BASE = "https://api.e-spotmarkt.de"

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

function parsePriceArray(arr) {
    if (!Array.isArray(arr)) return [];

    return arr.map(o => {
        let raw = null;
        if (o.preis != null) raw = o.preis;
        else if (o.Price_Amount != null) raw = o.Price_Amount;
        else if (o.price != null) raw = o.price;
        else if (o.value != null) raw = o.value;

        if (raw == null) return NaN;

        if (typeof raw === 'string') {
            raw = raw.replace(/, /g, '.').replace(/[^0-9.\-+eE]/g, '');
        }
        return Number(raw);
    });
}

function movingAverage(values, window = 5) {
    const n = values.length;
    const out = new Array(n).fill(NaN);

    for (let i = 0; i < n; i++) {
        let sum = 0, cnt = 0;

        for (let k = i - Math.floor(window / 2); k <= i + Math.floor(window / 2); k++) {
            if (k >= 0 && k < n && Number.isFinite(values[k])) {
                sum += values[k];
                cnt++;
            }
        }
        if (cnt > 0) {
            out[i] = sum / cnt;
        }
    }
    return out;
}

function makeShifted(values, shift) {
    const len = values.length;
    const out = new Array(len).fill(NaN);
    
    for (let i = 0; i < len; i++) {
        const j = i + shift;
        if (j >= 0 && j < len) {
            out[i] = Number.isFinite(values[j]) ? values[j] : NaN;
        }
    }
    return out;
}

function addDataset(label, dataArray, color) {
    if (!stromChart) return;

    const len = stromChart.data.labels.length;
    let data;

    if (!Array.isArray(dataArray)) {
        data = new Array(len).fill(
            Number.isFinite(dataArray) ? dataArray : NaN
        );
    } else {
        data = new Array(len);
        for (let i = 0; i < len; i++) {
            data[i] = Number.isFinite(dataArray[i]) ? dataArray[i] : NaN;
        }
    }

    stromChart.data.datasets.push({
        label,
        type: 'line',
        data,
        borderColor: color,
        backgroundColor: color,
        fill: false,
        tension: 0.12,
        borderWidth: 2,
        spanGaps: true
    });

    stromChart.update();
}

function addConstantDataset(label, value, color) {
    if (!stromChart) return;

    const len = stromChart.data.labels.length;

    const data = new Array(len).fill(Number.isFinite(value) ? value : NaN);

    console.log("Adding constant dataset:", label, value, data);

    stromChart.data.datasets.push({
        label,
        type: 'line',
        data: value,
        borderColor: color,
        backgroundColor: color,
        fill: false,
        tension: 0.12,
        borderWidth: 2,
        spanGaps: true
    });
    stromChart.update();
}

function removeDatasetByLabel(label) {
    if (!stromChart) return;
    const i = stromChart.data.datasets.findIndex(d => d.label === label);
    if (i !== -1) {
        stromChart.data.datasets.splice(i, 1);
        stromChart.update();
    }
}


async function loadData() {

    loadTitleData()
    try {
        const rawDate = document.getElementById("dateInput")?.value;
        const apiDate = normalizeDate(rawDate);

        const response = await fetch(`${API_BASE}/data?date=${apiDate}`);
        console.log("Response:", response);
            if (!response.ok) throw new Error(response.status);

        let data = await response.json();
        console.log("Data:", data)
        const labels = data.map((d, idx) => {
            let k = null;
            if (!Number.isFinite(k)) k = idx +1;
            const zero = Number(k) -1;
            const hour = Math.floor(zero /4);
            const minute = (zero %4)*15;

            return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        });

        console.log("Labels:", labels);

        const values = data.map(d => Number(d.value));

        console.log("Values:", values);

        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const padding = (maxVal - minVal) * 0.1 || 5;


        const existingChart = Chart.getChart("stromChart");
        console.log("Found existing chart:", existingChart);
        if (existingChart) {
            existingChart.destroy();
            console.log("Existing chart destroyed");
        }
        stromChart = null;
        console.log("Chart reset to null");

        const ctx = document.getElementById("stromChart").getContext("2d");
        
        stromChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Strompreise',
                    data: values,
                    borderColor: 'rgba(75,192,192,1)',
                    backgroundColor: 'rgba(75,192,192,0.2)',
                    fill: true,
                    tension: 0.12,
                    borderWidth: 2,
                    pointRadius: 2,
                    spanGaps: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {display: true, text: "Zeit (15-Minuten-Intervalle)"}
                    },
                    y: {
                        title: {display: true, text: "Preis (€/MWh)"},
                        min: minVal - padding,
                        max: maxVal + padding
                    }
                }
            }
        });
        console.log("Chart created");

    } catch (err) {
        console.error("Fehler beim Laden:", err);
    }
}

window.loadData = loadData;

/* ============================= */
/* Checkbox Handlers             */
/* ============================= */

document.addEventListener('DOMContentLoaded', function() {
    
    const ctx = document.getElementById("stromChart").getContext("2d");
    const date = normalizeDate(document.getElementById('dateInput')?.value);
    fetch(`${API_BASE}/data?date=${date}`)
        .then(response => response.json())
        .then(data => {
            const labels = data.map(d => {
            // optional: Position (1–24) in Stunde umrechnen
            const hour = String(d.position - 1).padStart(2, "0");
            return `${hour}:00`;
        });

        const values = data.map(d => Number(d.value));

        new Chart(ctx, {
            type: "line",
            data: {
              labels: labels,
              datasets: [{
                label: "Strompreis (€/MWh)",
                data: values,
                borderWidth: 2,
                tension: 0.2
              }]
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: false
                }
              }
            }
        });
    })
    .catch(err => {
        console.error("Fehler beim Laden der Daten:", err);
    });
});

document.addEventListener('DOMContentLoaded', () => {

    loadData();

    document.getElementById('cb_dayaverage')?.addEventListener('change', async e => {
        console.log("Dayaverage checkbox changed:", e.target.checked);
        if (!stromChart) return;

        if (e.target.checked) {
            console.log("Dayaverage checkbox is checked");
            const date = normalizeDate(document.getElementById('dateInput')?.value);
            const response = await fetch(`${API_BASE}/dayAverage?date=${date}`);
            const data = await response.json()

            console.log("Day Average response data:", data)

            console.log("Day Average response data:", data[0]["value"])

            const value = data.map(d => Number(d.value[0]));

            console.log("Day Average data:", value);
            try {
                console.log("Day Average data length:", value.length);
                console.log("Day Average data values:", value[0]);
            } catch (err) {
                console.error("Error processing day average data:", err);
            }

            if (value.length === 0) {
                addConstantDataset('Day Average', 0, 'orange');
            } else {
                addConstantDataset('Day Average', value[0], 'orange');
            }
        } else {
            console.log("Day Average checkbox is unchecked");
            removeDatasetByLabel('Day Average');
        }
    });

    document.getElementById('cb_lastyear')?.addEventListener('change', async e => {
        if (!stromChart) return;

        if (e.target.checked) {
            const date = normalizeDate(document.getElementById('dateInput')?.value);
            const r = await fetch(`${API_BASE}/api/strompreise/lastyear?date=${date}`);
            const arr = await r.json();
            const vals = parsePriceArray(arr);

            if (vals.length === 0) {
                addDataset('Vorjahr', makeShifted(stromChart.data.datasets[0].data, 96), 'blue');
            } else {
                addDataset('Vorjahr', vals, 'blue');
            }
        } else {
            removeDatasetByLabel('Vorjahr');
        }
    });

    document.getElementById('cb_workweekaverage')?.addEventListener('change', async e => {
        if (!stromChart) return;

        if (e.target.checked) {
            const r = await fetch(`${API_BASE}/api/strompreise/workweekaverage_position`);
            const arr = await r.json();
            const vals = parsePriceArray(arr);

            if (vals.length === 0) {
                addDataset('AVG Arbeitswoche', movingAverage(stromChart.data.datasets[0].data, 9), 'purple');
            } else {
                addDataset('AVG Arbeitswoche', vals, 'purple');
            }
        } else {
            removeDatasetByLabel('AVG Arbeitswoche');
        }
    });
});

/* ============================= */
/* Logging                       */
/* ============================= */

function sendLogToServer(level, message) {
    fetch(`${API_BASE}/client-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            level,
            message,
            timestamp: new Date().toISOString()
        })
    }).catch(() => {});
}