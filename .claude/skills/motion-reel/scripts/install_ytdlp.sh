#!/usr/bin/env bash
# yt-dlp (github.com/yt-dlp/yt-dlp) for pulling reference videos and public-domain or licensed footage.
# Extras: curl_cffi for browser impersonation (Vimeo and others ask for it); Node.js as the JS runtime YouTube's player now needs.
# Known limits from a cloud session (checked): YouTube serves metadata but refuses the video data (HTTP 403, it blocks datacenter IPs);
# Wikimedia refuses too; archive.org works. FFmpeg ignores HTTPS_PROXY, so --download-sections fails here: download whole, trim with ffmpeg.
set -euo pipefail
pip install -q -U "yt-dlp[default,curl-cffi]"
mkdir -p ~/.config/yt-dlp && printf -- '--js-runtimes node\n' > ~/.config/yt-dlp/config
yt-dlp --version
