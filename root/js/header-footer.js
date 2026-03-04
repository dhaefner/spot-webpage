function loadHTML(id, url) {
            fetch(url)
                .then(response => response.text())
                .then(html => {
                    document.getElementById(id).innerHTML = html;
                })
        }

Promise.all([
    loadHTML("header", "header.html"),
    loadHTML("footer", "footer.html")
]).then(() => {
    document.dispatchEvent(new Event("headerFooterLoaded"));
});