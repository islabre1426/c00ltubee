import { getBackend } from "../backend.js";

const backend = getBackend();

export function createCheckbox(parent, name, title, defaultConfig, userConfig = null) {
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

export function handleCheckbox() {
    const containers = document.querySelectorAll('.checkbox-container');

    containers.forEach((ctn) => {
        const setting = ctn.dataset.setting;
        const input = ctn.querySelector('input');

        input.addEventListener('change', async () => {
            await backend.saveSetting({ [setting]: input.checked });
        });
    });
}