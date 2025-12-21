from pathlib import Path
from queue import Queue
from threading import Thread
import json

from flask import Flask, Response, stream_with_context, send_from_directory, jsonify, request

from . import downloader, config

event_queue = Queue()

app = Flask(
    import_name = __name__,
    static_folder = Path(config.ROOT_DIR, 'frontend'),
    static_url_path = '/',
)


@app.get('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


@app.get('/load-settings')
def load_settings():
    user_settings = config.load_user_setting()

    result = [config.DOWNLOADER_SETTINGS]

    if user_settings:
        result.append(user_settings)

    return jsonify({
        'status': 'ok',
        'has_user_config': True if user_settings else False,
        'result': result,
    })


@app.post('/save-setting')
def save_setting():
    setting = request.json

    config.save_user_setting(setting)

    return jsonify({
        'status': 'ok',
    })


@app.post('/start-download')
def start_download_route():
    urls = request.json

    Thread(
        target = downloader.start_download,
        args = (urls, {}),
        daemon = True,
    ).start()

    return jsonify({
        'status': 'ok'
    })


@app.post('/get-video-info')
def get_video_info():
    urls = request.json
    results = []

    downloader.get_video_info(urls, results)

    return jsonify({
        'status': 'ok',
        'results': results,
    })


@app.get('/download-events')
def download_events():
    def event_stream():
        while True:
            event = event_queue.get()
            yield f'data: {json.dumps(event)}\n\n'
    
    headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
    }
    
    return Response(
        stream_with_context(event_stream()),
        headers = headers,
    )