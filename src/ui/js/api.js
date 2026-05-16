export function attachApi() {
    return {
        extendSidebar: async (extend) => await fetchJson('/extend-sidebar', 'POST', { extend: extend }),
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