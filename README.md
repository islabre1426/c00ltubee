# c00ltubee
A Youtube video downloader with c00lgui appearance.

Rework in progress!

## How to run this project from source

### Prerequisites
Before starting, make sure the following dependencies are installed:

- Runtime dependencies:
    - Windows: Edge WebView2: pre-installed for Windows 10 and above, if not [download it from here](https://developer.microsoft.com/en-us/microsoft-edge/webview2?form=MA13LH) (Evergreen version recommended)
    - Linux: Qt WebEngine: Consult your distro documentation!

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
