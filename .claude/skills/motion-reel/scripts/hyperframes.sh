#!/usr/bin/env bash
# Run the HyperFrames CLI (github.com/heygen-com/hyperframes), pinned, telemetry off, on the pre-installed Chromium when there is one.
#   bash hyperframes.sh init my-film --example=blank --non-interactive --skip-skills
#   cd my-film && bash ../hyperframes.sh render -o out.mp4 --workers 4
# Checked in a cloud session: the swiss-grid starter (10 s, 1080p30) rendered in 14 s with 4 workers, software GPU.
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 HYPERFRAMES_SKIP_SKILLS=1
B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
[ -x "$B" ] && export HYPERFRAMES_BROWSER_PATH="$B"
exec npx -y hyperframes@0.9.13 "$@"
