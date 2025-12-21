import { startDotAnimation, stopDotAnimation } from "./dotAnimation.js";

let activeDownloads = 0;

export function createList(listEl, videos) {
    activeDownloads += videos.length;

    // Create list if it doesn't already exist
    if (!listEl.querySelector('ol')) {
        const newOl = document.createElement('ol');
        listEl.append(newOl);
    }

    const ol = listEl.querySelector('ol');

    videos.forEach((v) => {
        const li = document.createElement('li');
        createCard(li, v.title, v.id);
        ol.append(li);
    });
}

function createCard(parent, title, youtubeId) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = youtubeId;

    card.innerHTML = `
        <span>${title}</span>
        <div class="progress-container">
            <hr>
            <div class="progress-bar">
                <div class="progress"></div>
            </div>
            <hr>
            <span></span>
        </div>
    `;
    
    startDotAnimation(card.querySelector('.progress-container span'), 'Starting');

    parent.append(card);
}

export function updateCardProgress(youtubeId, percent, statusText) {
    const card = document.querySelector(`.card[data-id="${youtubeId}"]`);
    if (!card) return;

    const progressContainer = card.querySelector('.progress-container');
    const progress = progressContainer.querySelector('.progress');
    const statusEl = progressContainer.querySelector('span');

    stopDotAnimation(statusEl, statusText);

    progress.style.width = `${percent}%`;
}

export function resetDownloadList(listEl) {
    document.querySelectorAll('.card .progress-container span').forEach(stopDotAnimation);

    listEl.innerHTML = '';
    activeDownloads = 0;
}

export function getActiveDownloads() {
    return activeDownloads;
}

export function setActiveDownloads(num) {
    activeDownloads = num;
}