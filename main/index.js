import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import nodePath from 'node:path';
import { downloaderSettings, globalSettings, loadUserSetting, saveUserSetting } from './config.js';
import { subscribe, unsubscribe } from './events.js';
import { getVideoInfo, startDownload } from './yt-dlp.js';

const createWindow = () => {
    const win = new BrowserWindow({
        title: 'c00ltubee',
        width: 1280,
        height: 720,
        webPreferences: {
            preload: nodePath.join(import.meta.dirname, '..', 'preload', 'preload.js'),
        },
    });

    // Subscribe to download events
    subscribe(win);

    win.on('closed', () => {
        unsubscribe(win);
    });

    win.loadFile(nodePath.join(import.meta.dirname, '..', 'renderer', 'index.html'));
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

ipcMain.handle('load-settings', async (_) => {
    const userSettings = await loadUserSetting();

    let results = [
        [
            globalSettings,
            downloaderSettings,
        ],
    ];

    if (userSettings) {
        results.push(userSettings);
    };

    return {
        status: 'ok',
        hasUserConfig: userSettings ? true : false,
        result: results,
    };
});

ipcMain.handle('save-setting', async (_, setting) => {
    await saveUserSetting(setting);

    return {
        status: 'ok',
    };
});

ipcMain.handle('start-download', async (_, urls) => {
    await startDownload(urls);

    return {
        status: 'ok',
    }
});

ipcMain.handle('get-video-info', async (_, urls) => {
    const results = await getVideoInfo(urls);

    return {
        status: 'ok',
        results: results,
    }
});

ipcMain.handle('browse-folder', async (_) => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });

    return {
        status: 'ok',
        result: result.canceled ? null : result.filePaths[0],
    };
});