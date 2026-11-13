#!/opt/kokoro/bin/python
# Male voiceover with Kokoro (Apache 2.0), am_michael at 0.9 speed (picked by the user). Writes vo/<line>.wav
# Kokoro barely pauses at punctuation, so each line is voiced phrase by phrase (split after . ? ! and ,)
# and joined with real pauses: SENT after a sentence, COMMA after a comma. Prints each line against its slot.
import json, os, re, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro('/opt/kokoro/models/kokoro-v1.0.onnx', '/opt/kokoro/models/voices-v1.0.bin'); os.makedirs('vo', exist_ok=True)
SPEED = 0.9; SENT = .45; COMMA = .2
FIT = {'n02': (.95, .35, .2), 'n07': (1.0, .35, .2), 'n08': (1.05, .25, .2), 'v07': (1.0, .3, .2), 'v09': (1.08, .3, .12)}   # per-line overrides {key: (speed, sent, comma)} for lines that would overrun their slot
L = json.load(open('vo_lines.json'))
def trim(a): nz = np.where(np.abs(a) > .01)[0]; return a[max(0, nz[0] - 240):nz[-1] + 480] if len(nz) else a
for n, (key, t0, text) in enumerate(L):
    sp, sent, comma = FIT.get(key, (SPEED, SENT, COMMA))
    parts = [p for p in re.split(r'(?<=[.?!,])\s+', text.replace('Moniepoint', 'Money point')) if p]
    out = []
    for i, p in enumerate(parts):
        a, sr = k.create(p, voice='am_michael', speed=sp, lang='en-us'); out.append(trim(a))
        if i < len(parts) - 1: out.append(np.zeros(int((comma if p.endswith(',') else sent) * sr)))
    x = np.concatenate(out); sf.write(f'vo/{key}.wav', x, sr)
    slot = (L[n + 1][1] if n + 1 < len(L) else 43.0) - t0; d = len(x) / sr
    print(f'{key} {d:5.2f}s slot {slot:5.2f}s {"OVER" if d > slot - .15 else "ok  "} {" | ".join(parts)}', flush=True)
