from datetime import datetime
from pathlib import Path
from queue import Queue
import threading

from yt_dlp import YoutubeDL

from backend.config import get_downloader_opts
from database.download_history import download_history_db
from util.util import get_app_data_location


_queue = Queue()
_download_tasks = {}
_app_data_location = get_app_data_location()


class Logger:
    def __init__(self, task_id: str):
        today = datetime.now().strftime('%Y-%m-%d')

        self.log_path = Path(_app_data_location, 'logs', today, f'{task_id}.log')
    

    def _write_log(self, msg: str):
        log_path_parent = self.log_path.parent

        if not log_path_parent.exists():
            log_path_parent.mkdir(parents = True)
        
        with self.log_path.open(mode = 'a', encoding = 'utf-8') as f:
            f.write(msg + '\n')
    

    def debug(self, msg: str):
        self._write_log(msg)
    

    def warning(self, msg: str):
        self._write_log(msg)

    
    def error(self, msg: str):
        self._write_log(msg)


def _on_task_error(task_id: str):
    download_history_db.update_status_by_id(
        task_id, 'error',
    )

    _download_tasks[task_id].update({
        'status': 'error',
        'progress': 0,
    })


def _on_task_success(task_id: str, title: str | None = None):
    task = {
        'status': 'finished',
        'progress': 100,
    }

    if title:
        download_history_db.update_by_id(
            task_id,
            title,
            'finished',
        )

        task.update({
            'title': title,
        })

    else:
        download_history_db.update_status_by_id(
            task_id,
            'finished',
        )

    _download_tasks[task_id].update(task)


def _create_hook(task_id: str):
    def _hooks(d: dict):
        status = d.get('status')
        info = d.get('info_dict')

        match status:
            case 'downloading':
                # Safely calculate percentage
                total = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
                downloaded_bytes = d.get('downloaded_bytes', 0)
                percentage = (downloaded_bytes / total * 100) if total > 0 else 0

                _download_tasks[task_id].update({
                    'status': 'downloading',
                    'progress': round(percentage, 2),
                })
                
            case 'finished':
                _on_task_success(task_id)
            
            case 'error':
                _on_task_error(task_id)
                
    
    return _hooks


def _download_video(opts: dict, task_id: str, url: str, log_file_path: str):
    try:
        with YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download = False)
            info = ydl.sanitize_info(info)

            title = info.get('title')
            
            output_filename = Path(ydl.prepare_filename(info))

            if output_filename.exists():
                _on_task_success(task_id, title)
                return

            download_history_db.update_by_id(
                task_id,
                title,
                'working',
                log_file_path
            )

            _download_tasks[task_id].update({
                'status': 'starting',
                'title': title,
                'progress': 0,
            })

            ydl.download([url])

    except Exception:
        _on_task_error(task_id)
        raise


def start_worker():
    while True:
        if _queue.empty():
            break

        task = _queue.get()

        task_id, url = task

        logger = Logger(task_id)

        ydl_opts = {
            **get_downloader_opts(),
            'progress_hooks': [_create_hook(task_id)],
            'logger': logger,
        }

        threading.Thread(
            target = _download_video,
            args = (ydl_opts, task_id, url, str(logger.log_path)),
            daemon = True,
        ).start()


def add_task_to_queue(task_id: str, url: str):
    task = (task_id, url)
    _queue.put(task)

    download_history_db.add(
        task_id,
        'Waiting...',
        'queued',
    )

    _download_tasks[task_id] = {
        'status': 'queued'
    }


def get_task_info(task_id: str):
    return _download_tasks[task_id]