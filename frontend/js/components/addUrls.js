import { api, state } from '../main.js';
import { createDownloadCard } from './downloadCard.js';
import { toggleSidebar } from './sidebar.js';
import { startStatusPolling } from './statusPolling.js';

function renderAddUrlsUI() {
    const sidebarMain = document.getElementById('sidebar-main');

    // Reset class list
    sidebarMain.className = '';

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
        <button id="paste-url">Paste from clipboard</button>
        <button id="inject-button">Inject!!</button>
    </footer>
    `;

    document.getElementById('paste-url').addEventListener('click', async () => await handlePasteUrl());

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
        const id = response.id;

        createDownloadCard(id, {});

        state.pollers[id] = await startStatusPolling(id);
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
    const addUrlsButton = document.getElementById('add-urls-button');

    if (!addUrlsButton) {
        throw new Error('addUrlsButton not found');
    }

    addUrlsButton.addEventListener('click', async () => {
        const sidebarMain = document.getElementById('sidebar-main');
        const currentContentType = sidebarMain.dataset.contentType;

        if (state.isSidebarExtended) {
            if (!currentContentType || currentContentType === '' || currentContentType !== 'add-urls') {
                renderAddUrlsUI();
            
            } else if (currentContentType === 'add-urls') {
                await toggleSidebar(false);
            }

            if (sidebarMain.dataset.id) {
                const card = document.querySelector(`.download-card[data-id="${sidebarMain.dataset.id}"]`);

                card.querySelector('.card-view').textContent = '>';

                sidebarMain.removeAttribute('data-id');
            }

            return;
        }

        if (currentContentType !== 'add-urls') {
            renderAddUrlsUI();
        }

        if (sidebarMain.dataset.id) {
            const card = document.querySelector(`.download-card[data-id="${sidebarMain.dataset.id}"]`);

            card.querySelector('.card-view').textContent = '>';

            sidebarMain.removeAttribute('data-id');
        }

        await toggleSidebar(true);
    });
}

async function handlePasteUrl() {
    const urlsElement = document.getElementById('urls');

    if (!urlsElement) return;

    const url = await navigator.clipboard.readText();

    if (url) {
        urlsElement.value += url + "\n";
    }
}