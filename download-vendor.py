'''
Vendor dependency downloader for development use.
'''

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import hashlib
import requests
import shutil
import tarfile, zipfile
import sys

from tqdm import tqdm

# -------------
# Configuration
# -------------

VENDOR_DIR = Path('vendor')

BLOCK_SIZE = 1024 * 1024    # 1MB


@dataclass(frozen = True)
class VendorArchive:
    platform: str
    filename: str
    extracted_name: str | None = None   # None = extract as-is


@dataclass(frozen = True)
class VendorSpec:
    name: str
    source_url: str
    archives: list[VendorArchive]
    checksum_file: str | None
    checksum_suffix: str | None = None  # for per-archive checksum files


FFMPEG = VendorSpec(
    name = 'ffmpeg',
    source_url = 'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/',
    checksum_file = 'checksums.sha256',
    archives = [
        VendorArchive(
            platform = 'linux',
            filename = 'ffmpeg-n8.0-latest-linux64-gpl-8.0.tar.xz',
            extracted_name = 'linux',
        ),
        VendorArchive(
            platform = 'windows',
            filename = 'ffmpeg-n8.0-latest-win64-gpl-8.0.zip',
            extracted_name = 'windows',
        )
    ]
)


DENO = VendorSpec(
    name = 'deno',
    source_url = 'https://github.com/denoland/deno/releases/latest/download/',
    checksum_file = None,
    checksum_suffix = '.sha256sum',
    archives = [
        VendorArchive(
            platform = 'linux',
            filename = 'deno-x86_64-unknown-linux-gnu.zip',
            extracted_name = 'deno',
        ),
        VendorArchive(
            platform = 'windows',
            filename = 'deno-x86_64-pc-windows-msvc.zip',
            extracted_name = 'deno.exe'
        )
    ]
)

# ----------
# Networking
# ----------

def download_file(
    session: requests.Session,
    url: str,
    dest: Path,
) -> None:
    if dest.exists():
        return
    
    with session.get(url, stream = True, timeout = 30) as r:
        r.raise_for_status()
        total = int(r.headers.get('Content-Length', 0))

        with dest.open('wb') as f, tqdm(
            total = total,
            unit = 'B',
            unit_scale = True,
            desc = dest.name,
        ) as progress_bar:
            for chunk in r.iter_content(BLOCK_SIZE):
                if chunk:
                    f.write(chunk)
                    progress_bar.update(len(chunk))
        
        if total and progress_bar.n != total:
            raise RuntimeError(f'Incomplete download: {dest}')


def download_many(
    session: requests.Session,
    urls: Iterable[str],
    target_dir: Path
) -> None:
    for url in urls:
        dest = target_dir / url.split('/')[-1]
        download_file(session, url, dest)

# --------
# Checksum
# --------

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()


def verify_checksum(artifact: Path, checksum_file: Path) -> None:
    digest = sha256(artifact)

    with checksum_file.open() as f:
        for line in f:
            # Checksum format can be different for Windows and Linux
            # Hence it's suitable to perform substring matches for checking
            if digest.lower() in line.lower():
                return
    
    raise RuntimeError(f'Checksum verification failed: {artifact.name}')

# ----------
# Extraction
# ----------

def extract_archive(
    archive: Path,
    extract_target: Path,
    overwrite: bool = True,
) -> None:
    if extract_target.exists():
        if overwrite:
            if extract_target.is_dir():
                shutil.rmtree(extract_target)
            elif extract_target.is_file():
                extract_target.unlink(missing_ok = True)
            else:
                raise RuntimeError(f'Invalid destination type for {extract_target}')
        else:
            return
    
    if archive.suffix == '.zip':
        with zipfile.ZipFile(archive) as z:
            # Prevent silent corruption on root layout change
            roots = {p.split('/')[0] for p in z.namelist()}

            if len(roots) != 1:
                raise RuntimeError(f'Archive has multiple roots: {archive}')

            root = roots.pop()
            z.extractall(archive.parent)
    elif archive.suffixes[-2:] == ['.tar', '.xz']:
        with tarfile.open(archive, 'r:xz') as t:
            # Similar to above
            roots = {p.split('/')[0] for p in t.getnames()}

            if len(roots) != 1:
                raise RuntimeError(f'Archive has multiple roots: {archive}')

            root = roots.pop()
            t.extractall(archive.parent)
    else:
        raise ValueError(f'Unsupported archive: {archive}')
    
    (archive.parent / root).rename(extract_target)


# ---------
# Utilities
# ---------

def detect_platform() -> str:
    if sys.platform.startswith('win'):
        return 'windows'
    elif sys.platform.startswith('linux'):
        return 'linux'
    raise RuntimeError(f'Unsupported platform: {sys.platform}')

# -----------------
# Vendor processing
# -----------------

def process_vendor(spec: VendorSpec, overwrite: bool = True) -> None:
    vendor_dir = VENDOR_DIR / spec.name
    vendor_dir.mkdir(parents = True, exist_ok = True)

    platform = detect_platform()

    archives = [a for a in spec.archives if a.platform == platform]

    if not archives:
        raise RuntimeError(f'No archives defined for vendor "{spec.name}" on platform "{platform}"')

    # Download vendor
    with requests.Session() as session:
        download_urls = []

        if spec.checksum_file:
            download_urls.append(spec.source_url + spec.checksum_file)
        
        for a in archives:
            download_urls.append(spec.source_url + a.filename)
            if spec.checksum_suffix:
                download_urls.append(spec.source_url + a.filename + spec.checksum_suffix)
        
        download_many(session, download_urls, vendor_dir)
    
    # Integrity checks
    for a in archives:
        archive_path = vendor_dir / a.filename

        if spec.checksum_file:
            verify_checksum(
                archive_path,
                vendor_dir / spec.checksum_file
            )
        elif spec.checksum_suffix:
            verify_checksum(
                archive_path,
                vendor_dir / (a.filename + spec.checksum_suffix),
            )
    
    # Extraction
    for a in archives:
        extract_archive(
            vendor_dir / a.filename,
            vendor_dir / a.extracted_name,
            overwrite = overwrite
        )
    
    # Cleanup
    for a in archives:
        (vendor_dir / a.filename).unlink(missing_ok = True)
        if spec.checksum_suffix:
            (vendor_dir / (a.filename + spec.checksum_suffix)).unlink(missing_ok = True)
    
    if spec.checksum_file:
        (vendor_dir / spec.checksum_file).unlink(missing_ok = True)

# -----------
# Entry point
# -----------

def main() -> None:
    process_vendor(FFMPEG)
    process_vendor(DENO)


if __name__ == '__main__':
    main()