import { api } from '../main.js'

export async function getLog(taskId) {
    const response = await api.getLog(taskId);

    if (response.content !== undefined) {
        return response.content;
    }

    return null;
}