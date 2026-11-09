#!/opt/kokoro/bin/python
"""Female voiceover with Kokoro. One line per call, or many from a JSON list.
   /opt/kokoro/bin/python tts_kokoro.py "Book a call today." --out vo.wav [--voice af_heart] [--speed 0.94]
   /opt/kokoro/bin/python tts_kokoro.py --lines vo_lines.json --dir vo_af_heart   (JSON: [[key, start_s, text], ...])
Respell names phonetically (check with k.tokenizer.phonemize(text, 'en-us')), e.g. 'Obi Igwe' -> 'Obee Eegway'."""
import argparse, json, os, soundfile as sf
from kokoro_onnx import Kokoro
p = argparse.ArgumentParser(); p.add_argument('text', nargs='?'); p.add_argument('--out'); p.add_argument('--lines'); p.add_argument('--dir', default='vo')
p.add_argument('--voice', default='af_heart'); p.add_argument('--speed', type=float, default=0.94); a = p.parse_args()
k = Kokoro('/opt/kokoro/models/kokoro-v1.0.onnx', '/opt/kokoro/models/voices-v1.0.bin')
items = json.load(open(a.lines)) if a.lines else [['line', 0, a.text]]
os.makedirs(a.dir, exist_ok=True)
for key, _, text in items:
    s, sr = k.create(text, voice=a.voice, speed=a.speed, lang='en-us'); path = a.out if (a.out and not a.lines) else f'{a.dir}/{key}.wav'
    sf.write(path, s, sr); print(path, round(len(s) / sr, 2), text)
