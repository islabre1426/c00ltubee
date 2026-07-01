const pages = document.querySelectorAll('.content-main');

let currentPage = 0;

export function handleNavigation() {
    const navPrev = document.getElementById('nav-prev');
    const navNext = document.getElementById('nav-next');

    if (!navNext || !navPrev) {
        throw new Error('navNext or navPrev not found');
    }

    navPrev.addEventListener('click', () => changePage(-1));
    navNext.addEventListener('click', () => changePage(+1));
}

function changePage(amount) {
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

    if (!navIndicator) {
        throw new Error('navIndicator not found');
    }

    const destPage = pages[page];

    pages.forEach((p) => p.classList.remove('active'));

    destPage.classList.add('active');

    navIndicator.textContent = destPage.dataset.page;
}