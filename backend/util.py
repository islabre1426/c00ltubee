import tkinter
from tkinter import filedialog
from pathlib import Path
import ctypes

from . import config

def browse_folder() -> str:
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

    # Properly format path for respective platform
    chosen_folder = str(Path(chosen_folder))

    return chosen_folder