import { updateCardProgress } from "./components/downloadList.js";
import { getActiveDownloads, setActiveDownloads } from "./components/downloadList.js";
import { stopDotAnimation } from "./components/dotAnimation.js";
import { disableHomeComponents } from "./util.js";
import { sleep } from "./util.js";

const youtubeLinks = document.getElementById('youtube-links');
const linksSubmit = document.getElementById('links-submit');
const originalLinksSubmitText = linksSubmit.textContent;

export async function onMessage(data) {
    switch (data.type) {
        case 'progress':
            updateCardProgress(data.id, data.percent, data.percent + '%');
            break;
        case 'finished':
            let activeDownloads = getActiveDownloads();

            updateCardProgress(data.id, 100, 'Done');
            setActiveDownloads(activeDownloads--);

            if (activeDownloads === 0) {
                stopDotAnimation(linksSubmit, 'Download finished!');
                disableHomeComponents(youtubeLinks, linksSubmit, false);

                await sleep(5000);

                linksSubmit.textContent = originalLinksSubmitText;
            }

            break;
    }
}