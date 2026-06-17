from pathlib import Path
import sqlite3


_root_path = Path(__file__).parent


class DBConnector:
    # Singleton pattern to make sure only one instance is used
    def __new__(cls):
        if not hasattr(cls, 'inst'):
            cls.inst = super().__new__(cls)
        
        return cls.inst
    

    def __init__(self):
        self.db_path = Path(_root_path, 'db', 'app.sqlite')

        if not self.db_path.parent.exists():
            self.db_path.parent.mkdir(parents = True)
    

    def __enter__(self):
        self.connection = sqlite3.connect(self.db_path)
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
        '''

        if self.connection:
            self.cursor.executescript(db_setup_sql)
        else:
            raise RuntimeError('No database connection exist')
    

    def db_exists(self):
        return self.db_path.exists()