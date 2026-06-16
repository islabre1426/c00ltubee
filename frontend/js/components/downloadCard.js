export function createDownloadCard(taskId, title = null) {
    const container = document.createElement('div');
    container.classList.add('download-card');
    container.dataset.taskId = taskId;

    container.innerHTML = `
    <div class="info">
        <div class="title">${title ? title : 'Waiting...'}</div>
        <div class="status"></div>
    </div>
    <div class="operations">
        <span class="card-percent">0%</span>
        <button class="card-view">&gt;</button>
    </div>
    `;

    document.querySelector('#content-main main').prepend(container);
}

export function updateDownloadCard(taskId, info) {
    const card = document.querySelector(`.download-card[data-task-id="${taskId}"]`);

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
            break;

        case 'error':
            statusText += 'Failed';
            percentElement.textContent = '0%';
            break;
        
        case 'queued':
            statusText += 'Queued';
            break;

        default:
    }

    statusElement.textContent = statusText;
}

// function renderCardInfo(taskId) {
//     const sidebarMain = document.getElementById('sidebar-main');

//     sidebarMain.dataset.contentType = 'card-info';
//     sidebarMain.dataset.taskId = taskId;
//     sidebarMain.classList.add('card-info-container');

//     sidebarMain.innerHTML = `
//     <header>
//         <span class="title">Add URLs to Download</span>
//     </header>
//     <main>
//         <textarea id="urls"></textarea>
//     </main>
//     <footer>
//         <button id="inject-button">Inject!!</button>
//     </footer>
//     `;
// }