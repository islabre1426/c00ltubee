from datetime import datetime
from pathlib import Path
from queue import Queue
import threading

from yt_dlp import YoutubeDL

from backend.config import get_downloader_opts
from database.download_history import download_history_db
from util.util import get_app_data_location


download_queue = Queue()
download_tasks = {}
cancelling_tasks = set()


class Logger:
    def __init__(self, id: str):
        today = datetime.now().strftime('%Y-%m-%d')

        self.log_path = Path(get_app_data_location(), 'logs', today, f'{id}.log')
    

    def write_log(self, msg: str):
        log_path_parent = self.log_path.parent

        if not log_path_parent.exists():
            log_path_parent.mkdir(parents = True)
        
        # Without encoding format, non-English message will look weird
        with self.log_path.open(mode = 'a', encoding = 'utf-8') as f:
            f.write(msg + '\n')
    

    def debug(self, msg: str):
        self.write_log(msg)
    

    def warning(self, msg: str):
        self.write_log(msg)

    
    def error(self, msg: str):
        self.write_log(msg)


def on_task_error(id: str):
    download_history_db.update_status_by_id(id, 'error')

    download_tasks[id].update({ 'status': 'error' })


def on_task_success(id: str, title: str | None = None, url: str | None = None):
    task = {
        'status': 'finished',
        'progress': 100,
    }

    if title and url:
        download_history_db.update_by_id(
            id,
            title,
            url,
            'finished',
        )

        task.update({ 'title': title })

    else:
        download_history_db.update_status_by_id(id, 'finished')

    download_tasks[id].update(task)


def handle_cancelling(id: str):
    download_history_db.update_status_by_id(id, 'cancelled')

    download_tasks[id].update({ 'status': 'cancelled' })


def on_task_cancelled(id: str):
    handle_cancelling(id)

    cancelling_tasks.discard(id)


def create_hook(id: str):
    def hooks(d: dict):
        if id in cancelling_tasks:
            raise Exception(f'Task {id} cancelled by user')

        status = d.get('status')

        match status:
            case 'downloading':
                # Safely calculate percentage
                total = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
                downloaded_bytes = d.get('downloaded_bytes', 0)
                percentage = (downloaded_bytes / total * 100) if total > 0 else 0

                download_tasks[id].update({
                    'status': 'downloading',
                    'progress': round(percentage, 2),
                })
                
            case 'finished':
                on_task_success(id)
            
            case 'error':
                on_task_error(id)
                
    
    return hooks


def download_video(opts: dict, id: str, url: str, log_file_path: str):
    try:
        with YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download = False)
            info = ydl.sanitize_info(info)

            title = info.get('title')
            
            output_filename = Path(ydl.prepare_filename(info))

            if output_filename.exists():
                on_task_success(id, title)
                return
            
            # Support cancelling before the actual download
            if id in cancelling_tasks:
                on_task_cancelled(id)
                return

            download_history_db.update_by_id(
                id,
                title,
                url,
                'working',
                log_file_path
            )

            download_tasks[id].update({
                'status': 'starting',
                'title': title,
                'progress': 0,
            })

            ydl.download([url])

    except Exception:
        # Exception caused by intentional cancellation
        if id in cancelling_tasks:
            on_task_cancelled(id)
            
        else:
            on_task_error(id)
            raise


def start_worker():
    while True:
        if download_queue.empty():
            break

        task = download_queue.get()

        id, url = task

        logger = Logger(id)

        ydl_opts = {
            **get_downloader_opts(),
            'progress_hooks': [create_hook(id)],
            'logger': logger,
        }

        task_process = threading.Thread(
            target = download_video,
            args = (ydl_opts, id, url, str(logger.log_path)),
            daemon = True,
            name = id,
        )

        task_process.start()


def add_task_to_queue(id: str, url: str):
    task = (id, url)
    download_queue.put(task)

    # Find existing history (applicable for redownloading)
    try:
        _ = download_history_db.get_by_id(id)

    except:
        download_history_db.add(
            id,
            'Waiting...',
            url,
            'queued',
        )

    download_tasks[id] = {
        'status': 'queued'
    }


def get_task_info(id: str) -> dict | None:
    return download_tasks.get(id)


def cancel_task(id: str):
    if id in download_tasks:
        # Handle early cancelling
        handle_cancelling(id)
        
        cancelling_tasks.add(id)