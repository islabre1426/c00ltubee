import { api } from '../main.js';

export async function createAllSettingCards() {
    const response = await api.getSettings();
    const settings = response.settings;

    const settingsAmount = settings.length;
    const emptyCardNeeded = (settingsAmount % 2 !== 0) ? true : false;

    settings.forEach((setting) => {
        const value = setting.user_value ? setting.user_value : setting.default_value;

        createSettingCard(setting.name, setting.value_type, value);

        // Apply appearance settings on startup
        applyAppearanceSetting(setting.name, value);
    });

    if (emptyCardNeeded) {
        createSettingCard('empty', 'empty', 'empty');
    }
}

function createSettingCard(name, type, value) {
    const container = document.createElement('div');
    container.classList.add('setting-card');
    container.dataset.name = name;

    container.innerHTML = `
    <div class="name">${snakeToTitleCase(name)}</div>
    `;

    switch (type) {
        case 'text':
            container.innerHTML += `
            <input type="text" name="value" value="${value}">
            `;
            break;
        
        case 'boolean':
            const isChecked = value === 'true' ? 'checked' : '';

            container.innerHTML += `
            <input type="checkbox" name="value" id="${name}-value" ${isChecked}>
            <label for="${name}-value">${value}</label>
            `;
            break;
        
        case 'location_folder':
            container.innerHTML += `
            <input type="button" class="location_folder" name="value" value="${value}">
            `;
            break;
        
        // Empty card for filling remaining space
        case 'empty':
            container.innerHTML = '';
            container.classList.add('empty');
            break;
    }

    document.querySelector('.content-main[data-page="Settings"] main').appendChild(container);

    if (type === 'empty') return;

    const input = container.querySelector('input');

    switch (type) {
        case 'text':
            input.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    await handleSettingChange(input, name)
                }
            });
            break;

        case 'boolean':
            input.addEventListener('click', async () => {
                await handleSettingChange(input, name);

                container.querySelector(`label[for="${name}-value"]`).textContent = input.checked;
            });

            break;
        
        case 'location_folder':
            input.addEventListener('click', async () => {
                const picker = await api.folderPicker();
                const selectedFolder = picker['selectedFolder'];

                await handleSettingChange(input, name, selectedFolder);
            })
            break;
    }
}

async function handleSettingChange(element, name, value = null) {
    let chosenValue = value;

    if (!chosenValue) {
        chosenValue = element.type === 'checkbox' ? element.checked : element.value;
    }

    await api.saveSetting(name, chosenValue);

    applyAppearanceSetting(name, chosenValue);
}

function applyAppearanceSetting(name, value) {
    const rootStyle = document.documentElement.style;

    switch (name) {
        case 'text_color':
            rootStyle.setProperty('--text-color', value);
            break;
        
        case 'outline_color':
            rootStyle.setProperty('--outline-color', value);
            break;

        case 'background':
            rootStyle.setProperty('--background', value);
            break;
        
        case 'app_title':
            document.getElementById('title').textContent = value;
            break;
    }
}

function snakeToTitleCase(str) {
    if (typeof str !== 'string') return '';

    const words = str.split('_').filter((word) => word.length > 0);

    const titleCaseWords = words.map((word) => {
        return word[0].toUpperCase() + word.slice(1).toLowerCase();
    });

    return titleCaseWords.join(' ');
}