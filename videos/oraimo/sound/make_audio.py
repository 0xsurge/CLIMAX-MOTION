# oraimo SpaceBuds 2: the sound tells the story. 0-8.4 s a thick, synthesized Lagos soundscape (horns, a generator,
# crowd chatter, engine rumble) that a low-pass sweep closes off when the lime bloom swallows the noise; near silence;
# then calm placeholder music (Mixkit 655, royalty free) from 9.4 s. Soft UI layer: word pops, one sub on each landing.
import numpy as np, wave, subprocess, os
SR = 44100; DUR = 36.0; TMP = '/tmp/claude-0/-home-user-CLIMAX-MOTION/ebd3c3d1-b9fc-58c3-8e73-03b9f49be28b/scratchpad/or_tmp.wav'
rng = np.random.default_rng(11); N = int((DUR + 1) * SR); t = np.arange(N) / SR
fx = np.zeros((N, 2))
def put(t0, s, g, pan=0.):
    i = int(t0 * SR); j = min(N, i + len(s)); fx[i:j, 0] += s[:j - i] * g * (1 - max(pan, 0)); fx[i:j, 1] += s[:j - i] * g * (1 + min(pan, 0))
# ---- the city ----
city = np.zeros(N)
gen = (np.sign(np.sin(2 * np.pi * 100 * t)) * .25 + np.sin(2 * np.pi * 50 * t) * .6) * (1 + .15 * np.sin(2 * np.pi * 7 * t)); city += gen * .18          # generator
eng = rng.standard_normal(N); eng = np.convolve(eng, np.ones(400) / 400, 'same') * 6; city += eng * .35                                                       # engine rumble
chat = rng.standard_normal(N); chat = np.convolve(chat, np.hanning(60) / 30, 'same'); am = np.clip(np.convolve(rng.standard_normal(N), np.ones(4000) / 4000, 'same') * 40, 0, 1); city += chat * am * .22   # crowd
for k, (t0, f, d) in enumerate([(.4, 410, .5), (1.3, 520, .25), (1.6, 520, .25), (2.7, 380, .7), (3.9, 455, .35), (4.3, 455, .35), (5.5, 600, .4), (6.6, 400, .6), (7.4, 500, .3)]):   # danfo horns
    n = int(d * SR); tt = np.arange(n) / SR; h = (np.sign(np.sin(2 * np.pi * f * tt)) * .5 + np.sign(np.sin(2 * np.pi * f * 1.26 * tt)) * .5) * np.minimum(1, tt / .01) * np.minimum(1, (d - tt) / .03)
    i = int(t0 * SR); city[i:i + n] += h * .16
env = np.minimum(1, t / .3) * (1 - np.clip((t - 8.0) / 1.0, 0, 1)) ** 2          # the bloom closes the city off
cut = np.clip((t - 7.6) / 1.2, 0, 1)
dark = np.convolve(city, np.ones(60) / 60, 'same')                                 # the muffled version, crossfaded in as the earbud goes in
city = (city * (1 - cut) + dark * cut) * env
put(0, city, .9)
# ---- soft UI layer ----
def pop(f0=900): n = int(.05 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-tt * 30) + f0 * .45) / SR) * np.exp(-tt / .012) * (1 - np.exp(-tt / .001)) * .8
def sub(): n = int(.5 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(55 + 40 * np.exp(-tt * 25)) / SR) * np.exp(-tt / .12) * (1 - np.exp(-tt / .002))
for t0, k, st in [(1.0, 3, .2), (10.0, 2, .22), (16.0, 4, .12), (24.6, 2, .22), (32.0, 2, .14)]:
    for i in range(k): put(t0 + i * st, pop(820 + 60 * (i % 3)), .06, ((i % 3) - 1) * .2)
for t0, g in [(5.7, .25), (8.2, .35), (15.4, .3), (24.2, .2), (31.3, .25), (33.4, .2)]: put(t0, sub(), g)
# ---- music: calm placeholder, in after the silence ----
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '0', '-t', str(DUR + .5), '-i', os.environ.get('MUSIC', '../../moniepoint/sound/cand/655.mp3'), '-af', f'afade=t=in:st=0:d=2.5,afade=t=out:st={DUR - 9.4 - 2.2}:d=2.2', '-ar', '44100', '-ac', '2', TMP], check=True)
w = wave.open(TMP); m = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2) / 32768
mix = fx.copy(); i0 = int(9.4 * SR); n = min(len(m), N - i0); mix[i0:i0 + n] += m[:n] * .75
mix = mix[:int(DUR * SR)]; mix /= max(1e-9, np.abs(mix).max()) / .9
with wave.open('mix.wav', 'wb') as o: o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((mix * 32767).astype('<i2').tobytes())
print('mix', DUR)
