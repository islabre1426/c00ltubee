from pathlib import Path
import platform

import PyInstaller.__main__

CURRENT_OS = platform.system().lower()
ENTRY = 'c00ltubee.py'
SPEC = {
    'linux': 'c00ltubee-linux.spec',
    'windows': 'c00ltubee-windows.spec',
}

def main():
    for os in SPEC:
        distpath = f'dist-{os}'
        workpath = f'build-{os}'

        if os == CURRENT_OS:
            print(f'Building binary for {os}...')

            PyInstaller.__main__.run([
                SPEC[os],
                '--distpath', distpath,
                '--workpath', workpath,
                '--clean',
                '--noconfirm',
            ])

            print(f'Done.')
        else:
            print(f'Not currently on {os}. Switch to the platform and run the code again.')
            print(f"Ignore this message if you've already built the binary for this platform.")


if __name__ == '__main__':
    main()