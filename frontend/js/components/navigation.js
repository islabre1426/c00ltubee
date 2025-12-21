export function navigateContent(button, navButtonsEl, navContentsEl) {
    const navData = button.dataset.nav;
    const navContent = document.querySelector(`main > div[data-nav="${navData}"]`);

    navButtonsEl.forEach((btn) => btn.classList.remove('active'));
    navContentsEl.forEach((content) => content.classList.remove('active'));

    button.classList.add('active');
    navContent.classList.add('active');
}