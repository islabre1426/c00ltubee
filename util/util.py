import os
from pathlib import Path
import sys
from uuid import UUID


current_os = sys.platform


def get_root_dir() -> Path:
    return Path(Path(__file__).parent.parent)


def get_app_data_location() -> Path:
    match current_os:
        case 'win32':
            return Path(os.environ['LOCALAPPDATA'], 'c00ltubee')

        case 'linux':
            return Path(Path.home(), '.local', 'share', 'c00ltubee')

        case _:
            raise RuntimeError(f'Unsupported platform: {current_os}')


# Reference: https://stackoverflow.com/a/33245493
def is_valid_uuid(id: str, version: int = 4):
    try:
        uuid_obj = UUID(id, version = version)

    except ValueError:
        return False
    
    return str(uuid_obj) == id