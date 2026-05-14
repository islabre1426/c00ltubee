window.addEventListener('pywebviewready', () => {
    console.log('Pywebview is ready.');
    main();
});

function main() {
    const sidebarMain = document.getElementById('sidebar-main');
    const sidebarButton = document.getElementById('sidebar-button');

    let extend = false;

    sidebarButton.addEventListener('click', () => {
        const newWidth = Math.floor(window.innerWidth * 0.5);

        extend = !extend;
        pywebview.api.extendSidebar(extend);

        sidebarMain.style.width = extend ? `${newWidth}px` : 'initial';
        sidebarMain.style.display = extend ? 'block' : 'none';
        sidebarButton.textContent = extend ? '<' : '>';
    });
}