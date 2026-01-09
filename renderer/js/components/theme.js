export function handleThemeOnLoad(theme) {
    document.body.className = theme;
    handleTheme(theme)
}

export function handleThemeChoose() {
    const themeDropdown = document.querySelector('.dropdown-container[data-setting="theme"]');

    const themeOptions = themeDropdown.querySelectorAll('.dropdown-list li');

    themeOptions.forEach((option) => {
        option.addEventListener('click', () => {
            const theme = option.textContent;

            document.body.className = theme;
            handleTheme(theme);
        });
    });
}

function handleTheme(theme) {
    const header = document.querySelector('header span');

    switch (theme) {
        case 'bluudud':
            header.textContent = 'bluutubee';
            break;
        case 'pr3typriincess':
            header.textContent = 'pr3tytubee';
            break;
        default:
            header.textContent = 'c00ltubee';
    }
}