#!/bin/sh

set -eu

root_dir="$(dirname "$(realpath "$0")")"
vendor_dir="$root_dir/src/vendor"

download() {
    download_url="$1"
    output_dir="$2"

    filename="$(basename "$download_url")"

    echo "Downloading $filename..."

    curl -fLO "$download_url" --output-dir "$output_dir" --skip-existing
}

checksum() {
    input_file="$1"
    checksum_file="$2"

    filename="$(basename "$input_file")"

    echo "Verifying $filename..."

    hash="$(sha256sum "$input_file")"

    if [ "$?" -ne 0 ]; then
        exit 1
    fi

    hash="$(echo $hash | cut -d " " -f 1)"

    if grep -qi "$hash" "$checksum_file"; then
        echo "Hash matched in checksum file."
    else
        echo "Hash did not match! The file might be compromised."
        echo "Exiting."

        exit 1
    fi
}

extract() {
    input_file="$1"
    dest_dir="$2"

    filename="$(basename "$input_file")"

    echo "Extracting $filename..."

    unzip -n "$input_file" -d "$dest_dir"
}

cleanup() {
    input="$@"

    for i in $input; do
        echo "Cleaning up $i..."
        rm -r "$i"
    done
}

ffmpeg() {
    file="ffmpeg-n8.1-latest-win64-gpl-shared-8.1.zip"
    checksum_file="checksums.sha256"
    url="https://github.com/BtbN/FFmpeg-Builds/releases/download/latest"
    dest_dir="$vendor_dir/ffmpeg"

    mkdir -p "$dest_dir"
    download "$url/$file" "$dest_dir"
    download "$url/$checksum_file" "$dest_dir"

    checksum "$dest_dir/$file" "$dest_dir/$checksum_file"

    extract "$dest_dir/$file" "$dest_dir"

    folder="$(basename "$file" .zip)"

    echo "Moving content in $folder to $dest_dir"
    mv $dest_dir/$folder/* "$dest_dir"

    cleanup "$dest_dir/$file" "$dest_dir/$checksum_file" "$dest_dir/$folder"
}

quickjs() {
    file="quickjs-win-x86_64-2025-09-13.zip"
    url="https://bellard.org/quickjs/binary_releases"
    dest_dir="$vendor_dir/quickjs"

    mkdir -p "$dest_dir"
    download "$url/$file" "$dest_dir"

    extract "$dest_dir/$file" "$dest_dir"

    cleanup "$dest_dir/$file"
}

main() {
    ffmpeg
    quickjs
}

main