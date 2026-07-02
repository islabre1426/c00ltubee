from pathlib import Path

from database.setting import setting_db
from util.util import get_root_dir, current_os


def get_downloader_opts():
    vendor_dir = Path(get_root_dir(), 'vendor')
    qjs_exe = 'qjs.exe' if current_os == 'win32' else 'qjs'

    default_video_format = setting_db.get_value_by_name('default_video_format')
    default_audio_format = setting_db.get_value_by_name('default_audio_format')

    best_audio_format_for_video_format = ''

    match default_video_format:
        case 'mp4':
            best_audio_format_for_video_format = 'm4a'

    best_video = f'bestvideo*[ext={default_video_format}]'
    best_audio = f'bestaudio'

    if best_audio_format_for_video_format != '':
        best_audio += f'[ext={best_audio_format_for_video_format}]'

    format = f'{best_video}+{best_audio}/best'

    downloader_opts = {
        'paths': {
            'home': setting_db.get_value_by_name('download_location'),
        },
        'outtmpl': {
            'default': setting_db.get_value_by_name('output_template'),
        },
        'noplaylist': True,
        'color': 'never',
        'ffmpeg_location': str(Path(vendor_dir, 'ffmpeg', current_os, 'bin')),
        'js_runtimes': {
            'quickjs': {
                'path': str(Path(vendor_dir, 'quickjs', current_os, qjs_exe)),
            }
        },
        'format': format,
        'merge_output_format': default_video_format,
    }

    if setting_db.get_value_by_name('audio_only') == 'true':
        downloader_opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': default_audio_format,
            }],
        })

        downloader_opts.pop('merge_output_format')
    
    return downloader_opts