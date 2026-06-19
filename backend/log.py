from pathlib import Path

from database.download_history import download_history_db


def get_log(task_id: str):
    log_file_path = Path(download_history_db.get_log_file_path_by_id(task_id))

    if log_file_path is None:
        return None

    with log_file_path.open() as f:
        return f.read()