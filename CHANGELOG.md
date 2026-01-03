# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Landing page for information about this project, served via `/docs` folder.
- [Open Graph Protocol](https://ogp.me/) support for `/docs` page.
- Custom scrollbar for UI consistency.
- Overview image of this project architecture.
- Option to choose downloaded file location (default to ~/Downloads).

### Changed

- Use ffmpeg "shared" version instead of static one for size reduction.
- Default filename output now is "%(title)s.%(ext)s" instead of "%(title)s \[%(id)s\].%(ext)s" (yt-dlp default).
- Use [uv](https://docs.astral.sh/uv/) as Python project and package manager instead of traditional `pip` and `requirements.txt`.

## [0.1.0] - 2025-12-22

Due to CHANGELOG.md being added after this release, this section will be left blank.

[Unreleased]: https://github.com/islabre1426/c00ltubee/compare/v0.1.0...main
[0.1.0]: https://github.com/islabre1426/c00ltubee/releases/tag/v0.1.0