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

eventSource.addEventListener('message', async (e) => {
    const data = JSON.parse(e.data);

    switch (data.type) {
        case 'progress':
            updateCardProgress(data.id, data.percent, data.percent + '%');
            break;
        case 'finished':
            updateCardProgress(data.id, 100, 'Done');
            activeDownloads--;

            if (activeDownloads === 0) {
                stopDotAnimation(linksSubmit, 'Download finished!');
                linksSubmit.disabled = false;
                linksSubmit.style.cursor = 'auto';

                await sleep(5000);

                linksSubmit.textContent = originalLinksSubmitText;
            }

            break;
    }
});

// UI handling
if (settings.has_user_config) {
    createAllSettings(settingsEl, settings.result[0], settings.result[1]);
} else {
    createAllSettings(settingsEl, settings.result[0]);
}

// Important: Only handle the following after all settings are loaded!
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
    linksSubmit.disabled = true;
    linksSubmit.style.cursor = 'not-allowed';

    try {
        const infoResp = await backend.getVideoInfo(urls);
        createList(list, infoResp.results);

        stopDotAnimation(linksSubmit);
        startDotAnimation(linksSubmit, 'Injected!! Downloading');

        await backend.startDownload(urls);
    } catch (err) {
        stopDotAnimation(linksSubmit, 'Error!!');
        throw err;
    }
});



function navigateContent(button) {
    const navData = button.dataset.nav;
    if (!navData) return;

    const navContent = document.querySelector(`main > div[data-nav="${navData}"]`);
    if (!navContent) return;

    navButtons.forEach((btn) => btn.classList.remove('active'));
    navContents.forEach((content) => content.classList.remove('active'));

    button.classList.add('active');
    navContent.classList.add('active');
}

function createList(parent, videoInfos) {
    activeDownloads += videoInfos.length;

    // Create list if it doesn't already exist
    if (!parent.querySelector('ol')) {
        const newOl = document.createElement('ol');
        parent.append(newOl);
    }

    const ol = parent.querySelector('ol');

    videoInfos.forEach((info) => {
        const li = document.createElement('li');
        createCard(li, info.title, info.id);
        ol.append(li);
    });
}

function createCard(parent, title, youtubeId) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = youtubeId;

    const titleEl = document.createElement('span');
    titleEl.textContent = title;

    const progressContainer = document.createElement('div');
    progressContainer.classList.add('progress-container');

    const hr = document.createElement('hr');

    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');

    const progress = document.createElement('div');
    progress.classList.add('progress');

    const status = document.createElement('span');
    
    startDotAnimation(status, 'Starting');

    progressBar.append(progress);
    progressContainer.append(hr, progressBar, hr.cloneNode(), status);
    card.append(titleEl, progressContainer);

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
            userConfig !== null ? userConfig[config] : null,
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

    const selectButton = document.createElement('div');
    selectButton.classList.add('select-button');

    const selectedValue = document.createElement('span');
    selectedValue.classList.add('selected-value');

    const arrow = document.createElement('div');
    arrow.classList.add('arrow');

    const dropdownList = document.createElement('ul');
    dropdownList.classList.add('dropdown-list', 'hidden');

    options.forEach((opt) => {
        const dropdownOpt = document.createElement('li');
        dropdownOpt.textContent = opt;

        if (userConfig !== null) {
            if (opt === userConfig) {
                dropdownOpt.classList.add('selected');
                selectedValue.textContent = opt;
            }
        } else {
            if (opt == defaultConfig) {
                dropdownOpt.classList.add('selected');
                selectedValue.textContent = opt;
            }
        }

        dropdownList.append(dropdownOpt);
    });

    selectButton.append(selectedValue, arrow);
    container.append(selectButton, dropdownList);
    parent.append(titleEl, container);
}

/*
    Handling custom dropdown.
    Reference: https://blog.logrocket.com/creating-custom-select-dropdown-css/#creating-custom-select-dropdown-scratch-css-javascript
*/
function handleDropdown() {
    const containers = document.querySelectorAll('.dropdown-container');

    containers.forEach((ctn) => {
        const setting = ctn.dataset.setting;
        const selectButton = ctn.querySelector('.select-button');
        const dropdown = ctn.querySelector('.dropdown-list');
        const options = dropdown.querySelectorAll('li');
        const selectedValue = selectButton.querySelector('.selected-value');

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

function createCheckbox(parent, name, title, defaultConfig, userConfig = null) {
    const container = document.createElement('label');
    container.classList.add('checkbox-container');
    container.dataset.setting = name;

    const titleEl = document.createElement('span');
    titleEl.textContent = title;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = `checkbox-${name}`;
    input.id = `checkbox-${name}`;
    input.hidden = true;
    input.checked = userConfig !== null ? userConfig : defaultConfig;

    const checkbox = document.createElement('div');
    checkbox.classList.add('checkbox');

    container.append(titleEl, input, checkbox);
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

function startDotAnimation(el, baseText, intervalMs = 500) {
    stopDotAnimation(el);

    let dots = 0;

    const timer = setInterval(() => {
        dots = (dots + 1) % 4;
        el.textContent = baseText + '.'.repeat(dots);
    }, intervalMs);

    dotAnimations.set(el, timer);
}

function stopDotAnimation(el, finalText = null) {
    const timer = dotAnimations.get(el);

    if (timer) {
        clearInterval(timer);
        dotAnimations.delete(el);
    }

    if (finalText !== null) {
        el.textContent = finalText;
    }
}

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function resetDownloadList() {
    document.querySelectorAll('.card .progress-container span').forEach(stopDotAnimation);

    list.innerHTML = '';
    activeDownloads = 0;
}

function initBackend() {
    return {
        loadSetting: async () => await fetchJson('/load-settings', 'GET'),
        saveSetting: async (setting) => await fetchJson('/save-setting', 'POST', setting),
        startDownload: async (urls) => await fetchJson('/start-download', 'POST', urls),
        getVideoInfo: async (urls) => await fetchJson('/get-video-info', 'POST', urls),
    };
}

async function fetchJson(url, method, body = null) {
    const resp = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body !== null ? JSON.stringify(body) : null,
    });

    if (!resp.ok) {
        throw new Error(`Fetching from ${url} failed: Server returned status ${resp.status}`);
    }

    const data = await resp.json();
    console.log(data);
    return data;
}