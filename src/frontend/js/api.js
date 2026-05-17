export function attachApi() {
    return {
        extendSidebar: async (extend) => await fetchJson('/extend-sidebar', 'POST', { extend: extend }),
        startDownload: async (url) => await fetchJson('/start-download', 'POST', { url: url }),
        startWorker: async () => await fetchJson('/start-worker'),
        getDownloadStatus: async (id) => await fetchJson('/status', 'POST', { id: id }),
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
            throw new Error(`Request to ${url} returned status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (err) {
        throw err;
    }
}

export function checkSuccess(message) {
    if (message.status === 'error') {
        console.error(`Error: ${message.content}`);
        return false;
    }

    return true;
}