import { api, state } from "../main.js";
import { getHistory, handleDeleteHistory } from "./history.js";
import { getLog } from "./log.js";
import { toggleSidebar } from "./sidebar.js";
import { startStatusPolling } from "./statusPolling.js";

export function createDownloadCard(id, info) {
    const container = document.createElement('div');
    container.classList.add('download-card');
    container.dataset.id = id;

    container.innerHTML = `
    <div class="info">
        <div class="title">${info['title'] ? info['title'] : 'Waiting...'}</div>
        <div class="status"></div>
    </div>
    <div class="operations">
        <span class="card-percent">0%</span>
        <button class="card-view">&gt;</button>
    </div>
    `;

    document.querySelector('.content-main[data-page="Home"] main').prepend(container);

    const cardViewButton = container.querySelector('.card-view');

    cardViewButton.addEventListener('click', async () => await handleCardViewButton(id, info));
}

async function handleCardViewButton(id, info) {
    const card = document.querySelector(`.download-card[data-id="${id}"]`);
    const cardViewButton = card.querySelector('.card-view');
    const sidebarMain = document.getElementById('sidebar-main');

    const viewingCardId = sidebarMain.dataset.id;

    const isViewing = (state.isSidebarExtended && (viewingCardId === id)) ? true : false;

    if (!state.isSidebarExtended) {
        await toggleSidebar(true);
    }
    
    cardViewButton.textContent = '<';

    if (isViewing) {
        await toggleSidebar(false);
        cardViewButton.textContent = '>';
        return;
    } else if (viewingCardId !== undefined && viewingCardId !== id) {
        const previousViewingCard = document.querySelector(`.download-card[data-id="${viewingCardId}"]`);
        previousViewingCard.querySelector('.card-view').textContent = '>';
        cardViewButton.textContent = '<';
    }

    let passedInfo = info;
    
    // Make sure card view info is updated even after finished downloading
    if (Object.keys(info).length === 0) {
        const response = await api.getDownloadStatus(id);
        passedInfo = response.info;
    }

    await renderCardInfo(id, passedInfo);
    updateCardInfo(id, passedInfo);
}

export function updateDownloadCard(id, info) {
    const card = document.querySelector(`.download-card[data-id="${id}"]`);

    if (!card) return;

    const titleElement = card.querySelector('.title');
    const statusElement = card.querySelector('.status');
    const percentElement = card.querySelector('.card-percent');

    let statusText = 'Status: ';

    switch(info['status']) {
        case 'starting':
            statusText += 'Starting...'
            titleElement.textContent = info['title'];
            break;

        case 'downloading':
            statusText += 'Downloading...';
            percentElement.textContent = `${info['progress']}%`;

            break;

        case 'finished':
            statusText += 'Success';
            percentElement.textContent = '100%';

            // Make sure title is updated even for already downloaded file
            if (info['title']) {
                titleElement.textContent = info['title'];
            }

            break;

        case 'error':
            statusText += 'Failed';
            percentElement.textContent = '0%';
            break;
        
        case 'queued':
            statusText += 'Queued';
            break;
        
        case 'cancelled':
            statusText += 'Cancelled';
            break;

        default:
    }

    statusElement.textContent = statusText;
}

export async function renderCardInfo(id, info) {
    const sidebarMain = document.getElementById('sidebar-main');

    // Reset class list
    sidebarMain.className = '';

    sidebarMain.dataset.contentType = 'card-info';
    sidebarMain.dataset.id = id;
    sidebarMain.classList.add('card-info-container');

    sidebarMain.innerHTML = `
    <header>
        <div class="title">${info['title'] ? info['title'] : 'Waiting...'}</div>
        <div class="task-id">ID: ${id}</div>
    </header>
    <main>
        <div class="log"></div>
    </main>
    <footer>
        <button id="task-button" data-id="${id}"></button>
        <hr class="vr">
        <button id="delete-button" popovertarget="confirm-dialog">Delete</button>
    </footer>
    `;

    const deleteButton = document.getElementById('delete-button');
    const taskButton = document.getElementById('task-button');

    const log = await getLog(id);

    if (log) {
        updateLog(id, log);
    }

    deleteButton.addEventListener('click', () => {
        const confirmDialogYesAction = document.getElementById('confirm-yes');
        const confirmMessage = document.getElementById('confirm-message');

        confirmMessage.textContent = `Are you sure to delete history id\n"${id}"?`;
        confirmDialogYesAction.dataset.action = 'delete-history';
        confirmDialogYesAction.dataset.id = id;
    });

    taskButton.addEventListener('click', async () => await handleTaskButtonOperation());
}

async function handleTaskButtonOperation() {
    const taskButton = document.getElementById('task-button');
    const id = taskButton.dataset.id;

    switch (taskButton.dataset.operation) {
        case 'redownload':
        case 'retry':
            const history = await getHistory(id);
            const url = history['url'];

            await api.startDownload(url, id);

            state.pollers[id] = await startStatusPolling(id);

            await api.startWorker();

            break;
        
        case 'cancel':
            await api.cancelDownload(id);
            
            break;
    }
}

export function updateCardInfo(id, info) {
    const cardInfo = document.querySelector(`#sidebar-main[data-content-type="card-info"][data-id="${id}"]`);

    if (!cardInfo) return;

    const titleElement = cardInfo.querySelector('.title');
    const taskButton = document.getElementById('task-button');
    const deleteButton = cardInfo.querySelector('#delete-button');

    if (!titleElement || !taskButton || !deleteButton) return;

    let taskButtonOperation;
    let taskButtonText;
    let enableDelete = false;

    titleElement.textContent = info['title'];

    switch (info['status']) {
        case 'starting':
        case 'downloading':
        case 'queued':
            taskButtonOperation = 'cancel';
            taskButtonText = 'Cancel';
            enableDelete = false;
            break;
        
        case 'finished':
            taskButtonOperation = 'redownload';
            taskButtonText = 'Redownload';
            enableDelete = true;
            break;
        
        case 'error':
        case 'cancelled':
            taskButtonOperation = 'retry';
            taskButtonText = 'Retry';
            enableDelete = true;
            break;
    }

    taskButton.dataset.operation = taskButtonOperation;
    taskButton.textContent = taskButtonText;

    deleteButton.disabled = enableDelete ? false : true;
}

export function updateLog(id, log) {
    const cardInfo = document.querySelector(`#sidebar-main[data-content-type="card-info"][data-id="${id}"]`);

    if (!cardInfo) return;

    const logElement = cardInfo.querySelector('.log');

    logElement.textContent = log;
}