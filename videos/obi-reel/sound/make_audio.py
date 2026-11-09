# Obi Igwe reel sound: "Deep Urban" (Mixkit #371) from 24.24 s so its lift lands on the name at 4.64 s, plus a few
# physical SFX: a lens-focus ratchet when the frame locks, a thump under the name and the close, a soft click as
# each film opens, a tick per process step. No whooshes, no tonal notes.
import numpy as np, wave, subprocess, json
SR = 44100; G = json.load(open('grid.json')); P = G['P']; B = lambda n: n * P; DUR = B(67)
T = dict(frame=B(6), turn=B(10), say=B(15), work=B(20), how=B(44), deserve=B(54), end=B(60))
rng = np.random.default_rng(3); fx = np.zeros((int((DUR + 1) * SR), 2))
def put(t, s, g, pan=0.):
    i = int(t * SR); j = min(len(fx), i + len(s)); fx[i:j, 0] += s[:j - i] * g * (1 - max(pan, 0)); fx[i:j, 1] += s[:j - i] * g * (1 + min(pan, 0))
def hp(x): return x - np.concatenate([[0], x[:-1]]) * .95
def click(f=2400, d=.006): n = int(.04 * SR); t = np.arange(n) / SR; return hp(rng.standard_normal(n)) * np.exp(-t / .003) * .6 + np.sin(2 * np.pi * f * t) * np.exp(-t / d) * .4
def thump(): n = int(.7 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(40 + 32 * np.exp(-t * 14)) / SR) * np.exp(-t / .22) * (1 - np.exp(-t / .003))
def ratchet(k=5, gap=.028):
    out = np.zeros(int((k * gap + .05) * SR))
    for i in range(k): c = click(3200 - i * 150, .004); s = int(i * gap * SR); out[s:s + len(c)] += c * (.5 + .1 * i)
    return out
put(T['frame'] + .45, ratchet(), .35, .2)                      # the frame pulls focus
put(T['turn'], thump(), .55)                                    # the name lands on the lift
for i in range(6): put(T['work'] + i * B(4) - .05, click(2000), .22, (-.3, .3)[i % 2])
for k in range(5): put(T['how'] + B(1) + k * B(2), click(2800, .004), .16)
put(T['end'] + B(1), thump(), .35); put(T['end'] + B(4), click(2200), .2)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(G['start']), '-t', str(DUR + .5), '-i', 'cand/371.mp3', '-af', f'afade=t=out:st={DUR - 1.8}:d=1.8', '-ar', '44100', '-ac', '2', 'music.wav'], check=True)
w = wave.open('music.wav'); m = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2) / 32768
n = min(len(m), len(fx)); mix = m[:n] * .8 + fx[:n]; mix /= max(1e-9, np.abs(mix).max()) / .9
with wave.open('mix.wav', 'wb') as o: o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((mix * 32767).astype('<i2').tobytes())
print('mix', round(DUR, 2))
