just_dir := justfile_directory()
main_file := join(just_dir, 'main.py')
spec := join(just_dir, 'c00ltubee-windows.spec')

default: dev

dev:
	uv run "{{main_file}}" debug

build:
	uv run pyinstaller "{{spec}}"

clean:
	rm -r build dist