just_dir := justfile_directory()
main_file := join(just_dir, 'main.py')
spec := join(just_dir, 'c00ltubee.spec')
build_path := join(just_dir, 'build')
dist_path := join(just_dir, 'dist')
website_path := join(just_dir, 'website')

default: dev

dev:
	uv run "{{main_file}}" debug

build:
	uv run pyinstaller "{{spec}}"

build-clean:
	rm -r "{{build_path}}" "{{dist_path}}"

website-fetch:
	git worktree add "{{website_path}}" website