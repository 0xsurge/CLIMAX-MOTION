#!/usr/bin/env bash
# Install ComfyUI (github.com/Comfy-Org/ComfyUI) at /opt/ComfyUI with CPU-only torch in its own Python 3.12 env,
# and the SDXL Lightning 4-step checkpoint (ByteDance/SDXL-Lightning, OpenRAIL++ licence: commercial use allowed).
# Not SDXL Turbo: its licence (Stability AI NC Community) is non-commercial. Cloud sessions are fresh each time; rerun this.
set -euo pipefail
D=/opt/ComfyUI
[ -d "$D/.git" ] || git clone -q --depth 1 https://github.com/Comfy-Org/ComfyUI "$D"
[ -x "$D/.venv/bin/python" ] || uv venv -q -p /usr/bin/python3.12 "$D/.venv"
export VIRTUAL_ENV="$D/.venv"
uv pip install -q torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
uv pip install -q -r "$D/requirements.txt"
M="$D/models/checkpoints/sdxl_lightning_4step.safetensors"
[ -s "$M" ] || curl -sSfL --retry 3 -o "$M" https://huggingface.co/ByteDance/SDXL-Lightning/resolve/main/sdxl_lightning_4step.safetensors
echo "ComfyUI $(git -C "$D" log -1 --format=%h) | $(ls -la "$M" | awk '{print $5}') bytes checkpoint"
