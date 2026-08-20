# c00ltubee
A Youtube video downloader with c00lgui appearance.

## How to run this project from source

### Prerequisites
Before starting, make sure the following dependencies are installed:

- Runtime dependencies:
    - Windows: Edge WebView2: pre-installed for Windows 10 and above, if not [download it from here](https://developer.microsoft.com/en-us/microsoft-edge/webview2?form=MA13LH) (Evergreen version recommended)
    - Linux:
        - PyGObject: [see this documentation for installing](https://pygobject.gnome.org/getting_started.html)
        - WebKitGTK: Consult your distro documentation!

- Development dependencies:
    - uv
    - just
    - git

### How to run
Clone this repository:
```bash
git clone https://github.com/islabre1426/c00ltubee
```

Change directory to the project:
```bash
cd c00ltubee
```

Install `yt-dlp` recommended dependencies:
```bash
uv run vendor.py
```

Finally, run this project:
```bash
just
```

This will first install required Python dependencies to a Virtual Environment and then run the app.

### How to build
Make sure you're able to run this project. If not, [see here](#how-to-run).

After that, run:
```bash
just build-win
```

for Windows or
```bash
just build-linux
```

for Linux.

## Credit
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [ffmpeg](https://ffmpeg.org/)
- [quickjs](https://bellard.org/quickjs/)
- My friend for inspiration!

## Copyright Notice
Copyright 2026 Islabre.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.