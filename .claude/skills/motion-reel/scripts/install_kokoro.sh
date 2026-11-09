#!/usr/bin/env bash
# Install Kokoro TTS (kokoro-onnx, Apache 2.0) in its own Python 3.11 env at /opt/kokoro, plus the v1.0 model files.
# Female voices: af_heart (warm, clear), af_bella (smooth), af_nicole (soft, breathy). CPU, fast.
set -euo pipefail
[ -x /opt/kokoro/bin/python ] || uv venv -q -p /usr/bin/python3.11 /opt/kokoro
VIRTUAL_ENV=/opt/kokoro uv pip install -q kokoro-onnx soundfile
mkdir -p /opt/kokoro/models && cd /opt/kokoro/models
for f in kokoro-v1.0.onnx voices-v1.0.bin; do [ -s $f ] || curl -sL -o $f "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f"; done
/opt/kokoro/bin/python -c "import kokoro_onnx; print('kokoro ok')"
