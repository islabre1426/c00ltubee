just_dir := justfile_directory()
main_file := join(just_dir, 'src', 'main.py')

default: dev

dev:
	uv run "{{main_file}}"

design:
	uv run pyside6-designer