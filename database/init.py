from pathlib import Path

from database.connector import DBConnector


_root_path = Path(__file__).parent
_sql_path = Path(_root_path, 'sql')
_dbconnector = DBConnector()


def _load_sql_file(sql_name: str):
    sql_file = Path(_sql_path, f'{sql_name}.sql')

    with _dbconnector as db:
        with sql_file.open() as f:
            sql = f.read()
            db.cursor.executescript(sql)


def init():
    if not _dbconnector.db_exists():
        print('Database does not exist. Initializing database.')

        _load_sql_file('schema')
        _load_sql_file('data')
    else:
        print('Database already exists. Skipping initialization.')