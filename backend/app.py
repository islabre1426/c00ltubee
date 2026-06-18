import json
from pathlib import Path
from uuid import uuid4

from bottle import Bottle, static_file, request, abort, HTTPResponse

from backend import downloader, windowhandler
from database.download_history import download_history_db
from database.setting import setting_db


app = Bottle()

_static_folder = Path(Path(__file__).parent, '..', 'frontend')


@app.get('/')
def index():
    return static_file('index.html', root = _static_folder)


@app.get('/<filepath:path>')
def static_files(filepath):
    return static_file(filepath, root = _static_folder)


@app.get('/history')
def history():
    try:
        history = download_history_db.get_all_as_list()

        response = {
            'status': 'success',
            'history': history,
        }

        return HTTPResponse(status = 200, body = json.dumps(response))
    except:
        abort(404, 'History not found')


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


@app.get('/settings')
def get_settings():
    settings = setting_db.get_all_as_list()

    response = {
        'status': 'success',
        'settings': settings,
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


@app.post('/save-setting')
def save_setting():
    name = request.json['name']
    value = request.json['value']

    setting_db.update_user_value_by_name(name, value)

    response = {
        'status': 'success',
    }

    return HTTPResponse(status = 200, body = json.dumps(response))