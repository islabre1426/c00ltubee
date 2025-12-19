'''
A script for downloading vendor dependencies for development purpose.
'''
# Reference:
# - https://stackoverflow.com/a/37573701
# - https://scribe.rip/@armaansinghbhau8/automate-file-downloads-from-urls-with-python-a-simple-guide-9a98cde10095
# - https://scribe.rip/@i.doganos/extracting-and-renaming-files-from-zip-archives-in-python-3c015ec21280

from tqdm import tqdm
import requests

from pathlib import Path
import hashlib
import shutil
import tarfile, zipfile

VENDOR_DIR = Path('vendor')

# FFMPEG source is tag-based, and has seperate checksum file
FFMPEG = {
    'source': 'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/',
    'checksum': 'checksums.sha256',
    'archive': {
        'linux': 'ffmpeg-n8.0-latest-linux64-gpl-8.0.tar.xz',
        'windows': 'ffmpeg-n8.0-latest-win64-gpl-8.0.zip',
    },
}

# Deno is release-based (no tag), and its checksum file is the archive name + '.sha256sum'
DENO = {
    'source': 'https://github.com/denoland/deno/releases/latest/download/',
    'archive': {
        'linux': 'deno-x86_64-unknown-linux-gnu.zip',
        'windows': 'deno-x86_64-pc-windows-msvc.zip'
    },
    'ext': {
        'linux': 'deno',
        'windows': 'deno.exe'
    }
}

def download_file(url: str, save_path: Path) -> bool:
    try:
        response = requests.get(url, stream = True)

        if response.status_code == 200:
            total_size = int(response.headers.get('Content-Length', 0))
            block_size = 1024

            with tqdm(total = total_size, unit = 'B', unit_scale = True) as progress_bar:
                with open(save_path, 'wb') as file:
                    for data in response.iter_content(block_size):
                        progress_bar.update(len(data))
                        file.write(data)
            
            if total_size != 0 and progress_bar.n != total_size:
                raise RuntimeError(f'Could not download file {save_path}')
            
            return True
        else:
            print(f"Failed to download file {save_path}. Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        

def download_files_list(urls: list[str], save_folder: Path):
    for url in urls:
        try:
            filename = url.split('/')[-1]
            save_path = Path(save_folder, filename)

            if save_path.exists():
                print(f'WARNING: File {filename} already exists in {save_path}. Skipping.')
                continue

            print(f'Downloading {filename} to {save_path}...')
            success = download_file(url, save_path)
            
            if success:
                print('Download completed')
            print()

        except Exception as e:
            print(f'Failed to download {url}: {e}')


def calculate_checksum(filename: Path) -> str:
    with filename.open('rb') as f:
        file_hash = hashlib.sha256()

        while chunk := f.read(8192):
            file_hash.update(chunk)

    return file_hash.hexdigest()


def check_file_integrity(filename: Path, checksum_file: Path) -> bool:
    file_hash = calculate_checksum(filename)

    with checksum_file.open() as f:
        checksum_content = f.readlines()

    for line in checksum_content:
        if file_hash in line or file_hash.upper() in line:
            print(f'{filename} integrity verified')
            return True
        
    print(f'WARNING: {filename} expected hash not found in {checksum_file}')
    return False


def download_ffmpeg(save_folder: Path):
    ffmpeg_urls = [
        FFMPEG['source'] + FFMPEG['checksum'],
    ]

    for archive in FFMPEG['archive']:
        ffmpeg_urls.append(FFMPEG['source'] + FFMPEG['archive'][archive])

    download_files_list(ffmpeg_urls, save_folder)

def extract_ffmpeg(folder_contain, overwrite = True):
    for archive in FFMPEG['archive']:
        archive_path = Path(folder_contain, FFMPEG['archive'][archive])

        if archive_path.exists():
            dest_dir = Path(folder_contain, archive)

            if dest_dir.exists():
                if not overwrite:
                    print(f'WARNING: {archive} already exists in {folder_contain}. Pass --overwrite to force renaming.')
                    print('Skipping.')
                    continue
                else:
                    shutil.rmtree(dest_dir)

            print(f'Extracting {archive_path}...')

            if str(archive_path).endswith('.tar.xz'):
                with tarfile.open(archive_path, 'r:xz') as f:
                    archive_parent_folder = f.getnames()[0]
                    f.extractall(folder_contain)

            elif str(archive_path).endswith('.zip'):
                with zipfile.ZipFile(archive_path) as f:
                    archive_parent_folder = f.namelist()[0]
                    f.extractall(folder_contain)

            print(f'Renaming {archive_parent_folder} to {archive}...')
            Path(folder_contain, archive_parent_folder).rename(dest_dir)

            print('Done')
            print('Extraction completed')
        else:
            print(f'Error: Archive does not exist: {archive_path}')

def clean_up_ffmpeg(folder_contain):
    print('Cleaning up downloaded ffmpeg files...')

    Path(folder_contain, FFMPEG['checksum']).unlink()

    for archive in FFMPEG['archive']:
        Path(folder_contain, FFMPEG['archive'][archive]).unlink()
    
    print('Cleanup completed')

def download_deno(save_folder: Path):        
    deno_urls = []

    for archive in DENO['archive']:
        deno_urls.append(DENO['source'] + DENO['archive'][archive])
        deno_urls.append(DENO['source'] + DENO['archive'][archive] + '.sha256sum')

    download_files_list(deno_urls, save_folder)

def extract_deno(folder_contain, overwrite = True):
    for archive in DENO['archive']:
        archive_path = Path(folder_contain, DENO['archive'][archive])

        if archive_path.exists():
            dest = Path(folder_contain, DENO['ext'][archive])

            if dest.exists():
                if not overwrite:
                    print(f'WARNING: {dest} already exists in {folder_contain}. Pass --overwrite to force renaming.')
                    print('Skipping.')
                    continue
                else:
                    dest.unlink()

            print(f'Extracting {archive_path}...')

            shutil.unpack_archive(archive_path, folder_contain)

            print('Extraction completed')
        else:
            print(f'Error: Archive does not exist: {archive_path}')

def clean_up_deno(folder_contain):
    print('Cleaning up downloaded deno files...')

    for archive in DENO['archive']:
        Path(folder_contain, DENO['archive'][archive]).unlink()
        Path(folder_contain, DENO['archive'][archive] + '.sha256sum').unlink()
    
    print('Cleanup completed')

def main():
    ffmpeg_save_folder = Path(VENDOR_DIR, 'ffmpeg')
    deno_save_folder = Path(VENDOR_DIR, 'deno')

    ffmpeg_save_folder.mkdir(parents = True, exist_ok = True)
    deno_save_folder.mkdir(parents = True, exist_ok = True)

    download_ffmpeg(ffmpeg_save_folder)

    for archive in FFMPEG['archive']:
        check_file_integrity(
            Path(ffmpeg_save_folder, FFMPEG['archive'][archive]),
            Path(ffmpeg_save_folder, FFMPEG['checksum']),
        )
    
    extract_ffmpeg(ffmpeg_save_folder)
    clean_up_ffmpeg(ffmpeg_save_folder)

    download_deno(deno_save_folder)

    for archive in DENO['archive']:
        check_file_integrity(
            Path(deno_save_folder, DENO['archive'][archive]),
            Path(deno_save_folder, DENO['archive'][archive] + '.sha256sum'),
        )
    
    extract_deno(deno_save_folder)
    clean_up_deno(deno_save_folder)

if __name__ == '__main__':
    main()