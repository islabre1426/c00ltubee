import { api, state } from '../main.js';

export async function toggleSidebar(sidebarState) {
    const sidebarMain = document.getElementById('sidebar-main');
    const sidebarButton = document.getElementById('sidebar-button');

    state.isSidebarExtended = sidebarState;
    const newWidth = Math.floor(window.innerWidth * 0.5);

    await api.extendSidebar(sidebarState);

    sidebarMain.style.width = state.isSidebarExtended ? `${newWidth}px` : 'initial';
    sidebarMain.style.display = state.isSidebarExtended ? 'flex' : 'none';
    sidebarButton.textContent = state.isSidebarExtended ? '<' : '>';
}