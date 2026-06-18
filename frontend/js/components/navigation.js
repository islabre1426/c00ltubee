const pages = document.querySelectorAll('.content-main');

let currentPage = 0;

export function changePage(amount) {
    currentPage += amount;

    if (currentPage < 0) {
        currentPage = pages.length - 1;
    } else if (currentPage > pages.length - 1) {
        currentPage = 0;
    }

    showPage(currentPage);
}

function showPage(page) {
    const navIndicator = document.getElementById('nav-indicator');
    const destPage = pages[page];

    pages.forEach((p) => p.classList.remove('active'));

    destPage.classList.add('active');

    navIndicator.textContent = destPage.dataset.page;
}