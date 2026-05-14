import math

import webview


class API:
    def extendSidebar(self, extend: bool):
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