from bottle import Bottle, static_file, request, abort, HTTPResponse

from pathlib import Path
from uuid import uuid4
import json

from backend import downloader, windowhandler, log
from database.download_history import download_history_db
from database.setting import setting_db
from util.util import get_root_dir, is_valid_uuid


app = Bottle()
static_folder = Path(get_root_dir(), 'frontend')


# 
# Entry
# 
@app.get('/')
def index():
    return static_file('index.html', root = static_folder)


# 
# History
# 
@app.get('/history/get/<id>')
def get_history(id):
    try:
        if id == 'all':
            history = download_history_db.get_all_as_list()
        
        elif is_valid_uuid(id):
            history = download_history_db.get_by_id_as_dict(id)
        
        else:
            abort(406, 'Invalid id sent')
    
    except:
        abort(404, 'History not found')
    
    else:
        response = {
            'status': 'success',
            'history': history,
        }

        return HTTPResponse(status = 200, body = json.dumps(response))


@app.get('/history/delete/<id>')
def delete_history(id):
    if id == 'all':
        download_history_db.delete_all()
    
    elif is_valid_uuid(id):
        download_history_db.delete_by_id(id)

    else:
        abort(406, 'Invalid id sent')
    
    response = {
        'status': 'success'
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


# 
# Downloading
# 
@app.post('/downloader/start/download')
def start_download():
    url = request.json['url']
    req_id = request.json['id']

    if url is None:
        abort(404, 'urls not found')
    
    # Assign task before the UI starts polling
    if req_id is None:
        id = str(uuid4())

    elif is_valid_uuid(req_id):
        id = req_id

    else:
        abort(406, 'Invalid id sent')
    
    downloader.add_task_to_queue(id, url)

    response = {
        'status': 'success',
        'id': id,
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


@app.get('/downloader/start/worker')
def start_worker():
    downloader.start_worker()

    response = {
        'status': 'success',
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


@app.get('/downloader/get/status/<id>')
def get_download_status(id):
    if not is_valid_uuid(id):
        abort(406, 'Invalid id sent')
    
    info = downloader.get_task_info(id)

    response = {
        'status': 'success',
        'info': info,
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


@app.get('/downloader/get/log/<id>')
def get_log(id):
    if not is_valid_uuid(id):
        abort(406, 'Invalid id sent')
    
    log_content = log.get_log(id)

    if log_content is None:
        response = {
            'status': 'no log content found',
        }

        return HTTPResponse(status = 200, body = json.dumps(response))

    response = {
        'status': 'success',
        'content': log_content,
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


@app.get('/downloader/cancel/<id>')
def cancel_download(id):
    if not is_valid_uuid(id):
        abort(406, 'Invalid id sent')

    downloader.cancel_task(id)

    response = {
        'status': 'success',
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


@app.get('/setting/get/all')
def get_settings():
    settings = setting_db.get_all_as_list()

    response = {
        'status': 'success',
        'settings': settings,
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


@app.post('/setting/save')
def save_setting():
    name = request.json['name']
    value = request.json['value']

    # We expect boolean value to be 'true' or 'false', so we need to explicitly convert it
    value = 'true' if value == True else 'false'

    print(value)

    setting_db.update_user_value_by_name(name, value)

    response = {
        'status': 'success',
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


# 
# Uncategorized
# 

# Use POST so extend flag will be automatically converted to boolean (no check required)
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


@app.get('/folder-picker')
def folder_picker():
    selected_folder = windowhandler.folder_picker()

    if selected_folder is None:
        abort(404, 'Folder not chosen')
    
    response = {
        'status': 'success',
        'selectedFolder': selected_folder,
    }

    return HTTPResponse(status = 200, body = json.dumps(response))


# 
# Static files
# 

# Avoid conflicting with other endpoints by putting it here
@app.get('/<filepath:path>')
def static_files(filepath):
    return static_file(filepath, root = static_folder)