import { attachApi } from "./api.js";

const api = attachApi();

const sidebarMain = document.getElementById('sidebar-main');
const sidebarButton = document.getElementById('sidebar-button');
const addUrlsButton = document.getElementById('add-urls-button');

let isSidebarExtended = false;

sidebarButton.addEventListener('click', () => toggleSidebar(!isSidebarExtended));

addUrlsButton.addEventListener('click', () => {
    const currentContent = sidebarMain.dataset.contentType;

    if (isSidebarExtended && currentContent === 'add-urls') {
        toggleSidebar(false);
        return;
    }

    if (currentContent !== 'add-urls') {
        renderAddUrlsUI();
    }

    toggleSidebar(true);
});



function toggleSidebar(state) {
    isSidebarExtended = state;
    const newWidth = Math.floor(window.innerWidth * 0.5);

    api.extendSidebar(state);

    sidebarMain.style.width = isSidebarExtended ? `${newWidth}px` : 'initial';
    sidebarMain.style.display = isSidebarExtended ? 'flex' : 'none';
    sidebarButton.textContent = isSidebarExtended ? '<' : '>';
}

function renderAddUrlsUI() {
    const sidebarMain = document.getElementById('sidebar-main');

    sidebarMain.dataset.contentType = 'add-urls';
    sidebarMain.classList.add('add-urls-container');

    sidebarMain.innerHTML = `
    <header>
        <span>Add URLs to Download</span>
    </header>
    <main>
        <textarea id="urls"></textarea>
    </main>
    <footer>
        <button id="inject-button">Inject!!</button>
    </footer>
    `;

    // document.getElementById('inject-button').addEventListener('click', handleDownload);
}