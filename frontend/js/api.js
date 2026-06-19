export function attachApi() {
    return {
        getHistory: async () => await fetchJson('/history'),
        deleteHistory: async (id) => await fetchJson('/delete-history', 'POST', { id: id }),
        deleteAllHistory: async () => await fetchJson('/delete-all-history'),
        extendSidebar: async (extend) => await fetchJson('/extend-sidebar', 'POST', { extend: extend }),
        startDownload: async (url) => await fetchJson('/start-download', 'POST', { url: url }),
        startWorker: async () => await fetchJson('/start-worker'),
        getDownloadStatus: async (id) => await fetchJson('/status', 'POST', { id: id }),
        getLog: async (id) => await fetchJson('/log', 'POST', { id: id }),
        getSettings: async () => await fetchJson('/settings'),
        saveSetting: async (name, value) => await fetchJson('/save-setting', 'POST', { name: name, value: value }),
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