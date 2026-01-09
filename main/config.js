import nodePath from 'node:path';
import nodeOs from 'node:os';
import nodeFs from 'node:fs/promises';

const rootDir = nodePath.join(import.meta.dirname);
const vendorDir = nodePath.join(rootDir, '..', 'vendor');

const currentOs = process.platform;
let userConfigFolder;

switch (currentOs) {
    case 'win32':
        userConfigFolder = nodePath.join(process.env['LOCALAPPDATA'], 'c00ltubee');
        break;
    case 'linux':
        userConfigFolder = nodePath.join(nodeOs.homedir(), '.config', 'c00ltubee');
        break;
    default:
        userConfigFolder = nodePath.join(import.meta.dirname);
}

const userConfigFile = nodePath.join(userConfigFolder, 'config.json');

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

export async function loadUserSetting() {
    // Silently ignore on the renderer side if the config file does not exist
    try {
        const contents = await nodeFs.readFile(userConfigFile, { encoding: 'utf8' });
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

    // Make sure the config folder exists
    let configFolderExists;
    try {
        configFolderExists = await nodeFs.opendir(userConfigFolder);
    } catch (err) {
        await nodeFs.mkdir(userConfigFolder, { recursive: true });
    } finally {
        configFolderExists?.close();
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