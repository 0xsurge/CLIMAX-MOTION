#!/bin/sh
# sh test-render.sh [seconds] [preset]: scaffold a film in a temp folder and render a short test with sound.
set -e
SECS="${1:-5}"; PRESET="${2:-blank}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TMP="$(mktemp -d)"; F="$TMP/film"
node "$HERE/../engine/lib/motion.test.mjs"
node "$HERE/scaffold.mjs" "$F" --preset "$PRESET" >/dev/null
cd "$F"
python3 "$HERE/music.py" --bpm 120 --dur "$SECS" --out audio/music.wav
python3 "$HERE/beats.py" audio/music.wav --out beats.json
echo '[{"t":0.2,"type":"click"},{"t":0.5,"type":"whoosh","vol":0.4},{"t":2.0,"type":"pop"},{"t":4.0,"type":"thump","vol":0.6}]' > cues.json
node "$HERE/sfx.mjs" cues.json --dur "$SECS" --out audio/sfx.wav
node "$HERE/render.mjs" . --fmt=16x9 --fps=30 --dur="$SECS" --sub=2 --out=renders/16x9.mp4 >/dev/null
python3 "$HERE/mix.py" --video renders/16x9.mp4 --music audio/music.wav --sfx audio/sfx.wav --out "$F/out/test.mp4"
echo "OK: $F/out/test.mp4"
