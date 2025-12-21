import { createDropdown } from "./dropdownMenu.js";
import { createCheckbox } from "./checkbox.js";

export function createAllSettings(settingsEl, globalConfig, userConfig = null) {
    if (!settingsEl.querySelector('ul')) {
        const newUl = document.createElement('ul');
        settingsEl.append(newUl);
    }

    const ul = settingsEl.querySelector('ul');

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