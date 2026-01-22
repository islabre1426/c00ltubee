#!/bin/sh

set -eu

vendor_dir="$(dirname "$0")/vendor"

log() {
    message="$1"

    printf "%s\n" "$message"
}

download() {
    url="$1"
    out_dir="$2"

    dl_filename="$(basename "$url")"

    log "Downloading $dl_filename to $out_dir"

    curl -fLO --no-clobber --output-dir "$out_dir" "$url"
}

check_integrity() {
    artifact="$1"
    checksum_file="$2"

    log "Checking $artifact integrity via $checksum_file"

    hash="$(sha256sum "$artifact" | cut -d ' ' -f 1)"

    if grep -qi "$hash" "$checksum_file"; then
        log "$artifact hash matched"
    else
        log "$artifact hash did not match. The file may be corrupted"
        return 1
    fi
}

extract() {
    archive="$1"
    out_dir="$2"

    log "Extracting $archive to $out_dir"

    case $archive in
        *.zip)
            unzip -q "$archive" -d "$out_dir"
            ;;
        *)
            log "Unsupported archive: $archive"
    esac
}

cleanup() {
    target="$1"

    log "Cleaning up $target"

    if [ -f "$target" ]; then
        rm "$target"
    elif [ -d "$target" ]; then
        rm -r "$target"
    else
        log "Unknown target type for $target"
        return 1
    fi
}

process_vendor() {
    source_url="$1"
    filename="$2"
    checksum_file="$3"
    out_dir="$4"
    keep_checksum="${5:-false}"

    log "Creating $out_dir"
    mkdir -p "$out_dir"

    urls="
    ${source_url}${filename}
    ${source_url}${checksum_file}
    "

    for i in $urls; do
        download "$i" "$out_dir"
    done

    file_path="${out_dir}${filename}"
    checksum_file_path="${out_dir}${checksum_file}"

    check_integrity "$file_path" "$checksum_file_path"

    extract "$file_path" "$out_dir"

    cleanup "$file_path"

    if [ "$keep_checksum" = false ]; then
        log "Keep checksum is false"
        cleanup "$checksum_file_path"
    else
        log "Keep checksum is true, skipping"
    fi
}

ffmpeg() {
    source_url="https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/"
    filename="ffmpeg-n8.0-latest-win64-gpl-shared-8.0.zip"
    checksum_file="checksums.sha256"
    out_dir="${vendor_dir}/ffmpeg/"

    process_vendor "$source_url" "$filename" "$checksum_file" "$out_dir"

    file_basename="$(basename "$filename" .zip)"
    after_extract_dir="${out_dir}${file_basename}"

    log "Moving contents inside $file_basename to $out_dir"
    mv $after_extract_dir/* "$out_dir"

    cleanup "$after_extract_dir"
}

deno() {
    source_url="https://github.com/denoland/deno/releases/latest/download/"
    filename="deno-x86_64-pc-windows-msvc.zip"
    checksum_file="${filename}.sha256sum"
    out_dir="${vendor_dir}/deno/"

    process_vendor "$source_url" "$filename" "$checksum_file" "$out_dir"
}

main() {
    cleanup "$vendor_dir"

    ffmpeg
    deno

    log "Finished!"
}

main