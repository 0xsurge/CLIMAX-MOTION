# oraimo SpaceBuds Neo+ "Beyond the noise.": music Mixkit 760 (royalty free, the user's pick), cut so its lift lands on
# the bloom (4.5 s). Soft motion layer: word pops, a click on each tap, low-passed air passes on the whips and dives,
# a sub on each landing, a little city murmur under the opening line and a hiss of noise under the ANC scene that the tap cuts.
import numpy as np, wave, subprocess
SR = 44100; DUR = 46.0; N = int((DUR + 1) * SR); TMP = '/tmp/claude-0/-home-user-CLIMAX-MOTION/ebd3c3d1-b9fc-58c3-8e73-03b9f49be28b/scratchpad/neo_tmp.wav'
PACK = '../../../obi-reel/sound/sfxpack/'; rng = np.random.default_rng(23); fx = np.zeros((N, 2)); tt = np.arange(N) / SR
def put(t0, s, g, pan=0.):
    i = int(t0 * SR); j = min(N, i + len(s)); fx[i:j, 0] += s[:j - i] * g * (1 - max(pan, 0)); fx[i:j, 1] += s[:j - i] * g * (1 + min(pan, 0))
def hp(x): return x - np.concatenate([[0], x[:-1]]) * .95
def click(f=2400, d=.006): n = int(.04 * SR); t = np.arange(n) / SR; return hp(rng.standard_normal(n)) * np.exp(-t / .003) * .6 + np.sin(2 * np.pi * f * t) * np.exp(-t / d) * .4
def pop(f0=900): n = int(.05 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-t * 30) + f0 * .45) / SR) * np.exp(-t / .012) * (1 - np.exp(-t / .001)) * .8
def sub(): n = int(.5 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(55 + 40 * np.exp(-t * 25)) / SR) * np.exp(-t / .12) * (1 - np.exp(-t / .002))
def load(p, af=None):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', p] + (['-af', af] if af else []) + ['-ar', '44100', '-ac', '1', TMP], check=True)
    w = wave.open(TMP); return np.frombuffer(w.readframes(w.getnframes()), '<i2') / 32768
wh = load(PACK + 'sweep/sweep_18_mixkit2636.wav', 'lowpass=f=5200,highpass=f=180'); pk = int(np.argmax(np.abs(wh)))
for i, tc in enumerate([10.0, 15.1, 21.9, 26.9, 31.9, 34.9, 35.75, 39.9]): put(max(0, tc - pk / SR), wh, .13, (-.3, .3)[i % 2])
put(max(0, 4.2 - pk / SR), wh, .16)                                            # the bloom
for t0, k, st in [(.2, 4, .14), (1.4, 6, .14), (7.4, 2, .2), (10.4, 3, .12), (10.7, 4, .16), (16.4, 3, .15), (17.6, 4, .15), (22.3, 2, .1), (23.4, 3, .14),
                  (27.4, 4, .14), (32.4, 3, .12), (33.0, 4, .14), (36.2, 2, .12), (36.5, 3, .14), (38.25, 1, .1), (40.5, 4, .1), (44.0, 2, .15), (44.5, 3, .12)]:
    for i in range(k): put(t0 + i * st, pop(820 + 60 * (i % 3)), .055, ((i % 3) - 1) * .2)
for t0 in (12.3, 38.2): put(t0, click(2000, .006), .2)
for t0, g in [(4.6, .3), (6.3, .25), (16.0, .25), (22.6, .2), (27.2, .15), (32.0, .15), (36.0, .15), (40.1, .2), (43.3, .35)]: put(t0, sub(), g)
for k in range(0, 51, 3): put(22.6 + k / 30, click(2800, .003), .04)          # 30 counts up
mur = np.convolve(rng.standard_normal(N), np.hanning(80) / 40, 'same') * np.clip(np.convolve(rng.standard_normal(N), np.ones(5000) / 5000, 'same') * 30, 0, 1)
put(0, mur * np.minimum(1, tt / .5) * (1 - np.clip((tt - 3.6) / .6, 0, 1)), .12)    # the world talking, swallowed by the bloom
hs = hp(rng.standard_normal(N)) * .5; put(0, hs * np.clip((tt - 10.0) / .4, 0, 1) * (1 - np.clip((tt - 12.3) / .25, 0, 1)) * (tt < 12.6), .06)   # noise, cut by the tap
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '68.7', '-t', str(DUR + .5), '-i', '../../../moniepoint/sound/cand/760.mp3', '-af', f'afade=t=in:d=0.6,afade=t=out:st={DUR - 2.5}:d=2.5', '-ar', '44100', '-ac', '2', TMP], check=True)
w = wave.open(TMP); m = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2) / 32768
n = min(len(m), N); mix = fx.copy(); mix[:n] += m[:n] * .8; mix = mix[:int(DUR * SR)]; mix /= max(1e-9, np.abs(mix).max()) / .9
with wave.open('mix.wav', 'wb') as o: o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((mix * 32767).astype('<i2').tobytes())
print('mix', DUR)
