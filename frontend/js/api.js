export function attachApi() {
    return {
        getHistory: async (id) => await fetchJson(`/history/get/${id}`),
        deleteHistory: async (id) => await fetchJson(`/history/delete/${id}`),

        startDownload: async (url, id = null) => await fetchJson('/downloader/start/download', 'POST', { url: url, id: id }),
        startWorker: async () => await fetchJson('/downloader/start/worker'),
        getDownloadStatus: async (id) => await fetchJson(`/downloader/get/status/${id}`),
        getLog: async (id) => await fetchJson(`/downloader/get/log/${id}`),
        cancelDownload: async (id) => await fetchJson(`/downloader/cancel/${id}`),

        getSettings: async () => await fetchJson('/setting/get/all'),
        saveSetting: async (name, value) => await fetchJson('/setting/save', 'POST', { name: name, value: value }),

        extendSidebar: async (extend) => await fetchJson('/extend-sidebar', 'POST', { extend: extend }),
        folderPicker: async () => await fetchJson('/folder-picker'),
    }
}

async function fetchJson(url, method = 'GET', body = null) {
    try {
        const response = await fetch(url, {
            method: method,
            body: body ? JSON.stringify(body) : null,
            headers: {
                'Content-Type': 'application/json',
            }
        })

        if (!response.ok) {
            throw new Error(`${method} ${url} status ${response.status} with message: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (err) {
        throw err;
    }
}