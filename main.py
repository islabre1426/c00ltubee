import webview

import sys

from backend.app import app
from util.util import current_os
from database.download_history import download_history_db
from database.setting import setting_db


def _get_preferred_renderer():
    match current_os:
        case 'win32':
            return 'edgechromium'
        case 'linux':
            return 'qt'
        case _:
            raise RuntimeError(f'Unsupported platform: {current_os}')


def main(args: list[str]):
    debug_flag = False
    renderer = _get_preferred_renderer()

    if 'debug' in args:
        debug_flag = True

    # Temporary workaround for black screen when detaching Web Inspector on Linux
    # if current_os == 'linux' and debug_flag:
    #     os.environ['WEBKIT_DISABLE_DMABUF_RENDERER'] = '1'

    webview.create_window(
        title = 'c00ltubee',
        url = app,
        min_size = (800, 600),
        width = 800,
        height = 600,
    )

    webview.start(
        debug = debug_flag,
        gui = renderer,
    )

    # 
    # Cleanup
    # 
    download_history_db.db_handler.close()
    setting_db.db_handler.close()


if __name__ == '__main__':
    main(sys.argv)