from flask import Flask, jsonify, send_from_directory, abort, request

from pathlib import Path
from uuid import uuid4

from backend import downloader, windowhandler, log
from database.download_history import download_history_db
from database.setting import setting_db
from util.util import get_root_dir, is_valid_uuid


static_folder = Path(get_root_dir(), 'frontend')

app = Flask(
    import_name = __name__,
    static_folder = static_folder,
    static_url_path = '/',
)


# 
# Entry
# 
@app.get('/')
def index():
    return send_from_directory(static_folder, 'index.html')


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
            abort(406)
    
    except:
        abort(404)
    
    else:
        response = {
            'status': 'success',
            'history': history,
        }

        return jsonify(response)


@app.get('/history/delete/<id>')
def delete_history(id):
    if id == 'all':
        download_history_db.delete_all()
    
    elif is_valid_uuid(id):
        download_history_db.delete_by_id(id)

    else:
        abort(406)
    
    response = {
        'status': 'success'
    }

    return jsonify(response)


# 
# Downloading
# 
@app.post('/downloader/start/download')
def start_download():
    url = request.json['url']
    req_id = request.json['id']

    if url is None:
        abort(404)
    
    # Assign task before the UI starts polling
    if req_id is None:
        id = str(uuid4())

    elif is_valid_uuid(req_id):
        id = req_id

    else:
        abort(406)
    
    downloader.add_task_to_queue(id, url)

    response = {
        'status': 'success',
        'id': id,
    }

    return jsonify(response)


@app.get('/downloader/start/worker')
def start_worker():
    downloader.start_worker()

    response = {
        'status': 'success',
    }

    return jsonify(response)


@app.get('/downloader/get/status/<id>')
def get_download_status(id):
    if not is_valid_uuid(id):
        abort(406)
    
    info = downloader.get_task_info(id)

    if info is None:
        abort(404)

    response = {
        'status': 'success',
        'info': info,
    }

    return jsonify(response)


@app.get('/downloader/get/log/<id>')
def get_log(id):
    if not is_valid_uuid(id):
        abort(406)
    
    log_content = log.get_log(id)

    if log_content is None:
        response = {
            'status': 'no log content found',
        }

        return jsonify(response)

    response = {
        'status': 'success',
        'content': log_content,
    }

    return jsonify(response)


@app.get('/downloader/cancel/<id>')
def cancel_download(id):
    if not is_valid_uuid(id):
        abort(406)

    downloader.cancel_task(id)

    response = {
        'status': 'success',
    }

    return jsonify(response)


@app.get('/setting/get/all')
def get_settings():
    settings = setting_db.get_all_as_list()

    response = {
        'status': 'success',
        'settings': settings,
    }

    return jsonify(response)


@app.post('/setting/save')
def save_setting():
    name = request.json['name']
    value = request.json['value']

    # We expect boolean value to be 'true' or 'false', so we need to explicitly convert it
    if type(value) == bool:
        value = 'true' if value == True else 'false'

    setting_db.update_user_value_by_name(name, value)

    response = {
        'status': 'success',
    }

    return jsonify(response)


# 
# Uncategorized
# 

# Use POST so extend flag will be automatically converted to boolean (no check required)
@app.post('/extend-sidebar')
def extend_sidebar():
    extend_flag = request.json['extend']

    if extend_flag is None:
        abort(404)
    
    windowhandler.handle_sidebar(extend_flag)

    response = {
        'status': 'success',
    }

    return jsonify(response)


@app.get('/folder-picker')
def folder_picker():
    selected_folder = windowhandler.folder_picker()

    if selected_folder is None:
        abort(404)
    
    response = {
        'status': 'success',
        'selectedFolder': selected_folder,
    }

    return jsonify(response)