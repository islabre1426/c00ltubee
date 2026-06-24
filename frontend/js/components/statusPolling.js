import { api, state } from "../main.js";
import { updateCardInfo, updateDownloadCard, updateLog } from "./downloadCard.js";
import { getLog } from "./log.js";

const delayMs = 250;

export async function startStatusPolling(taskId) {
    return setInterval(async () => {
        const statusResponse = await api.getDownloadStatus(taskId);
        const log = await getLog(taskId);
        const statusInfo = statusResponse.info;
        const stopPollingStatus = ['finished', 'error'];

        if (stopPollingStatus.includes(statusInfo.status)) {
            stopStatusPolling(taskId);
        }

        updateDownloadCard(taskId, statusInfo);
        updateCardInfo(taskId, statusInfo);

        if (log) {
            updateLog(taskId, log);
        }
    }, delayMs);
}

function stopStatusPolling(taskId) {
    clearInterval(state.pollers[taskId]);
}