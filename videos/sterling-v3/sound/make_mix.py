# Sterling v3 sound: Thunder (drop on "claim." at 1.9 s) + the approved glitter zips on each colour sweep and big light
# pass, a low thump under each slam, soft clicks for presses, light key taps under the typing, tiny ticks per check.
# No whooshes, no tonal notes. Output: mix.wav (music + sfx at the approved balance), normalised later to -14 LUFS.
import numpy as np, wave, sys
sys.path.insert(0, '.')
from glitter import glitter, SR
P = 0.625653; D = 1.9; B = lambda n: D + n * P; DUR = B(45.5)
T = dict(turn=B(4), mark=B(6), name=B(7.5), promise=B(9.5), code=B(13.5), route=B(17.5), checks=B(21.5), ver=B(26.5), range=B(29.5), steps=B(33.5), end=B(38.5))
w = wave.open('../../sterling-v2/audio/music.wav'); m = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(float) / 32768
n = int(DUR * SR); m = m[:n]; fade = np.ones(n); f0 = int((DUR - 1.6) * SR); fade[f0:] = np.linspace(1, 0, n - f0) ** 1.5; m = m * fade[:, None]
fx = np.zeros((n + SR, 2)); rng = np.random.default_rng(5)
def put(t, sig, g=1., pan=0.):
    i = int(t * SR); sig = np.asarray(sig); s = sig if sig.ndim == 2 else np.stack([sig * np.sqrt((1 - pan) / 2) * 1.41, sig * np.sqrt((1 + pan) / 2) * 1.41], 1)
    j = min(len(fx), i + len(s)); fx[i:j] += s[:j - i] * g
def thump(dur=.7):
    k = int(dur * SR); t = np.arange(k) / SR; f = 38 + 34 * np.exp(-t * 14)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .22) * (1 - np.exp(-t / .003))
def click():
    k = int(.04 * SR); t = np.arange(k) / SR; x = rng.standard_normal(k); x = x - np.concatenate([[0], x[:-1]]) * .95
    return (x * np.exp(-t / .004) * .6 + np.sin(2 * np.pi * 2400 * t) * np.exp(-t / .006) * .4)
def tap():
    k = int(.025 * SR); t = np.arange(k) / SR; x = rng.standard_normal(k); x = x - np.concatenate([[0], x[:-1]]) * .9
    return x * np.exp(-t / .003)
# glitter zips (the sound the user approved), on sweeps and the big light passes
for t, g, pan in [(T['turn'] + .45, .22, (-.7, .7)), (T['checks'] + 1.0, .16, (.6, -.6)), (T['end'] + .35, .2, (-.6, .6)), (T['end'] + 2.6, .13, (-.5, .5))]:
    put(t, glitter(1.0, *pan), g)
# thumps under the slams and the mark landings
for t, g in [(D, .55), (T['mark'], .45), (T['ver'] + P, .5), (T['end'] + .3, .35)]: put(t, thump(), g)
# presses
for t in [T['promise'] + 1.45, T['steps'] + P * 1.0, T['steps'] + P * 2.3, T['steps'] + P * 3.6]: put(t, click(), .22)
# key taps under the endpoint typing (every other character)
for k in range(0, 45, 2): put(T['code'] + .45 + k * .036, tap(), .07 + .03 * rng.random(), rng.uniform(-.3, .3))
# a tiny tick per provider check
for i in range(4): put(T['route'] + .35 + i * P * .75, click(), .12)
mix = m + fx[:n]; mix = mix / max(1e-9, np.abs(mix).max()) * .9
with wave.open('mix.wav', 'wb') as o: o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((mix * 32767).astype('<i2').tobytes())
print('mix.wav', round(DUR, 3))
