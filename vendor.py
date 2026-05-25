import stat
import sys
import tarfile
from typing import Literal
from dataclasses import dataclass
from hashlib import sha256
import shutil
import zipfile

import requests
from tqdm import tqdm

from pathlib import Path


vendor_dir = Path(Path(__file__).parent, 'vendor')


# --- Spec definition ---
@dataclass
class ArchiveSpec:
    os: Literal['win32', 'linux']
    name: str


@dataclass
class VendorSpec:
    name: str
    base_url: str
    checksum_file: str | None
    base_dir: Path
    archives: list[ArchiveSpec]
    has_top_level_dir: bool


# --- Spec configuration ---
ffmpeg_spec = VendorSpec(
    'ffmpeg',
    'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/',
    'checksums.sha256',
    Path(vendor_dir, 'ffmpeg'),
    [
        ArchiveSpec('win32', 'ffmpeg-n8.1-latest-win64-gpl-shared-8.1.zip'),
        ArchiveSpec('linux', 'ffmpeg-n8.1-latest-linux64-gpl-shared-8.1.tar.xz'),
    ],
    True
)

quickjs_spec = VendorSpec(
    'quickjs',
    'https://bellard.org/quickjs/binary_releases/',
    None,
    Path(vendor_dir, 'quickjs'),
    [
        ArchiveSpec('win32', 'quickjs-win-x86_64-2025-09-13.zip'),
        ArchiveSpec('linux', 'quickjs-linux-x86_64-2025-09-13.zip'),
    ],
    False,
)

specs = [
    ffmpeg_spec,
    quickjs_spec,
]


# --- Main code ---
def download_file(base_url: str, file_name: str, output_dir: Path):
    url = base_url + file_name
    file_path = Path(output_dir, file_name)

    print(f'Downloading {file_name}...')

    response = requests.get(url, stream = True, allow_redirects = True)

    # Check for successful response
    if response.status_code != 200:
        response.raise_for_status()

        # Fallback for raise_for_status()
        raise RuntimeError(f'Request to {url} returned status code {response.status_code}')

    total_size_bytes = int(response.headers.get('Content-Length', 0))
    chunk_size_bytes = 1024

    with tqdm(total = total_size_bytes, unit = 'B', unit_scale = True) as progress_bar:
        with file_path.open('wb') as f:
            for data in response.iter_content(chunk_size_bytes):
                progress_bar.update(len(data))
                f.write(data)
    
    if total_size_bytes != 0 and progress_bar.n != total_size_bytes:
        raise RuntimeError(f'Cannot retrieve file {file_name}')
    
    print(f'{file_name} downloaded.')
    

def calculate_hash(artifact_file: Path):
    hash_sha256 = sha256()
    chunk_size_bytes = 4096

    with artifact_file.open('rb') as f:
        for chunk in iter(lambda: f.read(chunk_size_bytes), b''):
            hash_sha256.update(chunk)
    
    return hash_sha256.hexdigest()


def verify_file(reference_file: Path, artifact_file: Path):
    print(f'Checking {artifact_file} integrity...')

    calculated_hash = calculate_hash(artifact_file)

    with reference_file.open() as rf:
        if calculated_hash in rf.read():
            print('Hash matched.')
        else:
            raise RuntimeError('Hash did not match. The file might be corrupted.')


def extract_file(archive_file: Path, dest_dir: Path):
    archive_file_name = archive_file.name

    print(f'Extracting {archive_file_name} to {dest_dir}...')

    if archive_file_name.endswith('.zip'):
        with zipfile.ZipFile(archive_file) as archive:
            for info in archive.infolist():
                archive.extract(info, dest_dir)

                extracted_path = Path(dest_dir, info.filename)

                if not extracted_path.exists():
                    continue

                if sys.platform == 'linux':
                    # Extract high 16 bits (Unix file mode)
                    mode = info.external_attr >> 16

                    if mode:
                        # For directories, ensure execute permission for traversal
                        if stat.S_ISDIR(extracted_path.stat().st_mode):
                            mode |= 0o111 # Add execute for user/group/others

                        print(f'Copying permission {mode} for {extracted_path}...')

                        extracted_path.chmod(mode & 0o777) # Mask to 777 to avoid extra bits

                        print(f'{extracted_path} permission preserved.')

    elif archive_file_name.endswith('.tar.xz'):
        with tarfile.open(archive_file, 'r:xz') as archive:
            archive.extractall(dest_dir)

    else:
        raise RuntimeError(f'Unsupported archive format for {archive_file}')
    
    print(f'{archive_file_name} extracted.')


def cleanup(paths: list[Path]):
    for p in paths:
        print(f'Cleaning up {p}...')

        if p.is_dir():
            p.rmdir()
        else:
            p.unlink()
        
        print(f'Cleaned {p}')


def process_vendor(spec: VendorSpec):
    cleanup_paths: list[Path] = []

    for archive in spec.archives:
        dest_folder_path = Path(spec.base_dir, archive.os)
        archive_file_path = Path(dest_folder_path, archive.name)

        dest_folder_path.mkdir(parents = True)

        download_file(spec.base_url, archive.name, dest_folder_path)

        cleanup_paths.append(archive_file_path)

    if spec.checksum_file:
        checksum_file_path = Path(spec.base_dir, spec.checksum_file)

        download_file(spec.base_url, spec.checksum_file, spec.base_dir)

        for archive in spec.archives:
            artifact_file_path = Path(spec.base_dir, archive.os, archive.name)
            verify_file(checksum_file_path, artifact_file_path)

        cleanup_paths.append(checksum_file_path)
    
    for archive in spec.archives:
        dest_folder_path = Path(spec.base_dir, archive.os)
        archive_file_path = Path(dest_folder_path, archive.name)

        extract_file(archive_file_path, dest_folder_path)

    cleanup(cleanup_paths)


def move_content_to_parent(folder: Path):
    parent = folder.parent

    print(f'Moving content inside {folder} to {parent}...')

    for item in folder.iterdir():
        dest = Path(parent, item.name)

        # Use rename when possible (faster, preserve metadata)
        try:
            item.rename(dest)
        except OSError:
            shutil.move(item, dest)
    
    # Also try to remove the now-empty folder
    try:
        folder.rmdir()
    except OSError:
        pass

    print(f'Moved content from {folder}.')


def main():
    for spec in specs:
        print(f'Processing vendor {spec.name}...')

        process_vendor(spec)

        print(f'Vendor {spec.name} processed.\n')

        if spec.has_top_level_dir:
            for archive in spec.archives:
                # Make sure .tar.xz is removed from the dir name
                if archive.name.endswith('.tar.xz'):
                    top_level_dir_name = Path(Path(archive.name).stem).stem
                else:
                    top_level_dir_name = Path(archive.name).stem

                top_level_dir_path = Path(spec.base_dir, archive.os, top_level_dir_name)

                print(f'Post-processing...')
                move_content_to_parent(top_level_dir_path)
    
    print('All specs processed. Have a good day.')


if __name__ == '__main__':
    main()