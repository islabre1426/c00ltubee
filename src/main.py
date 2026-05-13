from PySide6.QtCore import QUrl
from PySide6.QtWebEngineWidgets import QWebEngineView
from PySide6.QtWidgets import QApplication

from pathlib import Path
import sys


ROOT_DIR = Path(__file__).parent


def main(args: list[str]):
	app = QApplication(args)

	ui_file = Path(ROOT_DIR, 'ui', 'index.html')

	view = QWebEngineView()
	view.setWindowTitle('c00ltubee')
	view.setMinimumSize(800, 600)
	view.resize(800, 600)

	view.load(QUrl.fromLocalFile(ui_file))

	view.show()

	sys.exit(app.exec())


if __name__ == '__main__':
	main(sys.argv)