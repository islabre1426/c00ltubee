import webview

import tkinter
from tkinter import filedialog
from pathlib import Path
import ctypes

from . import config


def browse_folder() -> str | None:
    current_window = webview.active_window()

    # The app is running via Pywebview
    if current_window:
        # See https://pywebview.flowrl.com/api/#window-create-file-dialog for documentation
        chosen_folder = current_window.create_file_dialog(webview.FileDialog.FOLDER)

        if chosen_folder:
            return chosen_folder[0]

        return None

    # The app is running under a normal browser
    chosen_folder = browse_folder_fallback()

    return chosen_folder


def browse_folder_fallback() -> str | None:
    # Create an empty window for folder picker.
    # This is useful for working around the web browser not having native folder picker.
    # Also set DPI Awareness to avoid blurry UI.
    ctypes.windll.shcore.SetProcessDpiAwareness(1)
    hidden_tk = tkinter.Tk()
    hidden_tk.iconphoto(True, tkinter.PhotoImage(file = Path(config.ROOT_DIR, 'frontend', 'icons', 'favicon.png')))

    # On Windows, the window may be placed below others, so explicitly put it at the top.
    hidden_tk.attributes('-topmost', True)

    # Hide the empty window
    hidden_tk.withdraw()

    # IMPORTANT: make sure all events are loaded before displaying folder picker, otherwise it won't show up. 
    hidden_tk.update()

    chosen_folder = filedialog.askdirectory(parent = hidden_tk)

    # Clean up
    hidden_tk.attributes('-topmost', False)
    hidden_tk.destroy()

    if chosen_folder != "":
        # Properly format path for respective platform
        chosen_folder = str(Path(chosen_folder))

        return chosen_folder

    return None