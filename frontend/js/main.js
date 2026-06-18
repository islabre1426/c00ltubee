import { attachApi } from "./api.js";
import { handleAddUrlsButton } from "./components/addUrls.js";
import { populateHistory } from "./components/history.js";
import { changePage } from "./components/navigation.js";
import { toggleSidebar } from "./components/sidebar.js";

export const api = attachApi();
export const state = {
    isSidebarExtended: false,
    pollers: {},
};

const navPrev = document.getElementById('nav-prev');
const navNext = document.getElementById('nav-next');
const sidebarButton = document.getElementById('sidebar-button');
const addUrlsButton = document.getElementById('add-urls-button');

await populateHistory();

navPrev.addEventListener('click', () => changePage(-1));
navNext.addEventListener('click', () => changePage(+1));

sidebarButton.addEventListener('click', async () => await toggleSidebar(!state.isSidebarExtended));

addUrlsButton.addEventListener('click', async () => await handleAddUrlsButton());