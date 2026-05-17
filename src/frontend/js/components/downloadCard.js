export function createDownloadCard(taskId) {
    const container = document.createElement('div');
    container.classList.add('download-card');
    container.dataset.taskId = taskId;

    container.innerHTML = `
    <div class="info">
        <div class="title">Waiting...</div>
        <div class="status"></div>
    </div>
    <div class="operations">
        <span class="card-percent">0%</span>
        <button class="card-cancel">Cancel</button>
        <button class="card-view">&gt;</button>
    </div>
    `;

    document.querySelector('#content-main main').appendChild(container);
}

export function updateDownloadCard(taskId, info) {
    const card = document.querySelector(`[data-task-id="${taskId}"]`);

    if (!card) return;

    const titleElement = card.querySelector('.title');
    const statusElement = card.querySelector('.status');
    const percentElement = card.querySelector('.card-percent');
    const cancelElement = card.querySelector('.card-cancel');

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
            cancelElement.style.display = 'none';
            break;

        case 'error':
            statusText += 'Failed';
            percentElement.textContent = '0%';
            cancelElement.style.display = 'none';
            break;
        
        case 'queued':
            statusText += 'Queued';
            break;

        default:
    }

    statusElement.textContent = statusText;
}