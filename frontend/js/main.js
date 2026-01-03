import { navigateContent } from "./components/navigation.js";
import { createList, resetDownloadList } from "./components/downloadList.js";
import { createAllSettings } from "./components/settings.js";
import { handleDropdown } from "./components/dropdownMenu.js";
import { handleCheckbox } from "./components/checkbox.js";
import { startDotAnimation, stopDotAnimation } from "./components/dotAnimation.js";
import { getBackend } from "./backend.js";
import { disableHomeComponents } from "./util.js";
import { onMessage } from "./sse.js";
import { handleFolderPicker } from "./components/folderPicker.js";


const navButtons = document.querySelectorAll('header nav button');
const navContents = document.querySelectorAll('main > div');
const list = document.querySelector('.list');
const settingsEl = document.querySelector('.settings');
const youtubeLinks = document.getElementById('youtube-links');
const linksSubmit = document.getElementById('links-submit');

const backend = getBackend();
const settings = await backend.loadSettings();
backend.subscribeEvent(onMessage);

// UI handling
createAllSettings(
    settingsEl,
    settings.result[0],
    settings.has_user_config ? settings.result[1] : null,
);

handleDropdown();
handleCheckbox();
handleFolderPicker();

navButtons.forEach((button) => {
    button.addEventListener('click', () => navigateContent(button, navButtons, navContents));
});

linksSubmit.addEventListener('click', async () => {
    // Prevent duplication of card inside list
    resetDownloadList(list);

    const urls = youtubeLinks.value.trim().split('\n');

    startDotAnimation(linksSubmit, 'Injecting');
    disableHomeComponents(youtubeLinks, linksSubmit);

    try {
        const infoResp = await backend.getVideoInfo(urls);
        createList(list, infoResp.results);

        stopDotAnimation(linksSubmit);
        startDotAnimation(linksSubmit, 'Injected!! Downloading');

        await backend.startDownload(urls);
    } catch (err) {
        stopDotAnimation(linksSubmit, 'Error!!');
        disableHomeComponents(youtubeLinks, linksSubmit, false);
        throw err;
    }
});