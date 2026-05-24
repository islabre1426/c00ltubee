import sys
import json
import os
from pathlib import Path

from backend.util import get_root_dir


_vendor_dir = Path(get_root_dir(), '..', 'vendor')

_downloader_opts = {
    'paths': {
        'home': str(Path(Path.home(), 'Downloads')),
    },
    'outtmpl': {
        'default': r'%(title)s.%(ext)s',
    },
    'noplaylist': True,
    'color': 'never',
    'ffmpeg_location': str(Path(_vendor_dir, 'ffmpeg', 'bin')),
    'js_runtimes': {
        'quickjs': {
            'path': str(Path(_vendor_dir, 'quickjs', 'qjs.exe')),
        }
    },
    'format': 'bestvideo+bestaudio/best',
    'merge_output_format': 'mp4',
}

_appearance_opts = {
    'text_color': 'white',
    'outline_color': 'red',
    'background': 'black',
    'app_title': 'c00ltubee',
}


def _get_config_location() -> Path:
    match sys.platform:
        case 'win32':
            return Path(os.environ['LOCALAPPDATA'], 'c00ltubee', 'config.json')

        case 'linux':
            return Path(Path.home(), '.config', 'c00ltubee', 'config.json')

        case _:
            raise RuntimeError(f'Unsupported platform: {sys.platform}')


_config_file = _get_config_location()


def load_config_file() -> dict | None:
    if _config_file.exists():
        with _config_file.open() as f:
            return json.load(f)
    
    return None


def save_config_file(opts: dict):
    def save_json(file: Path, obj: dict):
        with file.open('w') as f:
            json.dump(obj, f, indent = 4)

    config = load_config_file()

    if config is None:
        _config_file.mkdir(parents = True)
        save_json(_config_file, opts)
        return
    
    config.update(opts)

    save_json(_config_file, config)


def process_downloader_opts():
    opts = _downloader_opts

    config = load_config_file()

    if config is None:
        return opts
    
    if 'default_video_format' in config:
        opts.update({
            'merge_output_format': config['default_video_format'],
        })

    if 'default_audio_format' in config:
        preferred_audio_format = config['default_audio_format']
    else:
        preferred_audio_format = 'mp3'
    
    if 'audio_only' in config:
        opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': preferred_audio_format,
            }],
        })  # ty:ignore[no-matching-overload]

        opts.pop('merge_output_format')
    
    if 'output_file_name' in config:
        opts.update({
            'outtmpl': {
                'default': config['output_file_name'],
            },
        })
    
    if 'download_location' in config:
        opts.update({
            'paths': {
                'home': config['download_location'],
            },
        })
    
    return opts


def process_appearance_opts():
    opts = _appearance_opts

    config = load_config_file()

    if config is None:
        return opts
    
    opts.update(config)

    return opts