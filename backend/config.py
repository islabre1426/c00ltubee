from pathlib import Path

from database.setting import setting_db
from util.util import get_root_dir


def get_downloader_opts_v2():
    vendor_dir = Path(get_root_dir(), 'vendor')
    yt_dlp_preset = [ 'mp3', 'aac', 'mp4', 'mkv' ]

    default_video_format = setting_db.get_value_by_name('default_video_format')
    default_audio_format = setting_db.get_value_by_name('default_audio_format')

    opts = [
        '--ignore-config',

        '--paths', setting_db.get_value_by_name('download_location'),
        '--output', setting_db.get_value_by_name('output_template'),

        '--no-playlist',
        '--color', 'never',

        '--ffmpeg-location', str(Path(vendor_dir, 'ffmpeg', 'bin')),

        # Explicitly use QuickJS
        '--no-js-runtimes',
        '--js-runtimes', 'quickjs:' + str(Path(vendor_dir, 'quickjs', 'qjs.exe')),

        # For parsing info
        '--print', r'[c00ltubee] Title: %(title)s',
        '--progress-template', '[c00ltubee] Total Size: %(progress.total_bytes)s\tDownloaded: %(progress.downloaded_bytes)s',
        '--no-simulate',
        '--progress',
        '--newline',
        '--no-quiet',
    ]

    if setting_db.get_value_by_name('audio_only') == 'true':
        if default_audio_format in yt_dlp_preset:
            opts.extend([
                '--preset-alias', default_audio_format,
            ])
        else:
            opts.extend([
                '--format', f'bestaudio[acodec^={default_audio_format}]/bestaudio/best',
                '--extract-audio',
                '--audio-format', default_audio_format,
            ])
    else:
        if default_video_format in yt_dlp_preset:
            opts.extend([
                '--preset-alias', default_video_format,
            ])
        else:
            opts.extend([
                '--merge-output-format', default_video_format,
                '--remux-video', default_video_format,
            ])

    return opts



def get_downloader_opts():
    return get_downloader_opts_v2()