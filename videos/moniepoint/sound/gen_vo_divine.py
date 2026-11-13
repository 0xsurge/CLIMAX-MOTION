#!/opt/chatterbox/bin/python
# Male voiceover cloned with Chatterbox (MIT, Resemble AI) from a voice note by Bro. Divine, who agreed to his voice
# being used for this film. The reference (sound/divine_ref.wav) stays local, out of git. Every file carries
# Resemble's inaudible Perth watermark. Like gen_vo.py, each line is voiced phrase by phrase (split after . ? ! ,)
# and joined with real pauses, then checked against its slot.
#   /opt/chatterbox/bin/python sound/gen_vo_divine.py            all 15 lines -> sound/vo/<key>.wav
#   /opt/chatterbox/bin/python sound/gen_vo_divine.py --sample OUT.wav   the opening lines only, for a listen
#   /opt/chatterbox/bin/python sound/gen_vo_divine.py --only n02,v09      redo just these lines
# Lines that overrun their slot are re-read at a brisker pace (cfg .5), silences inside a phrase are cut to 0.15 s,
# pauses shortened, and only then the line is sped up (at most 1.2x, pitch kept) to end 0.15 s before the next cue.
import json, os, re, subprocess, sys, tempfile, numpy as np, soundfile as sf, torch
from chatterbox.tts import ChatterboxTTS
torch.manual_seed(7)
REF = 'sound/divine_ref.wav'; EXAG = .4; CFG = .35; SENT = .45; COMMA = .2
m = ChatterboxTTS.from_pretrained(device='cpu'); sr = m.sr
def trim(a): nz = np.where(np.abs(a) > .01)[0]; return a[max(0, nz[0] - 240):nz[-1] + 480] if len(nz) else a
def squeeze(a, gap=.15):   # cut silences inside a phrase longer than gap
    hop = sr // 100; on = np.array([np.abs(a[i:i + hop]).max() > .01 for i in range(0, len(a), hop)]); out, run = [], 0
    for i, v in enumerate(on):
        run = 0 if v else run + 1
        if v or run <= gap * 100: out.append(a[i * hop:(i + 1) * hop])
    return np.concatenate(out)
def tempo(a, f):
    d = tempfile.mkdtemp(); sf.write(f'{d}/i.wav', a, sr)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{d}/i.wav', '-af', f'atempo={f:.3f}', f'{d}/o.wav'], check=True)
    return sf.read(f'{d}/o.wav')[0]
def line(text, sent=SENT, comma=COMMA, cfg=CFG):
    parts = [p for p in re.split(r'(?<=[.?!,])\s+', text.replace('Moniepoint', 'Money point')) if p]; out = []
    for i, p in enumerate(parts):
        out.append(squeeze(trim(m.generate(p, audio_prompt_path=REF, exaggeration=EXAG, cfg_weight=cfg).squeeze(0).numpy())))
        if i < len(parts) - 1: out.append(np.zeros(int((comma if p.endswith(',') else sent) * sr)))
    return np.concatenate(out), parts
if '--sample' in sys.argv:
    out = sys.argv[sys.argv.index('--sample') + 1]; seq = [np.zeros(int(.25 * sr))]
    for t, g in [("You hit send.", .45), ("It left your phone. But where did it go?", .55), ("With Moniepoint,", .22), ("you choose who, you tap once.", .45), ("No stress.", .4)]:
        x, _ = line(t); seq += [x, np.zeros(int(g * sr))]
    sf.write(out, np.concatenate(seq), sr); print(out, round(sum(len(s) for s in seq) / sr, 2)); sys.exit()
os.makedirs('sound/vo', exist_ok=True); L = json.load(open('sound/vo_lines.json'))
ONLY = sys.argv[sys.argv.index('--only') + 1].split(',') if '--only' in sys.argv else None
for n, (key, t0, text) in enumerate(L):
    if ONLY and key not in ONLY: continue
    slot = (L[n + 1][1] if n + 1 < len(L) else 43.0) - t0; room = slot - .15
    x, parts = line(text, .3, .15, .5) if ONLY else line(text)   # --only is for lines already known to overrun
    if len(x) / sr > room and not ONLY: x, parts = line(text, .3, .15, .5)
    if len(x) / sr > room: x = tempo(x, min(1.2, len(x) / sr / room))
    sf.write(f'sound/vo/{key}.wav', x, sr); d = len(x) / sr
    print(f'{key} {d:5.2f}s slot {slot:5.2f}s {"OVER" if d > slot - .15 else "ok  "} {" | ".join(parts)}', flush=True)
