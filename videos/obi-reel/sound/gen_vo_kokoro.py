#!/opt/kokoro/bin/python
# Female voiceover with Kokoro (Apache 2.0). Writes vo_<voice>/<line>.wav for each voice.
import json, sys, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro('/opt/kokoro/models/kokoro-v1.0.onnx', '/opt/kokoro/models/voices-v1.0.bin')
lines = json.load(open('vo_lines.json'))
for voice in sys.argv[1:]:
    import os; os.makedirs(f'vo_{voice}', exist_ok=True)
    for key, t0, text in lines:
        text = text.replace('Obi Igwe', 'Obee Eegway')            # say his surname right
        a, sr = k.create(text, voice=voice, speed=0.94, lang='en-us')
        sf.write(f'vo_{voice}/{key}.wav', a, sr)
    print(voice, 'done', flush=True)
