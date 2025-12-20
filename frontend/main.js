//// --------- ////
//// Variables ////
//// --------- ////

const navButtons = document.querySelectorAll('header nav button');
const navContents = document.querySelectorAll('main > div');
const list = document.querySelector('.list');
const settingsEl = document.querySelector('.settings');
const youtubeLinks = document.getElementById('youtube-links');
const linksSubmit = document.getElementById('links-submit');

const backend = initBackend();
const settings = await backend.loadSetting();

// Save original text for animation
const originalLinksSubmitText = linksSubmit.textContent;

const eventSource = new EventSource('/download-events');
const dotAnimations = new WeakMap();
let activeDownloads = 0;

//// --------- ////
//// Main flow ////
//// --------- ////

// SSE handling
const sseOnMessage = async (data) => {
    switch (data.type) {
        case 'progress':
            updateCardProgress(data.id, data.percent, data.percent + '%');
            break;
        case 'finished':
            updateCardProgress(data.id, 100, 'Done');
            activeDownloads--;

            if (activeDownloads === 0) {
                stopDotAnimation(linksSubmit, 'Download finished!');
                disableHomeComponents('pointer', false);

                await sleep(5000);

                linksSubmit.textContent = originalLinksSubmitText;
            }

            break;
    }
}

eventSource.addEventListener('message', async (e) => {
    await sseOnMessage(JSON.parse(e.data));
});

// UI handling
createAllSettings(
    settingsEl,
    settings.result[0],
    settings.has_user_config ? settings.result[1] : null,
);

handleDropdown();
handleCheckbox();

navButtons.forEach((button) => {
    button.addEventListener('click', () => navigateContent(button));
});

linksSubmit.addEventListener('click', async () => {
    // Prevent duplication of card inside list
    resetDownloadList();

    const urls = youtubeLinks.value.trim().split('\n');

    startDotAnimation(linksSubmit, 'Injecting');
    disableHomeComponents();

    try {
        const infoResp = await backend.getVideoInfo(urls);
        createList(list, infoResp.results);

        stopDotAnimation(linksSubmit);
        startDotAnimation(linksSubmit, 'Injected!! Downloading');

        await backend.startDownload(urls);
    } catch (err) {
        stopDotAnimation(linksSubmit, 'Error!!');
        disableHomeComponents('pointer', false);
        throw err;
    }
});

//// --------- ////
//// Functions ////
//// --------- ////

// -----------------
// UI Tab navigation
// -----------------

function navigateContent(button) {
    const navData = button.dataset.nav;
    const navContent = document.querySelector(`main > div[data-nav="${navData}"]`);

    navButtons.forEach((btn) => btn.classList.remove('active'));
    navContents.forEach((content) => content.classList.remove('active'));

    button.classList.add('active');
    navContent.classList.add('active');
}

// -------------
// Download list
// -------------

function createList(parent, videos) {
    activeDownloads += videos.length;

    // Create list if it doesn't already exist
    if (!parent.querySelector('ol')) {
        const newOl = document.createElement('ol');
        parent.append(newOl);
    }

    const ol = parent.querySelector('ol');

    videos.forEach((v) => {
        const li = document.createElement('li');
        createCard(li, v.title, v.id);
        ol.append(li);
    });
}

function createCard(parent, title, youtubeId) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = youtubeId;

    card.innerHTML = `
        <span>${title}</span>
        <div class="progress-container">
            <hr>
            <div class="progress-bar">
                <div class="progress"></div>
            </div>
            <hr>
            <span></span>
        </div>
    `;
    
    startDotAnimation(card.querySelector('.progress-container span'), 'Starting');

    parent.append(card);
}

function updateCardProgress(youtubeId, percent, statusText) {
    const card = document.querySelector(`.card[data-id="${youtubeId}"]`);
    if (!card) return;

    const progressContainer = card.querySelector('.progress-container');
    const progress = progressContainer.querySelector('.progress');
    const statusEl = progressContainer.querySelector('span');

    stopDotAnimation(statusEl, statusText);

    progress.style.width = `${percent}%`;
}

function resetDownloadList() {
    document.querySelectorAll('.card .progress-container span').forEach(stopDotAnimation);

    list.innerHTML = '';
    activeDownloads = 0;
}

// -------------------
// Settings generation
// -------------------

function createAllSettings(parent, globalConfig, userConfig = null) {
    if (!parent.querySelector('ul')) {
        const newUl = document.createElement('ul');
        parent.append(newUl);
    }

    const ul = parent.querySelector('ul');

    Object.keys(globalConfig).forEach((config) => {
        const li = document.createElement('li');

        createSetting(
            li, config, globalConfig[config],
            userConfig ? userConfig[config] : null,
        );

        ul.append(li);
    });
}

function createSetting(parent, name, info, userConfig = null) {
    const setting = document.createElement('div');
    setting.classList.add('setting');

    switch (info.type) {
        case 'dropdown':
            createDropdown(setting, name, info.title, info.options, info.default, userConfig);
            break;
        case 'checkbox':
            createCheckbox(setting, name, info.title, info.default, userConfig);
            break;
        default:
            console.error('Invalid setting type:', info.type);
    }

    parent.append(setting);
}

function createDropdown(parent, name, title, options, defaultConfig, userConfig = null) {
    const titleEl = document.createElement('span');
    titleEl.textContent = title;

    const container = document.createElement('div');
    container.classList.add('dropdown-container');
    container.dataset.setting = name;

    container.innerHTML = `
        <div class="select-button">
            <span class="selected-value"></span>
            <div class="arrow"></div>
        </div>
        <ul class="dropdown-list hidden"></ul>
    `;

    options.forEach((opt) => {
        const dropdownOpt = document.createElement('li');
        dropdownOpt.textContent = opt;

        const selectedValue = container.querySelector('.selected-value');

        if (userConfig) {
            if (opt === userConfig) {
                dropdownOpt.classList.add('selected');
                selectedValue.textContent = opt;
            }
        } else {
            if (opt === defaultConfig) {
                dropdownOpt.classList.add('selected');
                selectedValue.textContent = opt;
            }
        }

        container.querySelector('.dropdown-list').append(dropdownOpt);
    });

    parent.append(titleEl, container);
}

function handleDropdown() {
    const containers = document.querySelectorAll('.dropdown-container');

    containers.forEach((ctn) => {
        const setting = ctn.dataset.setting;

        const selectButton = ctn.querySelector('.select-button');
        const selectedValue = selectButton.querySelector('.selected-value');

        const dropdown = ctn.querySelector('.dropdown-list');
        const options = dropdown.querySelectorAll('li');

        const toggleDropdown = (expand = null) => {
            const isOpen = expand !== null ? expand : dropdown.classList.contains('hidden');
            dropdown.classList.toggle('hidden', !isOpen);
        };

        const handleOptionSelect = async (option) => {
            const optionContent = option.textContent.trim();

            options.forEach((opt) => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedValue.textContent = optionContent;

            await backend.saveSetting({ [setting]: optionContent });
        };

        // Handle option selection
        options.forEach((option) => {
            option.addEventListener('click', async () => {
                await handleOptionSelect(option);
                toggleDropdown(false);
            });
        });

        // Handle dropdown toggling
        selectButton.addEventListener('click', () => toggleDropdown());

        // Handle outside click
        document.addEventListener('click', (e) => {
            const isOutsideClick = !ctn.contains(e.target);

            if (isOutsideClick) {
                toggleDropdown(false);
            }
        });
    });
}

// --------
// Checkbox
// --------

function createCheckbox(parent, name, title, defaultConfig, userConfig = null) {
    const container = document.createElement('label');
    container.classList.add('checkbox-container');
    container.dataset.setting = name;

    container.innerHTML = `
        <span>${title}</span>
        <input type="checkbox" name="checkbox-${name}" id="checkbox-${name}" hidden>
        <div class="checkbox"></div>
    `;

    container.querySelector('input').checked = userConfig ? userConfig : defaultConfig;

    parent.append(container);
}

function handleCheckbox() {
    const containers = document.querySelectorAll('.checkbox-container');

    containers.forEach((ctn) => {
        const setting = ctn.dataset.setting;
        const input = ctn.querySelector('input');

        input.addEventListener('change', async () => {
            await backend.saveSetting({ [setting]: input.checked });
        });
    });
}

// -------------
// Dot animation
// -------------

function startDotAnimation(el, text, intervalMs = 500) {
    // Make sure previous animation are stopped
    stopDotAnimation(el);

    // Improve animation flow by setting text first
    el.textContent = text;

    let dots = 0;

    const timer = setInterval(() => {
        dots = (dots + 1) % 4;
        el.textContent = text + '.'.repeat(dots);
    }, intervalMs);

    dotAnimations.set(el, timer);
}

function stopDotAnimation(el, finalText = null) {
    const timer = dotAnimations.get(el);

    if (timer) {
        clearInterval(timer);
        dotAnimations.delete(el);
    }

    if (finalText) {
        el.textContent = finalText;
    }
}

// -------
// Backend
// -------

function initBackend() {
    return {
        loadSetting: async () => await fetchJson('/load-settings', 'GET'),
        saveSetting: async (setting) => await fetchJson('/save-setting', 'POST', setting),
        startDownload: async (urls) => await fetchJson('/start-download', 'POST', urls),
        getVideoInfo: async (urls) => await fetchJson('/get-video-info', 'POST', urls),
    };
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

// ---------
// Utilities
// ---------

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function disableHomeComponents(cursorStyle = 'not-allowed', disabled = true) {
    youtubeLinks.disabled = disabled;
    linksSubmit.disabled = disabled;

    youtubeLinks.style.cursor = cursorStyle;
    linksSubmit.style.cursor = cursorStyle;
}