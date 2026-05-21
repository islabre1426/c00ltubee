from queue import Queue
import threading

from yt_dlp import YoutubeDL

from .config import process_downloader_opts


queue = Queue()
downloading_tasks = {}


def _create_hook(task_id: str):
    def _hooks(d: dict):
        status = d.get('status')

        match status:
            case 'downloading':
                # Safely calculate percentage
                total = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
                downloaded_bytes = d.get('downloaded_bytes')
                percentage = (downloaded_bytes / total * 100) if total > 0 else 0

                downloading_tasks[task_id].update({
                    'status': 'downloading',
                    'progress': round(percentage, 2),
                })
                
            case 'finished':
                downloading_tasks[task_id].update({
                    'status': 'finished',
                    'progress': 100,
                })
    
    return _hooks


def _download_video(opts: dict, task_id: str, url: str):
    try:
        with YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download = False)
            info = ydl.sanitize_info(info)

            downloading_tasks[task_id] = {
                'status': 'starting',
                'title': info.get('title'),
                'progress': 0,
            }

            ydl.download([url])

    except Exception as e:
        downloading_tasks[task_id].update({
            'status': 'error',
            'progress': 0,
            'error': str(e),
        })


def start_worker():
    while True:
        if queue.empty():
            break

        task = queue.get()

        task_id, url = task

        ydl_opts = {
            **process_downloader_opts(),
            'progress_hooks': [_create_hook(task_id)],
        }

        threading.Thread(
            target = _download_video,
            args = (ydl_opts, task_id, url,),
            daemon = True,
        ).start()