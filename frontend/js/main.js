import { attachApi } from "./api.js";
import { handleAddUrlsButton } from "./components/addUrls.js";
import { handleDialog } from "./components/dialog.js";
import { handleClearHistoryButton, populateHistory } from "./components/history.js";
import { handleNavigation } from "./components/navigation.js";
import { createAllSettingCards } from "./components/settings.js";
import { handleSidebarButton } from "./components/sidebar.js";
import { watchContainerOverflow } from "./support.js";

export const api = attachApi();
export const state = {
    isSidebarExtended: false,
    pollers: {},
};

await populateHistory();
await createAllSettingCards();

handleNavigation();
handleSidebarButton();
handleClearHistoryButton();
handleDialog();
handleAddUrlsButton();

watchContainerOverflow();