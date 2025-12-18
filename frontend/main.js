const navButtons = document.querySelectorAll('header nav button');
const navContents = document.querySelectorAll('main > div');
const list = document.querySelector('.list');
const settings = document.querySelector('.settings');

handleDropdown();

navButtons.forEach((button) => {
    button.addEventListener('click', () => navigateContent(button));
});

createAllSettings(settings, {
    default_video_format: {
        title: 'Default video format',
        type: 'dropdown',
        default: 'mp4',
        options: ['mp4', 'webm'],
    },
    audio_only: {
        title: 'Audio only',
        type: 'checkbox',
        default: false,
    },
})

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
    status.textContent = "Starting...";

    progressBar.append(progress);
    progressContainer.append(hr, progressBar, hr.cloneNode(), status);
    card.append(titleEl, progressContainer);

    parent.append(card);
}

function updateCardProgress(youtubeId, percent, status) {
    const card = document.querySelector(`.card[data-id="${youtubeId}"]`);
    if (!card) return;

    const progressContainer = card.querySelector('.progress-container');
    const progress = progressContainer.querySelector('.progress');
    const statusEl = progressContainer.querySelector('span');

    progress.style.width = `${percent}%`;
    statusEl.textContent = status;
}

function createAllSettings(parent, globalConfig, userConfig = null) {
    if (!parent.querySelector('ul')) {
        const newUl = document.createElement('ul');
        parent.append(newUl);
    }

    const ul = parent.querySelector('ul');

    Object.keys(globalConfig).forEach((config) => {
        const li = document.createElement('li');

        createSetting(li, config, globalConfig[config], userConfig);

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
    document.addEventListener('DOMContentLoaded', () => {
        const containers = document.querySelectorAll('.dropdown-container');
    
        containers.forEach((ctn) => {
            const selectButton = ctn.querySelector('.select-button');
            const dropdown = ctn.querySelector('.dropdown-list');
            const options = dropdown.querySelectorAll('li');
            const selectedValue = selectButton.querySelector('.selected-value');
    
            const toggleDropdown = (expand = null) => {
                const isOpen = expand !== null ? expand : dropdown.classList.contains('hidden');
                dropdown.classList.toggle('hidden', !isOpen);
            };
    
            const handleOptionSelect = (option) => {
                options.forEach((opt) => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedValue.textContent = option.textContent.trim();
            };
    
            // Handle option selection
            options.forEach((option) => {
                option.addEventListener('click', () => {
                    handleOptionSelect(option);
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
    })
}

function createCheckbox(parent, name, title, defaultConfig, userConfig = null) {
    const container = document.createElement('label');
    container.classList.add('checkbox-container');

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