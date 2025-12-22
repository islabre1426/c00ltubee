from threading import Thread
import webbrowser

from backend.app import app

def start_backend():
    app.run(
        host = '127.0.0.1',
        port = 5000
    )

if __name__ == '__main__':
    Thread(
        target = start_backend,
    ).start()

    webbrowser.open('http://127.0.0.1:5000')