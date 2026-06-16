import json
from pathlib import Path
from uuid import uuid4

from bottle import Bottle, static_file, request, abort, HTTPResponse

from backend import downloader, windowhandler
from database.connector import init
from database.download_history import DownloadHistory


app = Bottle()

_static_folder = Path(Path(__file__).parent, '..', 'frontend')
_download_history_db = DownloadHistory()


@app.get('/')
def index():
    init()

    return static_file('index.html', root = _static_folder)


@app.get('/<filepath:path>')
def static_files(filepath):
    return static_file(filepath, root = _static_folder)


@app.get('/history')
def history():
    history = _download_history_db.get_all_in_dict()

    response = {
        'status': 'success',
        'history': history,
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


@app.post('/extend-sidebar')
def extend_sidebar():
    extend_flag = request.json['extend']

    if extend_flag is None:
        abort(404, 'extend not found')
    
    windowhandler.handle_sidebar(extend_flag)

    response = {
        'status': 'success',
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


@app.post('/start-download')
def start_download():
    url = request.json['url']

    if url is None:
        abort(404, 'urls not found')
    
    # Assign tasks before the UI starts polling
    task_id = str(uuid4())
    
    downloader.add_task_to_queue(task_id, url)

    response = {
        'status': 'success',
        'taskId': task_id,
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


@app.get('/start-worker')
def start_worker_index():
    downloader.start_worker()

    response = {
        'status': 'success',
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


@app.post('/status')
def get_download_status():
    task_id = request.json['id']

    if task_id is None:
        abort(404, 'id not found')
    
    info = downloader.get_task_info(task_id)

    response = {
        'status': 'success',
        'info': info,
    }

    return HTTPResponse(status = 200, body = json.dumps(response))