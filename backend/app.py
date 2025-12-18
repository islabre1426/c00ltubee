from pathlib import Path

from flask import Flask, send_from_directory

ROOT_DIR = Path(__file__).parent.parent

app = Flask(
    import_name = __name__,
    static_folder = Path(ROOT_DIR, 'frontend'),
    static_url_path = '/',
)

@app.get('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')