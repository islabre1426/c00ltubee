import os
from pathlib import Path
import sys


def get_root_dir() -> Path:
    return Path(Path(__file__).parent.parent)


def get_app_data_location() -> Path:
    match sys.platform:
        case 'win32':
            return Path(os.environ['LOCALAPPDATA'], 'c00ltubee')

        case 'linux':
            return Path(Path.home(), '.local', 'share', 'c00ltubee')

        case _:
            raise RuntimeError(f'Unsupported platform: {sys.platform}')