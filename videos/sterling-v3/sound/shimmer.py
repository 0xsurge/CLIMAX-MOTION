# The "colour sweep" sound, synthesized: a bright airy swell that rides a gradient-light pass.
# Dense micro-grains of high-passed noise whose density and brightness rise over the sweep, on a soft
# airy bed, peaking ~1 s in, then a quick bloom-off. No pitch, no notes, no low "shh" swish.
import numpy as np, wave, sys
SR = 44100; rng = np.random.default_rng(3)
def hp(x, fc):  # one-pole high-pass, cutoff may vary per sample
    y = np.zeros_like(x); a_prev = 0.0; x_prev = 0.0
    fc = np.broadcast_to(fc, x.shape)
    for i in range(len(x)):
        rc = 1 / (2 * np.pi * fc[i]); a = rc / (rc + 1 / SR); y[i] = a * (a_prev + x[i] - x_prev); a_prev = y[i]; x_prev = x[i]
    return y
def shimmer(dur=1.4, peak=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; u = t / peak
    rise = np.clip(u, 0, 1) ** 2.2; fall = np.exp(-np.clip(t - peak, 0, None) / .12)
    env = rise * fall
    bed = hp(rng.standard_normal(n), 3500 + 4500 * np.clip(u, 0, 1)) * .35
    grains = np.zeros(n); dens = 40 + 900 * np.clip(u, 0, 1) ** 1.6   # grains per second
    k = 0.0
    for i in range(n):
        k += dens[i] / SR
        if k >= 1: k -= 1; L = int(SR * rng.uniform(.0015, .004)); j = min(n - i, L); grains[i:i + j] += rng.standard_normal(j) * np.hanning(L)[:j] * rng.uniform(.3, 1)
    grains = hp(grains, 5000 + 3000 * np.clip(u, 0, 1))
    s = (bed + grains) * env
    return np.stack([s * (1 + .25 * np.sin(t * 7)), s * (1 - .25 * np.sin(t * 7))], 1)   # slow stereo drift with the light
out = np.zeros((int(3.4 * SR), 2)); a = shimmer(1.4, 1.0); out[int(.1 * SR):int(.1 * SR) + len(a)] += a; b = shimmer(1.2, .85); out[int(1.9 * SR):int(1.9 * SR) + len(b)] += b * .8
out /= np.abs(out).max() / .8
with wave.open(sys.argv[1], 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())
