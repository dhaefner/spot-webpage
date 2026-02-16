function loadHTML(id, url) {
            fetch(url)
                .then(response => response.text())
                .then(html => {
                    document.getElementById(id).innerHTML = html;
                })
        }

loadHTML("header", "header.html")
loadHTML("footer", "footer.html")