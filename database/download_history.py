from database.connector import DBConnector


class _DownloadHistory:
    def __init__(self):
        self.name = 'download_history'
        self.db_connector = DBConnector(self.name)

        self.init()
    

    def init(self):
        if not self.db_connector.db_exists():
            print(f'{self.name} database does not exist. Initializing.')

            with self.db_connector as db:
                db.load_sql_file(self.name)
        else:
            print(f'{self.name} database already exists. Skipping initialization.')


    def add(
        self,
        task_id: str,
        title: str,
        status_type: str,
        log_file_path: str | None = None,
    ):
        with self.db_connector as db:
            db.cursor.execute(
                f'INSERT INTO {self.name} (task_id, title, status_type, log_file_path) VALUES (?, ?, ?, ?)',
                (task_id, title, status_type, log_file_path),
            )
    

    def get_by_id(self, task_id: str):
        with self.db_connector as db:
            db.cursor.execute(
                f'SELECT * FROM {self.name} WHERE task_id = ?',
                (task_id,),
            )

            result = db.cursor.fetchone()

            if result is None:
                raise ValueError('Task not found:', task_id)
            
            return result
    

    def get_log_file_path_by_id(self, task_id: str):
        history = self.get_by_id(task_id)

        return history[3]
    

    def get_all_as_list(self):
        with self.db_connector as db:
            db.cursor.execute(
                f'SELECT * FROM {self.name}',
            )

            result: list[dict] = []

            for entry in db.cursor.fetchall():
                result.append({
                    'task_id': entry[0],
                    'title': entry[1],
                    'status_type': entry[2],
                    'log_file_path': entry[3],
                })

            return result
    

    def update_by_id(
        self,
        task_id: str,
        title: str,
        status_type: str,
        log_file_path: str | None = None
    ):
        with self.db_connector as db:
            db.cursor.execute(
                f'UPDATE {self.name} SET title = ?, status_type = ?, log_file_path = ? WHERE task_id = ?',
                (title, status_type, log_file_path, task_id),
            )
    

    def update_status_by_id(
        self,
        task_id: str,
        status_type: str,
    ):
        with self.db_connector as db:
            db.cursor.execute(
                f'UPDATE {self.name} SET status_type = ? WHERE task_id = ?',
                (status_type, task_id),
            )
    

    def delete_by_id(self, task_id: str):
        with self.db_connector as db:
            db.cursor.execute(
                f'DELETE FROM {self.name} WHERE task_id = ?',
                (task_id,),
            )
    

    def delete_all(self):
        with self.db_connector as db:
            db.cursor.execute(
                f'DELETE FROM {self.name}',
            )


download_history_db = _DownloadHistory()