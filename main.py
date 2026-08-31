import webview

import os
import sys

from backend.app import app
from util.util import current_os, get_root_dir
from database.download_history import download_history_db
from database.setting import setting_db


def _get_preferred_renderer():
    match current_os:
        case 'win32':
            return 'edgechromium'
        case 'linux':
            return 'gtk'
        case _:
            raise RuntimeError(f'Unsupported platform: {current_os}')


def main(args: list[str]):
    debug_flag = False
    renderer = _get_preferred_renderer()

    if 'debug' in args:
        debug_flag = True

    if current_os == 'linux':
        # Temporary workaround for black screen when detaching Web Inspector on Linux
        if debug_flag:
            os.environ['WEBKIT_DISABLE_DMABUF_RENDERER'] = '1'

        # Load shared libraries from downloaded ffmpeg (required for it to work correctly)
        prev_ld_library_path = os.environ.get('LD_LIBRARY_PATH')
        new_ld_library_path = f'{get_root_dir()}/vendor/ffmpeg/linux/lib'

        if prev_ld_library_path:
            new_ld_library_path += ':' + prev_ld_library_path

        os.environ['LD_LIBRARY_PATH'] = new_ld_library_path

    webview.create_window(
        title = 'c00ltubee',
        url = app,
        min_size = (800, 600),
        width = 800,
        height = 600,
        http_port = 2688,
    )

    webview.start(
        debug = debug_flag,
        gui = renderer,
        private_mode = False,
    )

    # 
    # Cleanup
    # 
    download_history_db.db_handler.close()
    setting_db.db_handler.close()


if __name__ == '__main__':
    main(sys.argv)