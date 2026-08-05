#!/bin/sh

set -eu

artifact="website/"
remote_host="root@personal-server"
name="c00ltubee"
dest="/var/www/html/$name"

echo "Syncing content to remote server."
rsync -av --delete "$artifact" "$remote_host:$dest"

echo "Successfully uploaded."