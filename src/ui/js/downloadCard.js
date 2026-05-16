function createDownloadCard(title, id) {
    const container = document.createElement('div');
    container.classList.add('download-card');
    container.dataset.cardId = id;

    container.innerHTML = `
    <div class="info">
        <div class="title">${title}</div>
        <div class="status"></div>
    </div>
    <div class="operations">
        <button class="card-view">&gt;</button>
    </div>
    `;

    document.querySelector('#content-main main').appendChild(container);
}

function updateDownloadCard(id, status, percent = null) {
    const card = document.querySelector(`[data-card-id="${id}"]`);

    if (!card) return;

    const statusElement = card.querySelector('.status');
    const operationElement = card.querySelector('.operations');

    let statusText = 'Status: ';

    switch(status) {
        case 'downloading':
            statusText += 'Downloading';

            operationElement.innerHTML = `
            <span class="card-percent"></button>
            <button class="card-cancel">Cancel</button>
            <button class="card-view">&gt;</button>
            `;

            operationElement.querySelector('.card-percent').textContent = percent;

            break;
        case 'finished':
            statusText += `Success`;

            operationElement.innerHTML = `
            <button class="card-view">&gt;</button>
            `;

            break;
        case 'error':
            statusText += `Failed`;

            operationElement.innerHTML = `
            <button class="card-view">&gt;</button>
            `;

            break;
    }

    statusElement.textContent = status;
}