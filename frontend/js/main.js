import { attachApi } from "./api.js";
import { handleAddUrlsButton } from "./components/addUrls.js";
import { handleDeleteHistory, populateHistory } from "./components/history.js";
import { handleNavigation } from "./components/navigation.js";
import { createAllSettingCards } from "./components/settings.js";
import { handleSidebarButton, toggleSidebar } from "./components/sidebar.js";

export const api = attachApi();
export const state = {
    isSidebarExtended: false,
    pollers: {},
};


const addUrlsButton = document.getElementById('add-urls-button');
const clearHistoryButton = document.getElementById('clear-history-button');
const confirmDialogYesAction = document.getElementById('confirm-yes');

await populateHistory();
await createAllSettingCards();

handleNavigation();
handleSidebarButton();

addUrlsButton.addEventListener('click', async () => await handleAddUrlsButton());

clearHistoryButton.addEventListener('click', () => {
    const dialogMessageElement = document.getElementById('confirm-message');
    dialogMessageElement.textContent = 'Are you sure to delete all history?';

    confirmDialogYesAction.dataset.action = 'delete-all-history';
});

confirmDialogYesAction.addEventListener('click', async () => {
    switch (confirmDialogYesAction.dataset.action) {
        case 'delete-all-history':
            await handleDeleteHistory('all');
            break;
        case 'delete-history':
            await handleDeleteHistory(confirmDialogYesAction.dataset.id);
            break;
    }
});