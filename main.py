import webview

from pathlib import Path

from backend.app import app

def main():
    webview.create_window(
        title = 'c00ltubee',
        url = app,
        width = 1280,
        height = 720,
    )

    webview.start(debug = True)


if __name__ == '__main__':
    main()