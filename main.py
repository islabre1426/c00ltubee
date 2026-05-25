from typing import Literal
import os
import webview

import sys

from backend.app import app


def _get_preferred_renderer():
    match sys.platform:
        case 'win32':
            return 'edgechromium'
        case 'linux':
            return 'gtk'
        case _:
            raise RuntimeError(f'Unsupported platform: {sys.platform}')


def main(args: list[str]):
    debug_flag = False
    renderer = _get_preferred_renderer()

    if 'debug' in args:
        debug_flag = True

    # Temporary workaround for black screen when detaching Web Inspector on Linux
    if sys.platform == 'linux' and debug_flag:
        os.environ['WEBKIT_DISABLE_DMABUF_RENDERER'] = '1'

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


if __name__ == '__main__':
    main(sys.argv)