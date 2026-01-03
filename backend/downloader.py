from pathlib import Path
import platform

from yt_dlp import YoutubeDL

from . import app, config

CURRENT_OS = platform.system().lower()

match CURRENT_OS:
    case 'windows':
        deno_exe = 'deno.exe'
    case 'linux':
        deno_exe = 'deno'

FFMPEG_LOCATION = str(Path(config.VENDOR_DIR, 'ffmpeg', CURRENT_OS, 'bin'))
DENO_LOCATION = str(Path(config.VENDOR_DIR, 'deno', deno_exe))

YDL_OPTS = {
    'color': 'never',
    'ffmpeg_location': FFMPEG_LOCATION,
    'js_runtimes': {
        'deno': {
            'path': DENO_LOCATION,
        },
    },
}


def process_settings():
    settings = config.get_all_settings()

    video_format = settings['default_video_format']
    audio_format = settings['default_audio_format']
    audio_only = settings['audio_only']
    download_location = settings['download_location']

    result = {
        'paths': {
            'home': download_location,
        },
        'format': f'{video_format}/bestvideo*+bestaudio/best'
    }

    if audio_only:
        result.update({
            'format': f'{audio_format}/bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': audio_format,
            }]
        })

    return result


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
    
    downloader_settings = process_settings()

    opts = {
        **YDL_OPTS,
        **additional_opts,
        **downloader_settings,
        'progress_hooks': [hook],
        'outtmpl': {
            'default': '%(title)s.%(ext)s',
        },
    }

    with YoutubeDL(opts) as ydl:
        ydl.download(urls)