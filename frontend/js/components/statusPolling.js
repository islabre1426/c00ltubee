import { api, state } from "../main.js";
import { updateDownloadCard } from "./downloadCard.js";

export async function startStatusPolling(taskId) {
    const delayMs = 250;

    return setInterval(async () => {
        const response = await api.getDownloadStatus(taskId);
        const info = response.info;
        const stopPollingStatus = ['finished', 'error'];

        if (stopPollingStatus.includes(info.status)) {
            stopStatusPolling(taskId);
        }

        updateDownloadCard(taskId, info);
    }, delayMs);
}

function stopStatusPolling(taskId) {
    clearInterval(state.pollers[taskId]);
}