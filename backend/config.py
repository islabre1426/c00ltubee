from pathlib import Path
import json

GLOBAL_SETTINGS = {
    'download_location': {
        'title': 'Download location',
        'type': 'folder-picker',
        'default': str(Path(Path.home(), 'Downloads')),
    }
}

DOWNLOADER_SETTINGS = {
    'default_video_format': {
        'title': 'Default video format',
        'type': 'dropdown',
        'default': 'mp4',
        'options': ['mp4', 'webm'],
    },
    'default_audio_format': {
        'title': 'Default audio format',
        'type': 'dropdown',
        'default': 'mp3',
        'options': ['mp3', 'opus'],
    },
    'audio_only': {
        'title': 'Audio only',
        'type': 'checkbox',
        'default': False,
    }
}

ROOT_DIR = Path(__file__).parent.parent.resolve()
VENDOR_DIR = Path(ROOT_DIR, 'vendor')
USER_CONFIG_FILE = Path(ROOT_DIR, 'config.json')


def load_user_setting() -> dict | None:
    try:
        with USER_CONFIG_FILE.open() as f:
            content = f.read()

            # Only load if it is not empty
            if content:
                return json.loads(content)
    except FileNotFoundError:
        return None
    except json.JSONDecodeError:
        raise RuntimeError(f'ERROR: Failed to decode user config file {USER_CONFIG_FILE}')
    

def save_user_setting(setting: dict) -> None:
    def save_json(file: Path, obj: dict) -> None:
        with file.open('w') as f:
            f.write(json.dumps(obj, indent = 4))
            return None

    config = load_user_setting()

    if config is None:
        save_json(USER_CONFIG_FILE, setting)
        return None
    
    config.update(setting)

    save_json(USER_CONFIG_FILE, config)
    return None


def get_all_settings():
    settings = {}

    for s in GLOBAL_SETTINGS:
        settings.update({
            s: GLOBAL_SETTINGS[s]['default']
        })

    for s in DOWNLOADER_SETTINGS:
        settings.update({
            s: DOWNLOADER_SETTINGS[s]['default']
        })

    user_settings = load_user_setting()

    if user_settings is not None:
        settings.update(user_settings)
    
    return settings