# c00ltubee
A Youtube Downloader inspired by c00lgui appearance.

For end users, go to [Releases](../../releases) to get the binary files.

By default, downloaded files will be saved under `C:\Users\<your-user-name>\Downloads` on Windows or `~/Downloads` on Linux. Setting to change this will be implemented in the future.

## Technologies
- Backend: Flask.
- Frontend: HTML + CSS + JS.
- Downloader: yt-dlp.
- Binary compilation: PyInstaller.

## How to run this software from source
### Requirement
- [uv](https://docs.astral.sh/uv/)
- git

### Setup
#### Clone this repo
```
git clone https://github.com/islabre1426/c00ltubee.git
```

#### Change directory to the repo
```
cd c00ltubee
```

#### Install Python dependencies
```
uv sync
```

#### Install vendor dependencies
Since yt-dlp depends on deno and ffmpeg, to get them, run the download script:
```
uv run python download-vendor.py
```

Append `--help` to above command to get list of options.

#### Run this software
```
uv run python main.py
```

Go to your web browser and open http://127.0.0.1:5000.

Now you're good to go!

## Build this software
To build this software, run:
```
uv run python build.py
```
on Linux or Windows to get binary for respective platform.

## Credit
- Flask: For lightweight web server.
- yt-dlp: For reliable downloader.
- PyInstaller: For binaries distribution.
- uv: For awesome Python project and package manager.
- My friend: For inspiration!
