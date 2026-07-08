just_dir := justfile_directory()
main_file := join(just_dir, 'main.py')
win_spec := join(just_dir, 'c00ltubee-windows.spec')
linux_spec := join(just_dir, 'c00ltubee-linux.spec')

default: dev

dev:
	uv run "{{main_file}}" debug

build-win:
	uv run pyinstaller "{{win_spec}}"

build-linux:
	uv run pyinstaller "{{linux_spec}}"

build-clean:
	rm -r build dist