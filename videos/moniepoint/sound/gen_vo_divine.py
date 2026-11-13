#!/opt/chatterbox/bin/python
# Male voiceover cloned with Chatterbox (MIT, Resemble AI) from a voice note by Bro. Divine, who agreed to his voice
# being used for this film. The reference (sound/divine_ref.wav) stays local, out of git. Every file carries
# Resemble's inaudible Perth watermark. Like gen_vo.py, each line is voiced phrase by phrase (split after . ? ! ,)
# and joined with real pauses, then checked against its slot.
#   /opt/chatterbox/bin/python sound/gen_vo_divine.py            all 15 lines -> sound/vo/<key>.wav
#   /opt/chatterbox/bin/python sound/gen_vo_divine.py --sample OUT.wav   the opening lines only, for a listen
import json, os, re, sys, numpy as np, soundfile as sf, torch
from chatterbox.tts import ChatterboxTTS
torch.manual_seed(7)
REF = 'sound/divine_ref.wav'; EXAG = .4; CFG = .35; SENT = .45; COMMA = .2
m = ChatterboxTTS.from_pretrained(device='cpu'); sr = m.sr
def trim(a): nz = np.where(np.abs(a) > .01)[0]; return a[max(0, nz[0] - 240):nz[-1] + 480] if len(nz) else a
def line(text, sent=SENT, comma=COMMA):
    parts = [p for p in re.split(r'(?<=[.?!,])\s+', text.replace('Moniepoint', 'Money point')) if p]; out = []
    for i, p in enumerate(parts):
        out.append(trim(m.generate(p, audio_prompt_path=REF, exaggeration=EXAG, cfg_weight=CFG).squeeze(0).numpy()))
        if i < len(parts) - 1: out.append(np.zeros(int((comma if p.endswith(',') else sent) * sr)))
    return np.concatenate(out), parts
if '--sample' in sys.argv:
    out = sys.argv[sys.argv.index('--sample') + 1]; seq = [np.zeros(int(.25 * sr))]
    for t, g in [("You hit send.", .45), ("It left your phone. But where did it go?", .55), ("With Moniepoint,", .22), ("you choose who, you tap once.", .45), ("No stress.", .4)]:
        x, _ = line(t); seq += [x, np.zeros(int(g * sr))]
    sf.write(out, np.concatenate(seq), sr); print(out, round(sum(len(s) for s in seq) / sr, 2)); sys.exit()
os.makedirs('sound/vo', exist_ok=True); L = json.load(open('sound/vo_lines.json'))
for n, (key, t0, text) in enumerate(L):
    x, parts = line(text); sf.write(f'sound/vo/{key}.wav', x, sr)
    slot = (L[n + 1][1] if n + 1 < len(L) else 43.0) - t0; d = len(x) / sr
    print(f'{key} {d:5.2f}s slot {slot:5.2f}s {"OVER" if d > slot - .15 else "ok  "} {" | ".join(parts)}', flush=True)
