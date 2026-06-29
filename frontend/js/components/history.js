import { api } from "../main.js";
import { createDownloadCard, updateDownloadCard } from "./downloadCard.js";
import { toggleSidebar } from "./sidebar.js";

export async function populateHistory() {
    const history = await getHistory('all');

    history.forEach((entry) => {
        const info = {
            'title': entry['title'],
            'status': entry['status_type'],
        }

        createDownloadCard(entry['task_id'], info);
        updateDownloadCard(entry['task_id'], info);
    });
}

export async function getHistory(id) {
    const response = await api.getHistory(id);

    return response.history;
}

export async function handleDeleteHistory(id) {
    const contentMain = document.querySelector('.content-main[data-page="Home"] main');
    const deletedCard = contentMain.querySelector(`.download-card[data-id="${id}"]`);

    await api.deleteHistory(id);

    if (id === 'all') {
        contentMain.innerHTML = '';
    } else {
        contentMain.removeChild(deletedCard);
    }

    cleanupSidebar();
    await toggleSidebar(false);
}

function cleanupSidebar() {
    const sidebarMain = document.getElementById('sidebar-main');

    sidebarMain.innerHTML = '';
    sidebarMain.className = '';
    ['data-content-type', 'data-id'].forEach((attr) => sidebarMain.removeAttribute(attr));
}