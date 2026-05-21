import { attachApi, checkSuccess } from "./api.js";
import { createDownloadCard, updateDownloadCard } from "./components/downloadCard.js";

const api = attachApi();

const sidebarMain = document.getElementById('sidebar-main');
const sidebarButton = document.getElementById('sidebar-button');
const addUrlsButton = document.getElementById('add-urls-button');

let isSidebarExtended = false;
const pollers = {};

sidebarButton.addEventListener('click', () => toggleSidebar(!isSidebarExtended));

addUrlsButton.addEventListener('click', async () => {
    const currentContent = sidebarMain.dataset.contentType;

    if (isSidebarExtended && currentContent === 'add-urls') {
        await toggleSidebar(false);
        return;
    }

    if (currentContent !== 'add-urls') {
        renderAddUrlsUI();
    }

    await toggleSidebar(true);
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

    document.getElementById('inject-button').addEventListener('click', async () => await handleDownload());
}

async function handleDownload() {
    const urlsElement = document.getElementById('urls');
    const injectButton = document.getElementById('inject-button');

    handleUI(true);

    // Check for empty input before splitting
    const input = urlsElement.value.trim();
    if (!input) {
        handleUI(false);
        return;
    };

    const urls = input.split('\n');

    let status;

    for (const url of urls) {
        status = await api.startDownload(url);
        if (!checkSuccess(status)) continue;

        const taskId = status['task_id'];
        createDownloadCard(taskId);

        pollers[taskId] = startStatusPolling(taskId);
    }

    await api.startWorker();

    // Clear urls input after starting
    handleUI(false);
    urlsElement.value = '';



    function handleUI(disabled) {
        urlsElement.disabled = disabled;
        urlsElement.style.cursor = disabled ? 'not-allowed' : 'auto';

        injectButton.disabled = disabled;
        injectButton.style.cursor = disabled ? 'not-allowed' : 'pointer';
    }
}

function startStatusPolling(taskId) {
    const delayMs = 250;

    return setInterval(async () => {
        const status = await api.getDownloadStatus(taskId);
        const info = status['info'];

        if (!checkSuccess(status) || info['status'] === 'finished' || info['status'] === 'error') {
            stopStatusPolling(taskId);
        }

        updateDownloadCard(taskId, info);
    }, delayMs);
}

function stopStatusPolling(taskId) {
    clearInterval(pollers[taskId]);
}