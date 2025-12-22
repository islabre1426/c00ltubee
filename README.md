# c00ltubee
A Youtube Downloader inspired by c00lgui appearance.

For end users, go to Releases to get the binary files.

## Technologies
- Backend: Flask.
- Frontend: HTML + CSS + JS.
- Downloader: yt-dlp.
- Binary compilation: PyInstaller.

## How to run this software from source
### Requirement
- Python installed (latest recommended)

### Setup
#### Clone this repo
```
git clone https://github.com/islabre1426/c00ltubee.git
```

#### Change directory to the repo
```
cd c00ltubee
```

#### Create virtual environment
On Windows (using PowerShell):
```
python -m venv .venv-windows
.\.venv-windows\Scripts\Activate.ps1
```

On Linux (using bash):
```
python -m venv .venv-linux
source .venv-linux/bin/activate
```

#### Install dependencies
```
pip install -r requirements.txt
```

#### Run this software
```
python main.py
```

Go to your web browser and open http://127.0.0.1:5000.

Now you're good to go!

## Credit
- Flask: For lightweight web server.
- yt-dlp: For reliable downloader.
- PyInstaller: For binaries distribution.
- My friend: For inspiration!