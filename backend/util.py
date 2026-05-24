from pathlib import Path


def get_root_dir() -> Path:
    return Path(Path(__file__).parent)