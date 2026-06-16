import { api } from "../main.js";
import { createDownloadCard, updateDownloadCard } from "./downloadCard.js";

export async function populateHistory() {
    const response = await api.getHistory();
    const history = response.history;

    history.forEach((entry) => {
        createDownloadCard(entry['task_id'], entry['title']);
        updateDownloadCard(entry['task_id'], {
            'status': entry['status_type'],
        });
    });
}