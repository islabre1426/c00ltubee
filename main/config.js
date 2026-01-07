import nodePath from 'node:path';
import nodeOs from 'node:os';
import nodeFs from 'node:fs/promises';

export const globalSettings = {
    theme: {
        title: 'Theme',
        type: 'dropdown',
        default: 'c00lkidd',
        options: ['c00lkidd', 'bluudud', 'pr3typriincess'],
    },
};

export const downloaderSettings = {
    defaultVideoFormat: {
        title: 'Default video format',
        type: 'dropdown',
        default: 'mp4',
        options: ['mp4', 'webm'],
    },
    defaultAudioFormat: {
        title: 'Default audio format',
        type: 'dropdown',
        default: 'mp3',
        options: ['mp3', 'opus'],
    },
    audioOnly: {
        title: 'Audio only',
        type: 'checkbox',
        default: false,
    },
    downloadLocation: {
        title: 'Download location',
        type: 'folder-picker',
        default: nodePath.join(nodeOs.homedir(), 'Downloads'),
    }
};

const rootDir = nodePath.join(import.meta.dirname);
const vendorDir = nodePath.join(rootDir, 'vendor');
const userConfigFile = nodePath.join(rootDir, 'config.json');

export async function loadUserSetting() {
    try {
        const contents = await nodeFs.readFile(userConfigFile, {
            encoding: 'utf8',
        });

        return JSON.parse(contents);
    } catch (err) {
        console.error(err);
    }
}

export async function saveUserSetting(setting) {
    const saveAsJson = async (file, obj) => {
        const objStr = JSON.stringify(obj, null, 4);

        try {
            await nodeFs.writeFile(file, objStr, {
                encoding: 'utf-8',
            });
        } catch (err) {
            console.error(err);
        }
    };

    let userSettings = await loadUserSetting();

    if (userSettings) {
        setting = {
            ...userSettings,
            ...setting,
        };
    }

    await saveAsJson(userConfigFile, setting);
}

export async function getAllSettings() {
    let settings = {};

    Object.keys(globalSettings).forEach((s) => {
        settings = {
            ...settings,
            s: globalSettings[s]['default'],
        };
    });

    Object.keys(downloaderSettings).forEach((s) => {
        settings = {
            ...settings,
            s: downloaderSettings[s]['default']
        }
    });

    const userSettings = await loadUserSetting();

    if (userSettings) {
        settings = {
            ...settings,
            ...userSettings,
        };
    }

    return settings;
}