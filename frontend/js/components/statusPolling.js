import { api, state } from "../main.js";
import { updateCardInfo, updateDownloadCard, updateLog } from "./downloadCard.js";
import { getLog } from "./log.js";

const delayMs = 250;

export async function startStatusPolling(id) {
    return setInterval(async () => {
        const statusResponse = await api.getDownloadStatus(id);
        const log = await getLog(id);
        const statusInfo = statusResponse.info;
        const stopPollingStatus = ['finished', 'error', 'cancelled'];

        if (stopPollingStatus.includes(statusInfo.status)) {
            stopStatusPolling(id);
        }

        updateDownloadCard(id, statusInfo);
        updateCardInfo(id, statusInfo);

        if (log) {
            updateLog(id, log);
        }
    }, delayMs);
}

function stopStatusPolling(taskId) {
    clearInterval(state.pollers[taskId]);
}