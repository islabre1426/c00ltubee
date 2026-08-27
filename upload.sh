#!/bin/sh

set -eu

if ! uname | grep -q -e MSYS -e Linux; then
    echo "Please run under MSYS2, Linux or WSL to ensure compatibility."
    exit 1
fi

if ! command -v rsync >/dev/null; then
    echo "rsync required. Please install rsync first."
    exit 1
fi

artifact="website/"
remote_host="root@personal-server"
name="c00ltubee"
dest="/var/www/html/$name"

echo "Syncing content to remote server."
rsync -av --delete "$artifact" "$remote_host:$dest"

echo "Successfully uploaded."