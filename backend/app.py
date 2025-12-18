from pathlib import Path
import json

from flask import Flask, send_from_directory, jsonify, request

from .config import DOWNLOADER_SETTINGS
from . import util

ROOT_DIR = Path(__file__).parent.parent
USER_CONFIG_FILE = Path(ROOT_DIR, 'config.json')

app = Flask(
    import_name = __name__,
    static_folder = Path(ROOT_DIR, 'frontend'),
    static_url_path = '/',
)

@app.get('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.get('/load-settings')
def load_settings():
    user_settings = util.load_file(USER_CONFIG_FILE)

    result = [DOWNLOADER_SETTINGS]

    if user_settings:
        result.append(json.loads(user_settings))

    return jsonify({
        'status': 'ok',
        'has_user_config': True if user_settings else False,
        'result': result,
    })

@app.post('/save-setting')
def save_setting():
    setting = request.json

    util.save_setting(USER_CONFIG_FILE, setting)

    return jsonify({
        'status': 'ok',
    })