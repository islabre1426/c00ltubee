from datetime import datetime
from pathlib import Path
from queue import Queue
import re
import subprocess
import threading

from backend.config import get_downloader_opts
from database.download_history import download_history_db
from util.util import get_app_data_location, get_root_dir, current_os


download_queue = Queue()
download_tasks = {}
cancelling_tasks = set()

yt_dlp_exe = 'yt-dlp.exe' if current_os == 'win32' else 'yt-dlp_linux'
yt_dlp_path = str(Path(get_root_dir(), 'vendor', 'yt-dlp', current_os, yt_dlp_exe))

waiting_title = 'Waiting...'

process_creation_flag = subprocess.CREATE_NO_WINDOW if current_os == 'win32' else 0
yt_dlp_first_update_after_launch = True

separator = '-' * 75


class Logger:
    def __init__(self, id: str):
        today = datetime.now().strftime('%Y-%m-%d')

        self.log_path = Path(get_app_data_location(), 'logs', today, f'{id}.log')
    

    def write(self, msg: str):
        log_path_parent = self.log_path.parent

        if not log_path_parent.exists():
            log_path_parent.mkdir(parents = True)
        
        # Without encoding format, non-English message will look weird
        with self.log_path.open(mode = 'a', encoding = 'utf-8') as f:
            f.write(msg + '\n')


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


def get_title(line: str) -> str:
    matched = re.findall(r'^\[c00ltubee\] Title: (.*)$', line)

    if matched:
        return matched[0]

    return ''


def get_size(line: str) -> dict:
    matched = re.findall(r'^\[c00ltubee\] Total Size: (\d+)' + '\t' + r'Downloaded: (\d+)$', line)

    if matched:
        return {
            'total': matched[0][0],
            'downloaded': matched[0][1],
        }

    return {}


def download_video_v2(opts: list, id: str, url: str, logger: Logger):
    download_tasks[id].update({
        'status': 'starting',
    })

    logger.write(separator)

    cmd = [ yt_dlp_path, *opts, url ]

    with subprocess.Popen(
        args = cmd,
        stdout = subprocess.PIPE, stderr = subprocess.STDOUT,
        text = True,
        creationflags = process_creation_flag,
    ) as p:
        for line in p.stdout:
            if id in cancelling_tasks:
                p.kill()

            line = line.strip()
            logger.write(line)

            # Log file only exist after writing line using logger
            download_history_db.update_log_file_path_by_id(id, str(logger.log_path))

            if download_tasks[id]['status'] == 'starting' and download_tasks[id]['title'] == waiting_title:
                title = get_title(line)

                if title:
                    download_history_db.update_by_id(
                        id,
                        title,
                        url,
                        'working',
                        str(logger.log_path),
                    )

                    download_tasks[id].update({
                        'title': title,
                        'progress': 0,
                    })

            size = get_size(line)

            if size:
                total = int(size.get('total', 0))
                downloaded = int(size.get('downloaded', 0))
                percentage = (downloaded / total * 100) if total > 0 else 0

                download_tasks[id].update({
                    'status': 'downloading',
                    'progress': round(percentage, 2),
                })


    if id in cancelling_tasks:
        on_task_cancelled(id)

    elif p.returncode != 0:
        on_task_error(id)

        raise subprocess.CalledProcessError(p.returncode, cmd)

    else:
        on_task_success(id)


def update_yt_dlp():
    logger = Logger('yt-dlp')

    logger.write(separator)

    cmd = [ yt_dlp_path, '--update' ]

    with subprocess.Popen(
        args = cmd,
        stdout = subprocess.PIPE, stderr = subprocess.STDOUT,
        text = True,
        creationflags = process_creation_flag,
    ) as p:
        for line in p.stdout:
            line = line.strip()
            logger.write(line)



def start_worker_v2():
    global yt_dlp_first_update_after_launch

    if yt_dlp_first_update_after_launch:
        update_yt_dlp()
        yt_dlp_first_update_after_launch = False


    while True:
        if download_queue.empty():
            break

        task = download_queue.get()

        id, url = task

        logger = Logger(id)

        opts = get_downloader_opts()

        task_process = threading.Thread(
            target = download_video_v2,
            args = (opts, id, url, logger),
            daemon = True,
            name = id,
        )

        task_process.start()


def start_worker():
    start_worker_v2()


def add_task_to_queue(id: str, url: str):
    task = (id, url)
    download_queue.put(task)

    # Find existing history (applicable for redownloading)
    try:
        _ = download_history_db.get_by_id(id)

    except:
        download_history_db.add(
            id,
            waiting_title,
            url,
            'queued',
        )

    download_tasks[id] = {
        'status': 'queued',
        'title': waiting_title,
    }


def get_task_info(id: str) -> dict | None:
    return download_tasks.get(id)


def cancel_task(id: str):
    if id in download_tasks:
        # Handle early cancelling
        handle_cancelling(id)
        
        cancelling_tasks.add(id)