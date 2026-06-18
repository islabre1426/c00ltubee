import os
from pathlib import Path
import sys


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