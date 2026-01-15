just_dir := justfile_directory()
main_py := join(just_dir, "main.py")
ui_file := join(just_dir, "src", "ui", "mainwindow.ui")

default: main

main:
	uv run "{{main_py}}"

design:
	uv run pyside6-designer "{{ui_file}}" &