#!/opt/kokoro/bin/python
# oraimo voiceover with Kokoro (Apache 2.0), voice af_nicole ("voice 7" in Kokoro's list). Writes vo/<key>.wav
import json, sys, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro('/opt/kokoro/models/kokoro-v1.0.onnx', '/opt/kokoro/models/voices-v1.0.bin'); V = sys.argv[1] if len(sys.argv) > 1 else 'af_nicole'
for key, t0, text in json.load(open('vo_lines_b.json')):
    a, sr = k.create(text.replace('oraimo', 'Or-eye-mo'), voice=V, speed=1.08, lang='en-us'); sf.write(f'vob/{key}.wav', a, sr); print(key, round(len(a) / sr, 2), flush=True)
