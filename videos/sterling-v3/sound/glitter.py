# Two sounds matched to the references' spectrograms.
# A "glitter zips" (V4 gradient sweep): clusters of micro-chirps, each a bright sparkle sweeping DOWN from
#   ~15-16 kHz to ~7-8 kHz in 40-70 ms with a sharp attack, spaced irregularly, panned with the light,
#   then one or two tiny glints (short pings ~5.4 and 6.3 kHz). A faint air bed under it. No low swish.
# B "music opens" (V1 orange light): the music runs through a low-pass held at ~9 kHz that opens fully as the
#   light passes, so the track itself brightens with the light.
import numpy as np, wave, sys, subprocess
SR = 44100; rng = np.random.default_rng(11)
def chirp(dur, f0, f1, amp):
    n = int(dur * SR); t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t / (dur / 3.2))
    ph = 2 * np.pi * np.cumsum(f) / SR; env = (1 - np.exp(-t / .0015)) * np.exp(-t / (dur / 2.6))
    nz = rng.standard_normal(n); nz = nz - np.concatenate([[0], nz[:-1]]) * .9  # bright grain
    s = (.7 * np.sin(ph) + .25 * np.sin(2.01 * ph + 1)) * (1 + .6 * nz * .3) + .55 * nz * np.exp(-t / .012)
    return s * env * amp
def ping(f, dur, amp):
    n = int(dur * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * (1 - np.exp(-t / .001)) * np.exp(-t / (dur / 4)) * amp
def air(dur, amp):
    n = int(dur * SR); x = rng.standard_normal(n); y = np.diff(np.concatenate([[0], x]))  # crude high tilt
    t = np.arange(n) / SR; return y * np.sin(np.pi * t / dur) ** 2 * amp
def glitter(total=1.0, pan0=-.7, pan1=.7):
    n = int(total * SR); L = np.zeros(n); R = np.zeros(n)
    def put(sig, t0, pan):
        i = int(t0 * SR); j = min(n, i + len(sig)); s = sig[:j - i]
        L[i:j] += s * np.sqrt((1 - pan) / 2); R[i:j] += s * np.sqrt((1 + pan) / 2)
    # two clusters like the reference (at ~0.18 s and ~0.34 s), each 4-7 zips
    for c0, k in [(.04, 6), (.20, 7), (.36, 4)]:
        t = c0
        for z in range(k):
            pan = pan0 + (pan1 - pan0) * min(1, t / (total * .7))
            put(chirp(rng.uniform(.022, .042), rng.uniform(15000, 16500), rng.uniform(7500, 9500), rng.uniform(.4, 1.0)), t, pan + rng.uniform(-.15, .15))
            t += rng.uniform(.006, .016)
    put(ping(5400, .07, .35), .62, pan1 * .6); put(ping(6330, .06, .25), .66, pan1 * .8)
    a = air(total * .8, .05); put(a, 0, 0)
    return np.stack([L, R], 1)
def wav(path, x):
    x = x / max(1e-9, np.abs(x).max()) * .85
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())
if __name__ == '__main__':
    g = glitter(); out = np.zeros((int(2.6 * SR), 2)); out[int(.15 * SR):int(.15 * SR) + len(g)] += g; g2 = glitter(.9, .7, -.7); out[int(1.45 * SR):int(1.45 * SR) + len(g2)] += g2 * .85
    wav('glitter_alone.wav', out)
