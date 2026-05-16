import json
from pathlib import Path

from bottle import Bottle, static_file, request, response

from windowhandler import handle_sidebar


app = Bottle()

static_folder = Path(Path(__file__).parent, 'ui')


@app.get('/')
def index():
    return static_file('index.html', root = static_folder)


@app.get('/<filepath:path>')
def static_files(filepath):
    return static_file(filepath, root = static_folder)


@app.post('/extend-sidebar')
def extend_sidebar():
    extend_flag = request.json['extend']

    if extend_flag is None:
        return json.dumps({
            'status': 'error',
            'content': 'Extend property does not exist',
        })
    
    handle_sidebar(extend_flag)

    return json.dumps({
        'status': 'ok'
    })