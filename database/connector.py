from pathlib import Path
import sqlite3


_root_path = Path(__file__).parent
_db_path = Path(_root_path, 'db', 'app.sqlite')
_sql_path = Path(_root_path, 'sql')


def get_connection():
    conn = sqlite3.connect(_db_path)

    db_setup_sql = '''
    PRAGMA foreign_keys = 1;
    PRAGMA journal_mode = WAL;
    '''

    conn.executescript(db_setup_sql)
    conn.commit()

    return conn


def _load_sql_file(sql_name: str):
    sql_file = Path(_sql_path, f'{sql_name}.sql')

    with get_connection() as conn:
        cursor = conn.cursor()

        with sql_file.open() as f:
            sql = f.read()
            cursor.executescript(sql)
        
        cursor.close()


def init():
    if not _db_path.exists():
        print('Database does not exist. Initializing database.')

        _db_path.parent.mkdir()

        _load_sql_file('schema')
        _load_sql_file('data')
    else:
        print('Database already exists. Skipping initialization.')