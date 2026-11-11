# Moniepoint "Sent means received": placeholder music (Mixkit 720, lift on the turn at 7.5 s) plus the soft motion layer:
# word pops, a tick per chat bubble, air passes on the camera whips, sub-thumps on landings. No tonal notes.
import numpy as np, wave, subprocess, os
SR = 44100; DUR = 42.0; TMP = '/tmp/claude-0/-home-user-CLIMAX-MOTION/ebd3c3d1-b9fc-58c3-8e73-03b9f49be28b/scratchpad/mp_sfx.wav'
PACK = '../../obi-reel/sound/sfxpack/'; rng = np.random.default_rng(5); fx = np.zeros((int((DUR + 1) * SR), 2))
def put(t, s, g, pan=0.):
    i = int(t * SR); j = min(len(fx), i + len(s)); fx[i:j, 0] += s[:j - i] * g * (1 - max(pan, 0)); fx[i:j, 1] += s[:j - i] * g * (1 + min(pan, 0))
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
WHIPS = [3.0, 9.9, 13.9, 18.4, 20.9, 22.9, 26.9, 30.9, 34.4, 37.4]
for i, tc in enumerate(WHIPS): put(max(0, tc - pk / SR), wh, .15, (-.3, .3)[i % 2])
put(max(0, 7.5 - pk / SR), wh, .13)                                                   # the dart breaks out
# word pops: (start, count, step)
for t0, k, st in [(.12, 3, .22), (1.5, 4, .2), (8.0, 2, .2), (8.4, 1, .2), (10.25, 2, .2), (14.35, 2, .2), (14.75, 1, .2), (19.5, 2, .2), (21.15, 2, .2), (21.55, 3, .2), (23.3, 2, .22), (24.0, 5, .13), (24.7, 3, .16),
                  (27.3, 2, .22), (28.1, 3, .16), (31.25, 3, .2), (31.95, 3, .28), (32.95, 2, .2), (34.75, 3, .2), (35.4, 2, .2), (35.85, 2, .2), (38.2, 2, .2), (38.6, 2, .2)]:
    for i in range(k): put(t0 + i * st, pop(820 + 60 * (i % 3)), .07, ((i % 3) - 1) * .2)
for i, t0 in enumerate([3.25, 3.95, 4.65, 5.35, 6.05]): put(t0, click(1900 + 200 * (i % 2), .005), .13, (-.3, .3)[i % 2])      # chat bubbles
for k in range(0, 27, 3): put(10.6 + k / 30, click(2800, .003), .05)                   # the amount counts
for k in range(0, 24, 3): put(18.75 + k / 30, click(2800, .003), .05)                  # 99.9 counts
for k in range(0, 21, 3): put(28.55 + k / 30, click(2800, .003), .05)                  # 20 counts
for t0, g in [(14.02, .5), (19.55, .28), (29.25, .3), (39.25, .4)]: put(t0, thump(), g)   # receipt lands, numbers land, the full stop
for t0 in [9.95, 11.85, 12.6, 18.5, 23.0, 24.3, 27.0, 31.4, 32.2, 34.95, 35.9, 37.5, 37.9]: put(t0, sub(), .1)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(22.9 - 7.5), '-t', str(DUR + .5), '-i', os.environ.get('MUSIC', 'cand/720.mp3'), '-af', f'afade=t=in:d=0.05,afade=t=out:st={DUR - 2}:d=2', '-ar', '44100', '-ac', '2', 'music.wav'], check=True)
w = wave.open('music.wav'); m = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2) / 32768
n = min(len(m), len(fx)); mix = m[:n] * .8 + fx[:n]; mix /= max(1e-9, np.abs(mix).max()) / .9
with wave.open('mix.wav', 'wb') as o: o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((mix * 32767).astype('<i2').tobytes())
print('mix', DUR)
