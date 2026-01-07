// import { BrowserWindow } from 'electron';

const subscribers = new Set();

export function subscribe(win) {
    subscribers.add(win);
}

export function unsubscribe(win) {
    subscribers.delete(win);
}

export function emit(event) {
    for (const win of subscribers) {
        if (!win.isDestroyed()) {
            win.webContents.send('download-event', event);
        }
    }
}