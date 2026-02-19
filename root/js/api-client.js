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

function previousYearDate(rawDate) {
    const normalized = normalizeDate(rawDate);
    const year = parseInt(normalized.substring(0, 4));
    const month = normalized.substring(4, 6);
    const day = normalized.substring(6, 8);
    return `${year - 1}${month}${day}`;
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

function updateYAxisRange (padding=5) {
    if (!stromChart) return;

    let globalMin = Infinity;
    let globalMax = Infinity;

    stromChart.data.datasets.forEach(dataset => {
        dataset.data.forEach(value => {
            if (Number.isFinite(value)) {
                if (value < globalMin) globalMin = value;
                if (value > globalMax) globalMax = value;
            }
        })
    });

    if (globalMin === Infinity) return;

    stromChart.options.scales.y.min = globalMin - padding;
    stromChart.options.scales.y.max = globalMax + padding;

    stromChart.update();
}

function addDataset(label, displayLabel = label, dataArray, color, minVal, maxVal, padding) {
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
        label: label,
        displayLabel: displayLabel,
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
    updateYAxisRange();
}

function addConstantDataset(label, labelDisplay, value, color) {
    if (!stromChart) return;

    const len = stromChart.data.labels.length;

    const data = new Array(len).fill(Number.isFinite(value) ? value : NaN);

    console.log("Adding constant dataset:", labelDisplay,",", value);

    stromChart.data.datasets.push({
        type: 'line',
        label: label,
        displayLabel: labelDisplay,
        data: data,
        borderColor: color,
        backgroundColor: color,
        fill: false,
        tension: 0.12,
        borderWidth: 2,
        pointRadius: 0,
        spanGaps: true
    });
    stromChart.update();
    updateYAxisRange();
}

function removeDatasetByLabel(label) {
    console.log("Attempting to remove dataset:", label);
    if (!stromChart) return;
    const i = stromChart.data.datasets.findIndex(d => d.label === label);
    if (i !== -1) {
        stromChart.data.datasets.splice(i, 1);
        stromChart.update();
        console.log("Removed dataset:", label);
    }
}


async function loadData() {

    loadTitleData()

    const cb_dayaverage = document.getElementById("cb_dayaverage");
    if (cb_dayaverage) cb_dayaverage.checked = false;

    const cb_workDayAverage = document.getElementById("cb_workDayAverage");
    if (cb_workDayAverage) cb_workDayAverage.checked = false;

    const cb_workDayAverageIntervall = document.getElementById("cb_workDayAverageIntervall");
    if (cb_workDayAverageIntervall) cb_workDayAverageIntervall.checked = false;

    const cb_previousYear = document.getElementById("cb_previousYear");
    if (cb_previousYear) cb_previousYear.checked = false;

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
                },
                plugins: {
                    legend: {
                        labels: {
                            generateLabels(chart) {
                                const original =
                                    Chart.defaults.plugins.legend.labels.generateLabels;

                                const labels = original(chart);

                                labels.forEach(labelItem => {
                                    const dataset =
                                        chart.data.datasets[labelItem.datasetIndex];

                                    if (dataset.displayLabel) {
                                        labelItem.text = dataset.displayLabel;
                                    }
                                });
                                return labels;
                            }
                        }
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
            const data = await response.json();

            let value = data[0]["value"];

            try {
                console.log("Day Average data values:", value);
            } catch (err) {
                console.error("Error processing day average data:", err);
            }

            if (value.length === 0) {
                addConstantDataset('dayAverage', 'Day Average', 0, 'orange');
            } else {
                addConstantDataset('dayAverage', 'Day Average: ' + value.toFixed(2) + ' €/MWh', value, 'orange');
            }
        } else {
            console.log("Day Average checkbox is unchecked");
            removeDatasetByLabel('dayAverage');
        }
    });

    document.getElementById('cb_previousYear')?.addEventListener('change', async e => {
        console.log("Previous Year checkbox changed:", e.target.checked);
        if (!stromChart) return;

        if (e.target.checked) {
            console.log("Previous Year checkbox is checked");
            const date = previousYearDate(document.getElementById('dateInput')?.value);
            const r = await fetch(`${API_BASE}/data?date=${date}`);
            const arr = await r.json();
            const vals = parsePriceArray(arr);

            if (vals.length === 0) {
                addDataset('previosYearData', '', makeShifted(stromChart.data.datasets[0].data, 96), 'blue', minVal, maxVal, padding);
            } else {
                addDataset('previosYearData', 'Previous Year',  vals, 'blue', minVal, maxVal, padding);
            }
        } else {
            console.log("Previous Year checkbox is unchecked");
            removeDatasetByLabel('previosYearData');
        }
    });

    document.getElementById('cb_workDayAverage')?.addEventListener('change', async e => {
        console.log("Workweek average checkbox changed:", e.target.checked);
        if (!stromChart) return;

        if (e.target.checked) {
            console.log("Workweek average checkbox is checked");
            const date = normalizeDate(document.getElementById('dateInput')?.value);
            const response = await fetch(`${API_BASE}/workingDayAverage?date=${date}`);
            const data = await response.json();

            let value = data[0]["value"];

            console.log("Working Day Average value:", value);

            if (value.length === 0) {
                addConstantDataset('cb_workDayAverage', 'Working Day Average', 0, 'purple');
            } else {
                addConstantDataset('cb_workDayAverage', 'Working Day Average: ' + value.toFixed(2) + ' €/MWh', value, 'purple');
            }
        } else {
            console.log("Workweek average checkbox is unchecked");
            removeDatasetByLabel('cb_workDayAverage');
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