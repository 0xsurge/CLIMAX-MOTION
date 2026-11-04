#!/usr/bin/env bash
# Install Chatterbox TTS (github.com/resemble-ai/chatterbox) in its own Python 3.11 env at /opt/chatterbox, CPU-only torch.
# Kept separate from the system Python so its pinned numpy/torch/transformers can't break faster-whisper, PyAV or anything else.
# setuptools<81 supplies pkg_resources, which Chatterbox's Perth watermarker imports; without it the model fails to load.
set -euo pipefail
[ -x /opt/chatterbox/bin/python ] || uv venv -q -p /usr/bin/python3.11 /opt/chatterbox
export VIRTUAL_ENV=/opt/chatterbox
uv pip install -q torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cpu
uv pip install -q "chatterbox-tts==0.1.7" "setuptools<81"
/opt/chatterbox/bin/python -c "import torch, perth; from importlib.metadata import version; assert perth.PerthImplicitWatermarker; print('chatterbox-tts', version('chatterbox-tts'), '| torch', torch.__version__)"
