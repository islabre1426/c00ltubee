import { attachApi, checkSuccess } from "./api.js";
import { createDownloadCard, updateDownloadCard } from "./components/downloadCard.js";

const api = attachApi();

const sidebarMain = document.getElementById('sidebar-main');
const sidebarButton = document.getElementById('sidebar-button');
const addUrlsButton = document.getElementById('add-urls-button');

let isSidebarExtended = false;
const pollers = {};

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



async function toggleSidebar(state) {
    isSidebarExtended = state;
    const newWidth = Math.floor(window.innerWidth * 0.5);

    await api.extendSidebar(state);

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

    document.getElementById('inject-button').addEventListener('click', handleDownload);
}

async function handleDownload() {
    const urlsElement = document.getElementById('urls');
    const urls = urlsElement.value.trim().split('\n');

    let status;

    for (const url of urls) {
        status = await api.startDownload(url);
        if (!checkSuccess(status)) continue;

        const taskId = status['task_id'];
        createDownloadCard(taskId);

        pollers[taskId] = startStatusPolling(taskId);
    }

    await api.startWorker();
}

function startStatusPolling(taskId) {
    const delayMs = 250;

    return setInterval(async () => {
        const status = await api.getDownloadStatus(taskId);
        const info = status['info'];

        if (!checkSuccess(status) || info['status'] === 'finished') {
            stopStatusPolling(taskId);
        }

        updateDownloadCard(taskId, info);
    }, delayMs);
}

function stopStatusPolling(taskId) {
    clearInterval(pollers[taskId]);
}