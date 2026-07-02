from pathlib import Path

from database.handler import DBHandler


class Setting:
    def __init__(self):
        self.name = 'setting'
        self.db_handler = DBHandler(self.name)

        self.init()
    

    def init(self):
        if not self.db_handler.db_exists():
            # Connect to initialize database
            self.db_handler.connect()
            self.db_handler.load_sql_file(self.name)

            # Download location is different for each OSes, hence it is inserted manually here
            download_location = str(Path(Path.home(), 'Downloads'))

            with self.db_handler.connection as conn:
                conn.execute(
                    f'INSERT INTO {self.name} (name, value_type, default_value) VALUES (?, ?, ?)',
                    ('download_location', 'location_folder', download_location),
                )

        else:
            # Connect to use existing database
            self.db_handler.connect()

        # Shorthand for faster reference
        self.connection = self.db_handler.connection
    

    def get_by_name(self, name: str):
        with self.connection as conn:
            cursor = conn.execute(
                f'SELECT * FROM {self.name} WHERE name = ?',
                (name,),
            )

            result = cursor.fetchone()

            if result is None:
                raise ValueError('Setting not found:', name)
            
            return result
        
    
    def format_row_as_dict(self, row):
        return {
            'name': row[0],
            'value_type': row[1],
            'default_value': row[2],
            'user_value': row[3],
        }
    

    def get_by_name_as_dict(self, name: str):
        row = self.get_by_name(name)

        return self.format_row_as_dict(row)
    

    def get_value_by_name(self, name: str):
        setting = self.get_by_name_as_dict(name)
        default_value = setting.get('default_value')
        user_value = setting.get('user_value')

        if user_value is not None:
            return user_value
        
        if default_value is None:
            raise KeyError(f'default_value not found for setting name {name}')

        return default_value


    def get_all_as_list(self):
        with self.connection as conn:
            result: list[dict] = []

            for row in conn.execute(f'SELECT * FROM {self.name}'):
                result.append(self.format_row_as_dict(row))
            
            return result
    

    def update_user_value_by_name(
        self,
        name: str,
        user_value: str,
    ):
        with self.connection as conn:
            conn.execute(
                f'UPDATE {self.name} SET user_value = ? WHERE name = ?',
                (user_value, name),
            )


setting_db = Setting()