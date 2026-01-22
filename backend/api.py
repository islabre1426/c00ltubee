import webview

from threading import Thread

from . import config, downloader

class API:
    def load_settings(self):
        user_settings = config.load_user_setting()

        result = [
            [
                config.GLOBAL_SETTINGS,
                config.DOWNLOADER_SETTINGS,
            ]
        ]

        if user_settings:
            result.append(user_settings)
        
        return {
            'status': 'ok',
            'has_user_config': True if user_settings else False,
            'result': result,
        }
    

    def save_setting(self, setting):
        config.save_user_setting(setting)

        return {
            'status': 'ok',
        }
    

    def start_download(self, urls):
        Thread(
            target = downloader.start_download,
            args = (urls, {}),
            daemon = True,
        ).start()

        return {
            'status': 'ok',
        }
    

    def get_video_info(self, urls):
        results = downloader.get_video_info(urls)

        return {
            'status': 'ok',
            'results': results,
        }
    

    def browse_folder(self):
        current_window = webview.active_window()

        chosen_folder = current_window.create_file_dialog(
            dialog_type = webview.FileDialog.FOLDER
        )

        return {
            'status': 'ok',
            'result': chosen_folder[0] if chosen_folder else None,
        }