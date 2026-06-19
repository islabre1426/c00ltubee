import { api } from "../main.js";
import { createDownloadCard, updateDownloadCard } from "./downloadCard.js";

export async function populateHistory() {
    const response = await api.getHistory();
    const history = response.history;

    history.forEach((entry) => {
        const info = {
            'title': entry['title'],
            'status': entry['status_type'],
        }

        createDownloadCard(entry['task_id'], info.title, info);
        updateDownloadCard(entry['task_id'], info);
    });
}

export async function handleDeleteHistory(taskId) {
    await api.deleteHistory(taskId);
}

export async function handleDeleteAllHistory() {
    await api.deleteAllHistory();
}