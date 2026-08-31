import { api, state } from '../main.js';
import { handleCardViewRetract } from './downloadCard.js';

export function handleSidebarButton() {
    const sidebarButton = document.getElementById('sidebar-button');

    if (!sidebarButton) {
        throw new Error('sidebarButton not found');
    }

    sidebarButton.addEventListener('click', async () => await toggleSidebar(!state.isSidebarExtended));
}

export async function toggleSidebar(sidebarState) {
    const sidebarMain = document.getElementById('sidebar-main');
    const sidebarButton = document.getElementById('sidebar-button');

    if (!sidebarMain || !sidebarButton) {
        throw new Error('sidebarMain or sidebarButton not found');
    }

    state.isSidebarExtended = sidebarState;
    const newWidth = Math.floor(window.innerWidth * 0.5);

    await api.extendSidebar(sidebarState);

    sidebarMain.style.width = state.isSidebarExtended ? `${newWidth}px` : 'initial';
    sidebarMain.style.display = state.isSidebarExtended ? 'flex' : 'none';
    sidebarButton.textContent = state.isSidebarExtended ? '<' : '>';

    const id = sidebarMain.dataset.id;

    if (id) {
        handleCardViewRetract(id);
    }
}

export function cleanupSidebar() {
    const sidebarMain = document.getElementById('sidebar-main');

    if (!sidebarMain) {
        throw new Error('sidebarMain not found');
    }

    sidebarMain.innerHTML = '';
    sidebarMain.className = '';
    ['data-content-type', 'data-id'].forEach((attr) => sidebarMain.removeAttribute(attr));
}