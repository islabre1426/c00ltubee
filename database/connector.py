from pathlib import Path
import sqlite3

from util.util import get_app_data_location, get_root_dir


class DBConnector:
    def __init__(self, name: str):
        self.db_path = Path(get_app_data_location(), 'db', f'{name}.sqlite')

        self.init()
    

    def __enter__(self):
        # Reference: https://ricardoanderegg.com/posts/python-sqlite-thread-safety/
        # Resolve issue with SQLite only allow same-thread object use
        check_same_thread = False if sqlite3.threadsafety == 3 else True

        self.connection = sqlite3.connect(self.db_path, check_same_thread = check_same_thread)
        self.cursor = self.connection.cursor()

        self._setup_db()

        # Allow other to use methods inside with block
        return self


    def __exit__(self, exc_type, exc, tb):
        # Make sure any transaction is committed before closing
        self.connection.commit()

        self.connection.close()


    def _setup_db(self):
        db_setup_sql = '''
        PRAGMA foreign_keys = 1;
        PRAGMA journal_mode = WAL;
        PRAGMA busy_timeout = 5000;
        '''

        if self.connection:
            self.cursor.executescript(db_setup_sql)

            # Make sure configuration is applied
            self.connection.commit()
        else:
            raise RuntimeError('No database connection exist')
    

    def db_exists(self):
        return self.db_path.exists()
    

    def load_sql_file(self, name: str):
        sql_file = Path(get_root_dir(), 'database', 'sql', f'{name}.sql')

        with sql_file.open() as f:
            sql = f.read()
            self.cursor.executescript(sql)
    

    def init(self):
        if not self.db_path.parent.exists():
            self.db_path.parent.mkdir(parents = True)