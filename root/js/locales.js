const DEFAULT_LANG = "de";

function getCurrentLanguage() {
    return localStorage.getItem("lang") || DEFAULT_LANG;
}

document.addEventListener("headerFooterLoaded", () => {
    // not great, but it depends on header + footer being ready
    setTimeout(() => setLanguage(getCurrentLanguage()), 200);
});

const translations = {
    de: {
        title: "Analysetool",
        dateLabel: "Datum:",
        diagramHeader: "Diagramm für den:",
        comparisonLabel: "Vergleichstag",
        avgOnDateLabel: "Tagesmittel Vergleichstag",
        avgDayToggle: "Tagesmittel anzeigen",
        avgWDayToggle: "Werktagsmittel anzeigen",
        prevYearToggle: "Vorjahresvergleich anzeigen (Intervall)",
        prevWDYearToggle: "Vorjahresvergleich Werktage anzeigen (Intervall)",
        showBtn: "Anzeigen",
        delBtn: "Löschen",

        headerMarketOvrvwURL: "Marktüberblick",
        headerAnalysisToolURL: "Analysetool",
        headerPricePrognosisURL: "Preisprognose",
        headerNewsUpdURL: "News & Updates",
        headerContactURL: "Kontakt",
        headerLoginBtn: "Anmelden",
        headerLangBtn: "Language",

        diagramPriceLabel: "Strompreise",
        diagramWDAvgIntervalLabel: "Werktagsdurchnitt (Intervall)",
        diagramDAvg: "Tagesdurchschnitt",
        diagramWDAvg: "Werktagsdurchschnitt",
        diagramPrevYearWDAvg: "Vorjahresvergleich Werktage (Intervall)",
        diagramPrevYearDAvg: "Vorjahresvergleich (Intervall)",
        diagramXAxisLabel: "Zeit (15-Minuten-Intervalle)",
        diagramYAxisLabel: "Preis (€/MWh)",

        footerImprintURL: "Impressum",
        footerPrivacyURL: "Datenschutz",
        footerTermsURL: "AGB",
        footerCopyright: "© 2025 ESMP - Alle Rechte vorbehalten."
    },




    en: {
        title: "Analysis Tool",
        dateLabel: "Date:",
        diagramHeader: "Diagram for:",
        comparisonLabel: "Comparison Day",
        avgOnDateLabel: "Comparison Day Average",
        avgDayToggle: "Show Daily Average",
        avgWDayToggle: "Show Daily Average (Weekday)",
        prevYearToggle: "Show Previous Year (Interval)",
        prevWDYearToggle: "Show Previous Year Weekday Comparison (Interval)",
        showBtn: "Show",
        delBtn: "Delete",

        headerMarketOvrvwURL: "Market Overview",
        headerAnalysisToolURL: "Analysis Tool",
        headerPricePrognosisURL: "Price Prognosis",
        headerNewsUpdURL: "News & Updates",
        headerContactURL: "Contact",
        headerLoginBtn: "Login",
        headerLangBtn: "Sprache",

        diagramPriceLabel: "Electricity Prices",
        diagramWDAvgIntervalLabel: "Weekday Average (Interval)",
        diagramDAvg: "Daily Average",
        diagramWDAvg: "Weekday Average",
        diagramPrevYearWDAvg: "Previous Year Weekday Comparison (Interval)",
        diagramPrevYearDAvg: "Previous Year Comparison (Interval)",
        diagramXAxisLabel: "Time (15-Minute Intervals)",
        diagramYAxisLabel: "Price (€/MWh)",
        
        footerImprintURL: "Imprint",
        footerPrivacyURL: "Privacy Policy",
        footerTermsURL: "ToS",
        footerCopyright: "© 2025 ESMP - All rights reserved."
    }
};

function setLanguage(lang) {
    // fallback to def
    const activeLang = lang || getCurrentLanguage();
    // store & apply
    localStorage.setItem("lang", activeLang);
    document.documentElement.lang = activeLang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (translations[activeLang]?.[key]) {
            el.textContent = translations[activeLang][key];
        }
    });
}
document.addEventListener("click", handleLanguageUI);

function handleLanguageUI(e) {
    const switcher = document.querySelector(".language-switcher");

    if (!switcher) return;

    if (e.target.id === "langToggle") {
        switcher.classList.toggle("open");
        return;
    }

    if (e.target.matches("#langMenu button")) {
        setLanguage(e.target.dataset.lang);
        switcher.classList.remove("open");
        return;
    }

    if (!e.target.closest(".language-switcher")) {
        switcher.classList.remove("open");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let lang = localStorage.getItem("lang");

    if (!lang) {
        lang = DEFAULT_LANG;
        localStorage.setItem("lang", lang);
    }

    setLanguage(lang);
});
