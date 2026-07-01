import { api } from "../main.js";
import { setupDialog } from "./dialog.js";
import { createDownloadCard, updateDownloadCard } from "./downloadCard.js";
import { cleanupSidebar, toggleSidebar } from "./sidebar.js";

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

    if (!contentMain) {
        throw new Error('contentMain not found');
    }

    await api.deleteHistory(id);

    if (id === 'all') {
        contentMain.innerHTML = '';
    } else {
        const deletedCard = contentMain.querySelector(`.download-card[data-id="${id}"]`);

        if (!deletedCard) {
            throw new Error(`deletedCard id ${id} not found`);
        }

        contentMain.removeChild(deletedCard);
    }

    cleanupSidebar();
    await toggleSidebar(false);
}

export function handleClearHistoryButton() {
    const clearHistoryButton = document.getElementById('clear-history-button');

    if (!clearHistoryButton) {
        throw new Error('clearHistoryButton not found');
    }

    clearHistoryButton.addEventListener('click', () => setupDialog(
        'Are you sure to delete all history?',
        'delete-all-history',
    ));
}