#!/usr/bin/env bash
# Install faster-whisper (github.com/SYSTRAN/faster-whisper) for speech-to-text with word timestamps.
# PyAV is pinned below 17: newer PyAV dropped an option faster-whisper 1.2.1 still passes (metadata_errors).
set -euo pipefail
pip install -q "faster-whisper==1.2.1" "av<17"
python3 -c "import faster_whisper, av; print('faster-whisper', faster_whisper.__version__, '| PyAV', av.__version__)"
