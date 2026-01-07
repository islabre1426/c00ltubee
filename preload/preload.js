/*
Provide API bridge between main and renderer processes.
*/

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    saveSetting: (setting) => ipcRenderer.invoke('save-setting', setting),
    startDownload: (urls) => ipcRenderer.invoke('start-download', urls),
    getVideoInfo: (urls) => ipcRenderer.invoke('get-video-info', urls),
    downloadEvents: (handler) => {
        // Avoid stacked listeners
        ipcRenderer.removeAllListeners('download-event');
        
        ipcRenderer.on('download-event', (_, event) => {
            handler(event);
        });
    },
    browseFolder: () => ipcRenderer.invoke('browse-folder'),
});