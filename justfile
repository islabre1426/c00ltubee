just_dir := justfile_directory()
main_file := join(just_dir, 'main.py')
spec := join(just_dir, 'c00ltubee.spec')
build_path := join(just_dir, 'build')
dist_path := join(just_dir, 'dist')
website_path := join(just_dir, 'website')

remote_name := 'personal-server'
remote_website_path := '/var/www/html/c00ltubee/'

default: dev

dev:
	uv run "{{main_file}}" debug

build:
	uv run pyinstaller "{{spec}}"

build-clean:
	rm -r "{{build_path}}" "{{dist_path}}"

website-fetch:
	git worktree add "{{website_path}}" website

[script]
website-deploy:
	cd "{{website_path}}"
	git add .
	git commit -m "Deployed website"
	git push origin website
	ssh "{{remote_name}}" "cd {{remote_website_path}} && git pull"
	cd ..