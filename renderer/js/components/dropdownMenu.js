import { getBackend } from "../backend.js";

const backend = getBackend();

export function createDropdown(parent, name, title, options, defaultConfig, userConfig = null) {
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

export function handleDropdown() {
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