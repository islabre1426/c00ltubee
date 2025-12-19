from pathlib import Path
import platform

from yt_dlp import YoutubeDL

from . import util, app

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
    'color': 'never',
    'ffmpeg_location': FFMPEG_LOCATION,
    'js_runtimes': {
        'deno': {
            'path': DENO_LOCATION,
        },
    },
    'paths': {
        'home': DOWNLOAD_LOCATION,
    },
}


def get_video_info(urls: list[str], results_list: list[dict]):
    with YoutubeDL(YDL_OPTS) as ydl:
        for url in urls:
            info = ydl.extract_info(url, download = False)
            info = ydl.sanitize_info(info)

            results_list.append({
                'id': info['id'],
                'title': info['title'],
            })

def start_download(urls: list[str], additional_opts: dict):
    def hook(d):
        if d['status'] == 'downloading':
            app.event_queue.put({
                'type': 'progress',
                'id': d['info_dict']['id'],
                'percent': float(d['_percent_str'].strip('%')),
            })
        elif d['status'] == 'finished':
            app.event_queue.put({
                'type': 'finished',
                'id': d['info_dict']['id'],
            })

    opts = {
        **YDL_OPTS,
        **additional_opts,
        'progress_hooks': [hook],
    }

    for url in urls:
        with YoutubeDL(opts) as ydl:
            ydl.download(url)