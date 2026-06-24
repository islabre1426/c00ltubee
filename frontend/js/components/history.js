import { api } from "../main.js";
import { createDownloadCard, updateDownloadCard } from "./downloadCard.js";
import { toggleSidebar } from "./sidebar.js";

export async function populateHistory() {
    const response = await api.getHistory();
    const history = response.history;

    history.forEach((entry) => {
        const info = {
            'title': entry['title'],
            'status': entry['status_type'],
        }

        createDownloadCard(entry['task_id'], info);
        updateDownloadCard(entry['task_id'], info);
    });
}

export async function handleDeleteHistory(taskId) {
    const contentMain = document.querySelector('.content-main[data-page="Home"] main');
    const deletedCard = contentMain.querySelector(`.download-card[data-task-id="${taskId}"]`);

    await api.deleteHistory(taskId);

    contentMain.removeChild(deletedCard);
    cleanupSidebar();
    await toggleSidebar(false);
}

export async function handleDeleteAllHistory() {
    const contentMain = document.querySelector('.content-main[data-page="Home"] main');

    await api.deleteAllHistory();

    contentMain.innerHTML = '';
    cleanupSidebar();
    await toggleSidebar(false);
}

function cleanupSidebar() {
    const sidebarMain = document.getElementById('sidebar-main');

    sidebarMain.innerHTML = '';
    sidebarMain.className = '';
    ['data-content-type', 'data-task-id'].forEach((attr) => sidebarMain.removeAttribute(attr));
}