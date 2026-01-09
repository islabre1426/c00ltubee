import { getBackend } from "../backend.js";

const backend = getBackend();

export function createFolderPicker(parent, name, title, defaultConfig, userConfig = null) {
    const container = document.createElement('div');
    container.classList.add('folder-picker-container');
    container.dataset.setting = name;

    container.innerHTML = `
        <span class="label">${title}</span>
        <div>
            <span class="path"></span>
            <button type="button">Browse</button>
        </div>
    `;

    container.querySelector('.path').textContent = userConfig ? userConfig : defaultConfig;

    parent.append(container);
}

export function handleFolderPicker() {
    const containers = document.querySelectorAll('.folder-picker-container');

    containers.forEach((ctn) => {
        const setting = ctn.dataset.setting;
        const path = ctn.querySelector('.path');
        const browseBtn = ctn.querySelector('button');

        browseBtn.addEventListener('click', async () => {
            const chooseFolder = await backend.browseFolder();

            const result = chooseFolder.result;

            // Empty string or "." means cancelled
            if (result !== "" && result !== ".") {
                path.textContent = result;
                await backend.saveSetting({ [setting]: result });
            }
        });
    });
}