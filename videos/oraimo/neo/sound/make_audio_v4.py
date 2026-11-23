# oraimo SpaceBuds Neo+ v4 sound, built to climax-launch/SOUND.md on the v4 camera route.
# Layers: music (Mixkit 760, the user's pick) / a low drone bed / the motion layer (a soft pop on every word that lands,
# an air pass on every camera whip and tilt panned with its direction, a lighter one on the dives, a sub-thump on landings)
# / hits (soft impacts on the big landings, a riser into the logo, clicks on the taps, ticks under the counter).
# Word times are read from the film itself (each words() call and its word count), so the pops follow the type.
import numpy as np, wave, subprocess, re
SR = 44100; DUR = 46.0; N = int((DUR + 1) * SR)
TMP = '/tmp/claude-0/-home-user-CLIMAX-MOTION/ebd3c3d1-b9fc-58c3-8e73-03b9f49be28b/scratchpad/neo4_tmp.wav'
PACK = '../../../obi-reel/sound/sfxpack/'; rng = np.random.default_rng(23); fx = np.zeros((N, 2)); tt = np.arange(N) / SR
def put(t0, s, g, pan=0.):
    i = int(max(0, t0) * SR); j = min(N, i + len(s)); fx[i:j, 0] += s[:j - i] * g * (1 - max(pan, 0)); fx[i:j, 1] += s[:j - i] * g * (1 + min(pan, 0))
def hp(x): return x - np.concatenate([[0], x[:-1]]) * .95
def click(f=2400, d=.006): n = int(.04 * SR); t = np.arange(n) / SR; return hp(rng.standard_normal(n)) * np.exp(-t / .003) * .6 + np.sin(2 * np.pi * f * t) * np.exp(-t / d) * .4
def pop(f0=850):
    n = int(.06 * SR); t = np.arange(n) / SR; tick = hp(rng.standard_normal(n)) * np.exp(-t / .002) * .25
    return (np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-t * 28) + f0 * .4) / SR) * np.exp(-t / .014) * (1 - np.exp(-t / .001)) + tick) * .8
def sub(): n = int(.5 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(55 + 40 * np.exp(-t / .35 * 3)) / SR) * np.exp(-t / .14) * (1 - np.exp(-t / .002))
def load(p, af=None):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', p] + (['-af', af] if af else []) + ['-ar', '44100', '-ac', '1', TMP], check=True)
    w = wave.open(TMP); return np.frombuffer(w.readframes(w.getnframes()), '<i2') / 32768
def at_peak(t, x, g, pan=0.): pk = int(np.argmax(np.abs(x))); put(t - pk / SR, x, g, pan)

# drone bed: felt, not heard
dr = load(PACK + 'drone/drone_10_mixkit2504.wav')[:N]; env = np.minimum(1, np.arange(len(dr)) / (2.5 * SR)) * np.minimum(1, (len(dr) - np.arange(len(dr))) / (2.0 * SR))
put(0, dr * env, .22)
# word pops, from the film's own words() calls; visuals lead audio by about 35 ms
html = open('../film4/index.html').read()
for idn, t0, st in re.findall(r"words\('(\w+)', ([\d.]+), ([\d.]+)", html):
    blk = re.search(r'id="%s"[^>]*>(.*?)</div>' % idn, html, re.S); n = len(re.findall(r'class="w', blk.group(1))) if blk else 0
    for i in range(n): put(float(t0) + i * float(st) + .02, pop(820 + 60 * (i % 3)), .07, ((i % 3) - 1) * .2)
# the motion layer on the camera: soft air passes, peak on the move's speed peak (camMove tc)
air = load(PACK + 'sweep/sweep_18_mixkit2636.wav', 'lowpass=f=5200,highpass=f=180')
for tc, pan in [(6.0, .35), (9.9, 0), (21.8, -.05), (27.0, .35), (31.8, .05), (42.6, 0)]: at_peak(tc, air, .16, pan)   # whips and tilts
for tc in (3.95, 15.1, 34.9, 39.75): at_peak(tc, air, .1)                                                        # dives into the pill, toggle, game, check
at_peak(4.3, air, .11)                                                                                           # the bloom swallows the line
# landings: sub-thumps; leave the small ones silent
for t0, g in [(4.5, .3), (6.25, .25), (10.15, .2), (15.6, .28), (22.05, .2), (27.3, .15), (32.1, .15), (35.6, .2), (40.1, .25), (43.3, .35)]: put(t0, sub(), g)
# hits: soft impacts on the big landings, a riser whose peak meets the logo
for t0, fn, g in [(8.15, 'impact/impact_13_mixkit546.wav', .32), (15.6, 'impact/impact_15_mixkit565.wav', .26), (24.3, 'impact/impact_09_mixkit3024.wav', .28),
                  (38.4, 'impact/impact_15_mixkit565.wav', .24), (43.3, 'impact/impact_13_mixkit546.wav', .4)]: put(t0 - .03, load(PACK + fn), g)
at_peak(43.3, load(PACK + 'riser/riser_01_mixkit1465.wav'), .26)
# clicks on the two taps and the lid; ticks under the counter
for t0 in (12.3, 38.2): put(t0 - .035, click(2000, .006), .22)
for k in range(0, 51, 3): put(22.6 + k / 30, click(2800, .003), .04)
# the world talking under the opening line, swallowed by the bloom; the noise under ANC, cut by the tap
mur = np.convolve(rng.standard_normal(N), np.hanning(80) / 40, 'same') * np.clip(np.convolve(rng.standard_normal(N), np.ones(5000) / 5000, 'same') * 30, 0, 1)
put(0, mur * np.minimum(1, tt / .5) * (1 - np.clip((tt - 3.6) / .6, 0, 1)), .12)
hs = hp(rng.standard_normal(N)) * .5; put(0, hs * np.clip((tt - 10.0) / .4, 0, 1) * (1 - np.clip((tt - 12.3) / .25, 0, 1)) * (tt < 12.6), .06)
# music
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '68.7', '-t', str(DUR + .5), '-i', '../../../moniepoint/sound/cand/760.mp3', '-af', f'afade=t=in:d=0.6,afade=t=out:st={DUR - 2.5}:d=2.5', '-ar', '44100', '-ac', '2', TMP], check=True)
w = wave.open(TMP); m = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2) / 32768
n = min(len(m), N); mix = fx.copy(); mix[:n] += m[:n] * .8; mix = mix[:int(DUR * SR)]; mix /= max(1e-9, np.abs(mix).max()) / .9
with wave.open('mix4.wav', 'wb') as o: o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((mix * 32767).astype('<i2').tobytes())
print('mix4.wav', DUR)
