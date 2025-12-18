from pathlib import Path
import json

def load_file(file: Path) -> str | None:
    try:
        with file.open() as f:
            return f.read()
    except OSError as err:
        print(f'Error: Failed to load file {file}: {err}')
        return None

def save_setting(file: Path, setting: dict) -> None:
    def save_json(file: Path, obj: dict) -> None:
        with file.open('w') as f:
            f.write(json.dumps(obj, indent = 4))
            return None

    current_config_str = load_file(file)

    if current_config_str is None:
        save_json(file, setting)
        return None
    
    setting_new: dict = json.loads(current_config_str)
    setting_new.update(setting)

    save_json(file, setting_new)
    return None