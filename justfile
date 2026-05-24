just_dir := justfile_directory()
main_file := join(just_dir, 'main.py')

default: dev

dev:
	uv run "{{main_file}}" debug