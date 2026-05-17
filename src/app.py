import json
from pathlib import Path
from uuid import uuid4

from bottle import Bottle, static_file, request

from backend import downloader, windowhandler


app = Bottle()

_static_folder = Path(Path(__file__).parent, 'frontend')


@app.get('/')
def index():
    return static_file('index.html', root = _static_folder)


@app.get('/<filepath:path>')
def static_files(filepath):
    return static_file(filepath, root = _static_folder)


@app.post('/extend-sidebar')
def extend_sidebar():
    extend_flag = request.json['extend']

    if extend_flag is None:
        return json.dumps({
            'status': 'error',
            'content': 'Extend property does not exist',
        })
    
    windowhandler.handle_sidebar(extend_flag)

    return json.dumps({
        'status': 'ok'
    })


@app.post('/start-download')
def start_download():
    url = request.json['url']

    if url is None:
        return json.dumps({
            'status': 'error',
            'content': 'Urls property does not exist',
        })
    
    # Assign tasks before the UI starts polling
    task_id = str(uuid4())
    task = (task_id, url)
    
    downloader.queue.put(task)

    downloader.downloading_tasks[task_id] = {
        'status': 'queued',
    }

    return json.dumps({
        'status': 'ok',
        'task_id': task_id,
    })


@app.get('/start-worker')
def start_worker_index():
    downloader.start_worker()

    return json.dumps({
        'status': 'ok',
    })


@app.post('/status')
def get_download_status():
    task_id = request.json['id']

    if task_id is None:
        return json.dumps({
            'status': 'error',
            'content': 'Id property does not exist',
        })
    
    info = downloader.downloading_tasks[task_id]

    return json.dumps({
        'status': 'ok',
        'info': info,
    })