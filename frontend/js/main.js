import { attachApi } from "./api.js";
import { handleAddUrlsButton } from "./components/addUrls.js";
import { handleDeleteAllHistory, populateHistory } from "./components/history.js";
import { changePage } from "./components/navigation.js";
import { createAllSettingCards } from "./components/settings.js";
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
const clearHistoryButton = document.getElementById('clear-history-button');

await populateHistory();
await createAllSettingCards();

navPrev.addEventListener('click', () => changePage(-1));
navNext.addEventListener('click', () => changePage(+1));

sidebarButton.addEventListener('click', async () => await toggleSidebar(!state.isSidebarExtended));

addUrlsButton.addEventListener('click', async () => await handleAddUrlsButton());

clearHistoryButton.addEventListener('click', async () => await handleDeleteAllHistory());