#!/opt/kokoro/bin/python
# Male voiceover with Kokoro (Apache 2.0), am_michael at 0.9 speed (picked by the user). Writes vo/<line>.wav
import json, os, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro('/opt/kokoro/models/kokoro-v1.0.onnx', '/opt/kokoro/models/voices-v1.0.bin'); os.makedirs('vo', exist_ok=True)
FAST = {'n08': 1.0, 'v09': 1.08}   # long lines kept at normal speed so they fit their slots
for key, t0, text in json.load(open('vo_lines.json')):
    a, sr = k.create(text.replace('Moniepoint', 'Money point'), voice='am_michael', speed=FAST.get(key, 0.9), lang='en-us'); sf.write(f'vo/{key}.wav', a, sr); print(key, round(len(a) / sr, 2), flush=True)
