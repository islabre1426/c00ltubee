from PySide6.QtCore import QFile, QIODevice
from PySide6.QtUiTools import QUiLoader
from PySide6.QtWidgets import QApplication

from pathlib import Path
import sys


if __name__ == '__main__':
	app = QApplication(sys.argv)

	ui_file_name = Path(Path(__file__).parent, 'ui', 'mainwindow.ui')
	ui_file = QFile(ui_file_name)

	if not ui_file.open(QIODevice.OpenModeFlag.ReadOnly):
		raise RuntimeError(f'Cannot open {ui_file_name}: {ui_file.errorString()}')

	loader = QUiLoader()
	window = loader.load(ui_file)
	ui_file.close()

	if not window:
		raise RuntimeError(loader.errorString())

	window.show()

	sys.exit(app.exec())