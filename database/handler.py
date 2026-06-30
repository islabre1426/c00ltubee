from pathlib import Path
import sqlite3

from util.util import get_app_data_location, get_root_dir


class DBHandler:
    def __init__(self, name: str):
        self.db_path = Path(get_app_data_location(), 'db', f'{name}.sqlite')

        self.init()
    

    def connect(self):
        # Reference: https://ricardoanderegg.com/posts/python-sqlite-thread-safety/
        # Resolve issue with SQLite only allow same-thread object use
        check_same_thread = False if sqlite3.threadsafety == 3 else True

        self.connection = sqlite3.connect(self.db_path, check_same_thread = check_same_thread)

        self.setup_connection()

    
    def close(self):
        if self.connection:
            self.connection.close()
        else:
            raise RuntimeError('No database connection exist')


    def setup_connection(self):
        connection_setup_sql = '''
        PRAGMA foreign_keys = 1;
        PRAGMA journal_mode = WAL;
        PRAGMA busy_timeout = 5000;
        '''

        if self.connection:
            with self.connection as conn:
                conn.executescript(connection_setup_sql)

        else:
            raise RuntimeError('No database connection exist')
    

    def db_exists(self):
        return self.db_path.exists()
    

    def load_sql_file(self, name: str):
        sql_file = Path(get_root_dir(), 'database', 'sql', f'{name}.sql')

        with sql_file.open() as f, self.connection as conn:
            sql = f.read()
            conn.executescript(sql)
    

    def init(self):
        if not self.db_path.parent.exists():
            self.db_path.parent.mkdir(parents = True)