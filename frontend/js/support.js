let contentObserver = null;

export function watchContainerOverflow() {
    if (scrollStateSupported()) return;

    const contentMain = document.querySelector('.content-main[data-page="Home"] main');
    if (!contentMain) return;

    contentObserver = new ResizeObserver(() => {
        const supportApplied = contentMain.classList.contains('scroll-state-support');
        const overflowing = isYOverFlown(contentMain);

        if (overflowing && !supportApplied) {
            contentMain.classList.add('scroll-state-support');
        } else if (!overflowing && supportApplied) {
            contentMain.classList.remove('scroll-state-support');
        }
    });

    contentObserver.observe(contentMain);
}

function isYOverFlown(element) {
    return element.scrollHeight > element.clientHeight;
}

function scrollStateSupported() {
    return CSS.supports('container-type', 'scroll-state');
}