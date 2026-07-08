just_dir := justfile_directory()
main_file := join(just_dir, 'main.py')
win_spec := join(just_dir, 'c00ltubee-windows.spec')
linux_spec := join(just_dir, 'c00ltubee-linux.spec')

default: dev-linux


[env('UV_PROJECT_ENVIRONMENT', '.venv-win')]
dev-win:
	uv run "{{main_file}}" debug


[env('UV_PROJECT_ENVIRONMENT', '.venv-linux')]
dev-linux:
	uv run "{{main_file}}" debug


[env('UV_PROJECT_ENVIRONMENT', '.venv-win')]
build-win:
	uv run pyinstaller --workpath build-win "{{win_spec}}"


[env('UV_PROJECT_ENVIRONMENT', '.venv-linux')]
build-linux:
	uv run pyinstaller --workpath build-linux "{{linux_spec}}"


build-clean:
	rm -r build dist