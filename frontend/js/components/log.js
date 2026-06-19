import { api } from '../main.js'

export async function getLog(taskId) {
    const response = await api.getLog(taskId);
    const log = response.content;

    return log;
}