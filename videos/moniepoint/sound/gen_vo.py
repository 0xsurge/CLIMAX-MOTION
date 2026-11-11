#!/opt/kokoro/bin/python
# Female voiceover with Kokoro (Apache 2.0), af_heart. Writes vo/<line>.wav
import json, os, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro('/opt/kokoro/models/kokoro-v1.0.onnx', '/opt/kokoro/models/voices-v1.0.bin'); os.makedirs('vo', exist_ok=True)
for key, t0, text in json.load(open('vo_lines.json')):
    a, sr = k.create(text.replace('Moniepoint', 'Money point'), voice='af_heart', speed=1.0, lang='en-us'); sf.write(f'vo/{key}.wav', a, sr); print(key, round(len(a) / sr, 2), flush=True)
