import webview

import sys

from backend.app import app


def main(args: list[str]):
    debug_flag = False

    if 'debug' in args:
        debug_flag = True

    webview.create_window(
        title = 'c00ltubee',
        url = app,
        min_size = (800, 600),
        width = 800,
        height = 600,
    )

    webview.start(
        debug = debug_flag,
    )


if __name__ == '__main__':
    main(sys.argv)