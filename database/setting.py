from pathlib import Path

from database.connector import DBConnector


class _Setting:
    def __init__(self):
        self.name = 'setting'
        self.db_connector = DBConnector(self.name)

        self.init()
    

    def init(self):
        if not self.db_connector.db_exists():
            print(f'{self.name} database does not exist. Initializing.')

            with self.db_connector as db:
                db.load_sql_file(self.name)

                # Download location is different for each OSes, hence it is inserted manually here
                download_location = str(Path(Path.home(), 'Downloads'))

                db.cursor.execute(
                    f'INSERT INTO {self.name} (name, value_type, default_value) VALUES (?, ?, ?)',
                    ('download_location', 'location_folder', download_location),
                )
        else:
            print(f'{self.name} database already exists. Skipping initialization.')
    

    def get_by_name(self, name: str):
        with self.db_connector as db:
            db.cursor.execute(
                f'SELECT * FROM {self.name} WHERE name = ?',
                (name,),
            )

            result = db.cursor.fetchone()

            if result is None:
                raise ValueError('Setting not found:', name)
            
            return result
    

    def get_value_by_name(self, name: str):
        setting = self.get_by_name(name)
        default_value = setting[2]
        user_value = setting[3]

        if user_value:
            return user_value
        
        return default_value


    def get_all_as_list(self):
        with self.db_connector as db:
            db.cursor.execute(
                f'SELECT * FROM {self.name}',
            )

            result: list[dict] = []

            for entry in db.cursor.fetchall():
                result.append({
                    'name': entry[0],
                    'value_type': entry[1],
                    'default_value': entry[2],
                    'user_value': entry[3],
                })
            
            return result
    

    def update_user_value_by_name(
        self,
        name: str,
        user_value: str,
    ):
        with self.db_connector as db:
            db.cursor.execute(
                f'UPDATE {self.name} SET user_value = ? WHERE name = ?',
                (user_value, name),
            )


setting_db = _Setting()