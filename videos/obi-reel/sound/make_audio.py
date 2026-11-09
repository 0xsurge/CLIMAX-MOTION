# Obi Igwe reel sound: "Deep Urban" (Mixkit #371) from 24.24 s so its lift lands on the name at 4.64 s, plus a few
# physical SFX: a lens-focus ratchet when the frame locks, a thump under the name and the close, a soft click as
# each film opens, a tick per process step. No whooshes, no tonal notes.
import numpy as np, wave, subprocess, json
SR = 44100; G = json.load(open('grid.json')); P = G['P']; Bo = lambda n: n * P
INS_T, INS = 0.62, 53 / 30 + .12; S0, S1, K = Bo(14.3), Bo(18), 1.6
def B(n):  # original beat time -> real film time (inverse of the film's warp)
    u = Bo(n); r = u if u < INS_T else u + INS
    if u > S0: r += (min(u, S1) - S0) * (K - 1)
    return r
DUR = Bo(67) + INS + (S1 - S0) * (K - 1); G['start'] = G['lift'] - B(10)
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
def tap(): n = int(.02 * SR); t = np.arange(n) / SR; return hp(rng.standard_normal(n)) * np.exp(-t / .002) * .5
for i, st in enumerate([0, 10, 17, 23, 29, 35, 41, 47]): put(INS_T + st / 30, click(2600 - i * 80, .004), .14, (-.25, .25)[i % 2])   # each product
put(B(3), thump(), .4)
for k in range(0, 16, 2): put(B(5.6) + k / 34, tap(), .08)
put(B(7) + .05, ratchet(), .32, .2)
put(B(10), thump(), .55)
for k in range(0, 34, 3): put(B(11.5) + k / 30, tap(), .06)
put(B(14), click(1800), .2)
put(B(18), thump(), .3)
for n in (20, 22, 24, 26, 28, 32, 34, 36): put(B(n), click(2100), .18, (-.3, .3)[n % 4 == 0])
for k in range(5): put(B(38.5 + k), click(2800, .004), .16)
put(B(44), click(1500), .15)
put(B(46), thump(), .3)
put(B(55.8), click(2400), .22)
put(B(60), click(2000), .2)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(G['start']), '-t', str(DUR + .5), '-i', 'cand/371.mp3', '-af', f'afade=t=out:st={DUR - 1.8}:d=1.8', '-ar', '44100', '-ac', '2', 'music.wav'], check=True)
w = wave.open('music.wav'); m = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2) / 32768
n = min(len(m), len(fx)); mix = m[:n] * .8 + fx[:n]; mix /= max(1e-9, np.abs(mix).max()) / .9
with wave.open('mix.wav', 'wb') as o: o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((mix * 32767).astype('<i2').tobytes())
print('mix', round(DUR, 2))
