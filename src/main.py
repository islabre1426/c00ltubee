import webview

from pathlib import Path
import sys

from api import API


ROOT_DIR = Path(__file__).parent


def main(args: list[str]):
    debug_flag = False

    if 'debug' in args:
        debug_flag = True

    ui_file = Path(ROOT_DIR, 'ui', 'index.html')
    api = API()

    webview.create_window(
        title = 'c00ltubee',
        url = str(ui_file),
        min_size = (800, 600),
        width = 800,
        height = 600,
        js_api = api,
    )

    webview.start(
        debug = debug_flag,
    )


if __name__ == '__main__':
    main(sys.argv)