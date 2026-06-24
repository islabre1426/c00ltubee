from pathlib import Path

from database.download_history import download_history_db


def get_log(task_id: str):
    log_file_path = download_history_db.get_log_file_path_by_id(task_id)

    if log_file_path is None:
        return None

    with Path(log_file_path).open(encoding = 'utf-8') as f:
        return f.read()