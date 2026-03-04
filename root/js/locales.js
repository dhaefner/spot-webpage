const translations = {
    de: {
        title: "Analyse-Tool",
        dateLabel: "Datum:",
        comparisonLabel: "Vergleichstag",
        avgOnDateLabel: "Tagesdurchschnitt (Datum)"
    },
    en: {
        title: "Analysis Tool",
        dateLabel: "Date:",
        comparisonLabel: "Comparison Day",
        avgOnDateLabel: "Day Average (Date)"
    }
};

function setLanguage(lang) {
    localStorage.setItem("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
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