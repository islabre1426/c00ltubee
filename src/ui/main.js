window.addEventListener('pywebviewready', () => {
    console.log('Pywebview is ready.');
    main();
});

function main() {
    const sidebarMain = document.getElementById('sidebar-main');
    const sidebarButton = document.getElementById('sidebar-button');
    const addUrlsButton = document.getElementById('add-urls-button');

    let isSidebarExtended = false;

    sidebarButton.addEventListener('click', () => toggleSidebar(!isSidebarExtended));

    addUrlsButton.addEventListener('click', () => {
        const currentContent = sidebarMain.dataset.contentType;

        if (isSidebarExtended && currentContent === 'add-urls') {
            toggleSidebar(false);
            return;
        }

        if (currentContent !== 'add-urls') {
            renderAddUrlsUI();
        }

        toggleSidebar(true);
    });

    function renderAddUrlsUI() {
        sidebarMain.dataset.contentType = 'add-urls';
        sidebarMain.classList.add('add-urls-container');

        sidebarMain.innerHTML = `
        <header>
            <span>Add URLs to Download</span>
        </header>
        <main>
            <textarea id="urls"></textarea>
        </main>
        <footer>
            <button id="inject-button">Inject!!</button>
        </footer>
        `;
    }

    function createDownloadCard(title, id) {
        const container = document.createElement('div');
        container.classList.add('download-card');
        container.dataset.cardId = id;

        container.innerHTML = `
        <div class="info">
            <div class="title">${title}</div>
            <div class="status"></div>
        </div>
        <div class="operation">
            <button class="card-cancel">Cancel</button>
            <button class="card-view">&gt;</button>
        </div>
        `;
    }

    function toggleSidebar(state) {
        isSidebarExtended = state;
        const newWidth = Math.floor(window.innerWidth * 0.5);

        pywebview.api.extendSidebar(isSidebarExtended);

        sidebarMain.style.width = isSidebarExtended ? `${newWidth}px` : 'initial';
        sidebarMain.style.display = isSidebarExtended ? 'flex' : 'none';
        sidebarButton.textContent = isSidebarExtended ? '<' : '>';
    }
}