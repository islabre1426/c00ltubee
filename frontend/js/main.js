import { attachApi } from "./api.js";
import { handleAddUrlsButton } from "./components/addUrls.js";
import { toggleSidebar } from "./components/sidebar.js";

export const api = attachApi();
export const state = {
    isSidebarExtended: false,
    pollers: {},
};

const sidebarButton = document.getElementById('sidebar-button');
const addUrlsButton = document.getElementById('add-urls-button');

sidebarButton.addEventListener('click', async () => await toggleSidebar(!state.isSidebarExtended));

addUrlsButton.addEventListener('click', async () => await handleAddUrlsButton());