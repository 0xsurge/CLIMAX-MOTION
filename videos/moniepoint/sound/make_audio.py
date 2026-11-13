# Moniepoint "Sent means received": placeholder music (Mixkit 720, lift on the turn at 7.5 s) plus the soft motion layer:
# word pops, a tick per chat bubble, air passes on the camera whips, sub-thumps on landings. No tonal notes.
import numpy as np, wave, subprocess, os, tempfile
SR = 44100; DUR = 43.0; TMP = os.path.join(tempfile.mkdtemp(), 'mp_sfx.wav')
PACK = '../../obi-reel/sound/sfxpack/'; rng = np.random.default_rng(5); fx = np.zeros((int((DUR + 1) * SR), 2))
from warp import real
def put(t, s, g, pan=0.):
    i = int(real(t) * SR); j = min(len(fx), i + len(s)); fx[i:j, 0] += s[:j - i] * g * (1 - max(pan, 0)); fx[i:j, 1] += s[:j - i] * g * (1 + min(pan, 0))
def hp(x): return x - np.concatenate([[0], x[:-1]]) * .95
def click(f=2400, d=.006): n = int(.04 * SR); t = np.arange(n) / SR; return hp(rng.standard_normal(n)) * np.exp(-t / .003) * .6 + np.sin(2 * np.pi * f * t) * np.exp(-t / d) * .4
def pop(f0=900): n = int(.05 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-t * 30) + f0 * .45) / SR) * np.exp(-t / .012) * (1 - np.exp(-t / .001)) * .8 + hp(rng.standard_normal(n)) * np.exp(-t / .003) * .15
def sub(): n = int(.35 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(55 + 40 * np.exp(-t * 25)) / SR) * np.exp(-t / .09) * (1 - np.exp(-t / .002))
def thump(): n = int(.7 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(40 + 32 * np.exp(-t * 14)) / SR) * np.exp(-t / .22) * (1 - np.exp(-t / .003))
def load(p, af=None):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', p] + (['-af', af] if af else []) + ['-ar', '44100', '-ac', '1', TMP], check=True)
    w = wave.open(TMP); return np.frombuffer(w.readframes(w.getnframes()), '<i2') / 32768
dr = load(PACK + 'drone/drone_10_mixkit2504.wav'); dr = np.tile(dr, 3)[:int((DUR + 1) * SR)]; env = np.minimum(1, np.arange(len(dr)) / (2.5 * SR)) * np.minimum(1, (len(dr) - np.arange(len(dr))) / (2 * SR)); put(0, dr * env, .2)
wh = load(PACK + 'sweep/sweep_18_mixkit2636.wav', 'lowpass=f=5200,highpass=f=180'); pk = int(np.argmax(np.abs(wh)))
WHIPS = [1.45, 4.0, 6.5, 8.5, 10.0, 13.6, 16.3, 18.6, 20.9, 22.9, 26.9, 30.9, 34.4, 37.4]
for i, tc in enumerate(WHIPS): put(max(0, tc - pk / SR), wh, .15, (-.3, .3)[i % 2])
# word pops: (start, count, step)
for t0, k, st in [(.1, 2, .2), (1.6, 3, .12), (1.95, 1, .14), (4.35, 6, .2), (6.75, 4, .14), (9.0, 1, .1), (10.15, 4, .17), (13.85, 2, .22), (16.55, 2, .14), (16.75, 4, .15), (19.35, 2, .2), (21.1, 5, .17), (23.3, 2, .2), (24.0, 7, .12), (27.3, 2, .2), (28.1, 3, .14), (29.0, 2, .14),
                  (31.25, 3, .18), (31.95, 5, .2), (34.75, 3, .18), (35.4, 4, .18), (38.2, 4, .2)]:
    for i in range(k): put(t0 + i * st, pop(820 + 60 * (i % 3)), .07, ((i % 3) - 1) * .2)
for i, t0 in enumerate([1.8, 4.75, 5.45, 12.58, 31.1, 31.7, 31.8, 31.9, 32.0]): put(t0, click(1900 + 200 * (i % 2), .005), .11, (-.3, .3)[i % 2])   # pills, the tap
for k in range(0, 7): put(10.55 + k / 22, click(2800, .003), .05)                      # the amount types
for k in range(0, 24, 3): put(18.8 + k / 30, click(2800, .003), .05)                   # 99.9 counts
for k in range(0, 21, 3): put(28.55 + k / 30, click(2800, .003), .05)                  # 20 counts
for tf in (22.9,): put(tf - .02, sub(), .16)                                # floods land
for t0, g in [(8.62, .35), (13.75, .45), (17.3, .3), (19.6, .28), (28.0, .3), (39.35, .4)]: put(t0, thump(), g)   # the pill lands, the phone lands, the money opens, the number lands
put(max(0, 13.1 - pk / SR), wh, .14)   # the dive into Ada's card
for t0 in [4.1, 6.6, 9.0, 11.45, 17.5, 16.4, 18.3, 22.8, 24.9, 26.8, 31.4, 32.3, 32.75, 34.9, 35.45, 37.3, 37.5]: put(t0, sub(), .1)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(22.9 - 7.5), '-t', str(DUR + .5), '-i', os.environ.get('MUSIC', 'cand/720.mp3'), '-af', f'afade=t=in:d=0.05,afade=t=out:st={DUR - 2}:d=2', '-ar', '44100', '-ac', '2', 'music.wav'], check=True)
w = wave.open('music.wav'); m = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2) / 32768
n = min(len(m), len(fx)); mix = m[:n] * .8 + fx[:n]; mix /= max(1e-9, np.abs(mix).max()) / .9
with wave.open('mix.wav', 'wb') as o: o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((mix * 32767).astype('<i2').tobytes())
print('mix', DUR)
