from pathlib import Path
import platform

from yt_dlp import YoutubeDL

from . import util

ROOT_DIR = util.get_root()
VENDOR_DIR = Path(ROOT_DIR, 'vendor')
CURRENT_OS = platform.system().lower()

match CURRENT_OS:
    case 'windows':
        deno_exe = 'deno.exe'
    case 'linux':
        deno_exe = 'deno'

FFMPEG_LOCATION = str(Path(VENDOR_DIR, 'ffmpeg', CURRENT_OS, 'bin'))
DENO_LOCATION = str(Path(VENDOR_DIR, 'deno', deno_exe))
DOWNLOAD_LOCATION = str(Path(Path.home(), 'Downloads'))

YDL_OPTS = {
    'color': False,
    'ffmpeg_location': FFMPEG_LOCATION,
    'js_runtimes': {
        'deno': {
            'path': DENO_LOCATION,
        },
    },
    'paths': {
        'home': DOWNLOAD_LOCATION,
    },
    'verbose': True,
}


def start_download(urls: list[str], additional_opts: dict):
    opts = {
        **YDL_OPTS,
        **additional_opts,
    }

    with YoutubeDL(opts) as ydl:
        ydl.download(urls)