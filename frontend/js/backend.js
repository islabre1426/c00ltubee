const backend = initBackend();

function initBackend() {
    return {
        loadSettings: async () => await fetchJson('/load-settings', 'GET'),
        saveSetting: async (setting) => await fetchJson('/save-setting', 'POST', setting),
        startDownload: async (urls) => await fetchJson('/start-download', 'POST', urls),
        getVideoInfo: async (urls) => await fetchJson('/get-video-info', 'POST', urls),
        subscribeEvent: (handler) => {
            const eventSource = new EventSource('/download-events');

            eventSource.addEventListener('message', (e) => {
                handler(JSON.parse(e.data));
            })
        },
        browseFolder: async () =>  await fetchJson('/browse-folder', 'GET'),
    };
}

export function getBackend() {
    return backend;
}

async function fetchJson(url, method, body = null) {
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
        throw new Error(`Fetching ${url} failed with status ${response.status}`);
    }

    return await response.json();
}