from database.handler import DBHandler


class DownloadHistory:
    def __init__(self):
        self.name = 'download_history'
        self.db_handler = DBHandler(self.name)

        self.init()
    

    def init(self):
        if not self.db_handler.db_exists():
            # Connect to initialize database
            self.db_handler.connect()
            self.db_handler.load_sql_file(self.name)

        else:
            # Connect to use existing database
            self.db_handler.connect()

        # Shorthand for faster reference
        self.connection = self.db_handler.connection


    def add(
        self,
        task_id: str,
        title: str,
        url: str,
        status_type: str,
        log_file_path: str | None = None,
    ):
        with self.connection as conn:
            conn.execute(
                f'INSERT INTO {self.name} (task_id, title, url, status_type, log_file_path) VALUES (?, ?, ?, ?, ?)',
                (task_id, title, url, status_type, log_file_path),
            )
    

    def get_by_id(self, task_id: str):
        with self.connection as conn:
            cursor = conn.execute(
                f'SELECT * FROM {self.name} WHERE task_id = ?',
                (task_id,),
            )

            result = cursor.fetchone()

            if result is None:
                raise ValueError('Task not found:', task_id)
            
            return result
        
    
    def format_row_as_dict(self, row):
        return {
            'task_id': row[0],
            'title': row[1],
            'url': row[2],
            'status_type': row[3],
            'log_file_path': row[4],
        }
    

    def get_by_id_as_dict(self, task_id: str):
        row = self.get_by_id(task_id)

        return self.format_row_as_dict(row)
    

    def get_log_file_path_by_id(self, task_id: str):
        history = self.get_by_id_as_dict(task_id)

        log_file_path = history.get('log_file_path')
        
        return log_file_path
    

    def get_all_as_list(self):
        with self.connection as conn:
            result: list[dict] = []

            for row in conn.execute(f'SELECT * FROM {self.name}'):
                result.append(self.format_row_as_dict(row))

            return result
    

    def update_by_id(
        self,
        task_id: str,
        title: str,
        url: str,
        status_type: str,
        log_file_path: str | None = None
    ):
        with self.connection as conn:
            conn.execute(
                f'UPDATE {self.name} SET title = ?, url = ?, status_type = ?, log_file_path = ? WHERE task_id = ?',
                (title, url, status_type, log_file_path, task_id),
            )
    

    def update_status_by_id(
        self,
        task_id: str,
        status_type: str,
    ):
        with self.connection as conn:
            conn.execute(
                f'UPDATE {self.name} SET status_type = ? WHERE task_id = ?',
                (status_type, task_id),
            )
    

    def delete_by_id(self, task_id: str):
        with self.connection as conn:
            conn.execute(
                f'DELETE FROM {self.name} WHERE task_id = ?',
                (task_id,),
            )
    

    def delete_all(self):
        with self.connection as conn:
            conn.execute(
                f'DELETE FROM {self.name}',
            )


download_history_db = DownloadHistory()