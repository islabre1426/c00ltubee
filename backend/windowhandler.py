import math

import webview


def handle_sidebar(extend: bool):
    current_window = webview.active_window()

    if not current_window:
        return

    current_size = {
        'width': current_window.width,
        'height': current_window.height,
    }

    if extend:
        new_width = math.floor(current_size['width'] * 1.5)
    else:
        new_width = math.floor(current_size['width'] / 1.5)
    
    current_window.resize(new_width, current_size['height'])


def folder_picker():
    current_window = webview.active_window()

    selected_folder = current_window.create_file_dialog(webview.FileDialog.FOLDER)

    if selected_folder is None:
        return None
    
    return selected_folder[0]