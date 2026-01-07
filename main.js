import { app, BrowserWindow } from 'electron';
import nodePath from 'node:path';

const createWindow = () => {
    const win = new BrowserWindow({
        title: 'c00ltubee',
        width: 1280,
        height: 720,
        webPreferences: {
            preload: nodePath.join(import.meta.dirname, 'preload.js'),
        },
    })

    win.loadFile(nodePath.join(import.meta.dirname, 'frontend-dist', 'index.html'));
};

app.whenReady().then(() => {
    createWindow();

    // On MacOS, activate the app with no windows open = open a new one
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    })
})

// On Windows and Linux, closing all windows = terminating it
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})