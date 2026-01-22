import webview

from pathlib import Path

from backend.api import API

def main():
    api = API()

    webview.create_window(
        title = 'c00ltubee',
        url = str(Path(Path(__file__).parent, 'frontend', 'index.html')),
        js_api = api,
        width = 1280,
        height = 720,
    )

    webview.start(debug = True)


if __name__ == '__main__':
    main()