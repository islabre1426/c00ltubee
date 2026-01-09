export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function disableHomeComponents(youtubeLinks, linksSubmit, disabled = true) {
    youtubeLinks.disabled = disabled;
    linksSubmit.disabled = disabled;

    if (disabled) {
        youtubeLinks.style.cursor = 'not-allowed';
        linksSubmit.style.cursor = 'not-allowed';
    } else {
        youtubeLinks.style.cursor = 'auto';
        linksSubmit.style.cursor = 'pointer';
    }
}