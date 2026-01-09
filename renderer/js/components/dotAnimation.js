const animations = new WeakMap();

export function startDotAnimation(el, text, intervalMs = 500) {
    // Make sure previous animation are stopped
    stopDotAnimation(el);

    // Improve animation flow by setting text first
    el.textContent = text;

    let dots = 0;

    const timer = setInterval(() => {
        dots = (dots + 1) % 4;
        el.textContent = text + '.'.repeat(dots);
    }, intervalMs);

    animations.set(el, timer);
}

export function stopDotAnimation(el, finalText = null) {
    const timer = animations.get(el);

    if (timer) {
        clearInterval(timer);
        animations.delete(el);
    }

    if (finalText) {
        el.textContent = finalText;
    }
}