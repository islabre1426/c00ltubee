import { api, state } from '../main.js';
import { createDownloadCard } from './downloadCard.js';
import { toggleSidebar } from './sidebar.js';
import { startStatusPolling } from './statusPolling.js';

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

    // Check for empty input before processing
    const input = urlsElement.value.trim();
    if (!input) return;

    // Prevent user interaction before worker is started
    handleAddUrlsUI(true);

    const urls = input.split('\n');

    for (const url of urls) {
        const response = await api.startDownload(url);

        const taskId = response.taskId;

        createDownloadCard(taskId);

        state.pollers[taskId] = startStatusPolling(taskId);
    }

    await api.startWorker();

    // Re-enable interaction and clear input after starting
    handleAddUrlsUI(false);
    urlsElement.value = '';
}

function handleAddUrlsUI(interactionDisabled) {
    const urlsElement = document.getElementById('urls');
    const injectButton = document.getElementById('inject-button');

    urlsElement.disabled = interactionDisabled;
    urlsElement.style.cursor = interactionDisabled ? 'not-allowed' : 'auto';

    injectButton.disabled = interactionDisabled;
    injectButton.style.cursor = interactionDisabled ? 'not-allowed' : 'pointer';
}

export async function handleAddUrlsButton() {
    const sidebarMain = document.getElementById('sidebar-main');
    const currentContentType = sidebarMain.dataset.contentType;

    if (state.isSidebarExtended) {
        if (!currentContentType || currentContentType === '') {
            renderAddUrlsUI();
        
        } else if (currentContentType === 'add-urls') {
            await toggleSidebar(false);
        }

        return;
    }

    if (currentContentType !== 'add-urls') {
        renderAddUrlsUI();
    }

    await toggleSidebar(true);
}