#!/usr/bin/env python3
"""Synthesize an original, minimal track in code: kick, offbeat hat, sub bass, pluck arpeggio.
   python3 music.py --bpm 120 --dur 16 --out audio/music.wav [--seed 7]
Everything is sample-exact on the beat grid. Output: 44.1 kHz mono-compatible stereo WAV."""
import argparse, numpy as np, soundfile as sf

p = argparse.ArgumentParser()
p.add_argument('--bpm', type=float, default=120); p.add_argument('--dur', type=float, default=16)
p.add_argument('--out', default='audio/music.wav'); p.add_argument('--seed', type=int, default=7)
p.add_argument('--warm', action='store_true', help='softer kick/hat and a marimba-like pluck')
a = p.parse_args()
SR = 44100; rng = np.random.default_rng(a.seed)
beat = 60.0 / a.bpm; n = int(a.dur * SR); out = np.zeros(n)

def put(x, t):
    i = int(round(t * SR))
    if i < n: out[i:i + len(x)] += x[:n - i]

def tt(d): return np.arange(int(d * SR)) / SR
def kick():
    t = tt(0.32); f = 120 * np.exp(-t * 18) + 42
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.9
def hat():
    t = tt(0.07); return np.diff(rng.standard_normal(len(t) + 1)) * np.exp(-t * 60) * 0.12
def pluck(freq, d=0.45):
    t = tt(d)
    if a.warm:   # marimba-like: fundamental plus a short-lived 4th partial, quick decay
        x = np.sin(2 * np.pi * freq * t) * np.exp(-t * 9) + 0.35 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t * 26)
        return x * 0.22
    x = sum(np.sin(2 * np.pi * freq * h * t) / h for h in (1, 2, 3)) * np.exp(-t * 7)
    return x * 0.16
def bass(freq, d):
    t = tt(d); return np.sin(2 * np.pi * freq * t) * np.minimum(1, t * 80) * np.minimum(1, (d - t) * 40) * 0.42

# A minor pentatonic, 4-beat chord roots A F C G.
roots = [55.0, 43.65, 65.41, 49.0]; scale = [0, 3, 5, 7, 10, 12, 15]
for b in range(int(a.dur / beat)):
    t0 = b * beat; bar = (b // 4) % 4
    put(kick() * (0.7 if a.warm else 1), t0)
    put(hat() * (0.6 if a.warm else 1), t0 + beat / 2)
    if b % 4 in (1, 3): put(np.concatenate([[0], np.diff(rng.standard_normal(int(0.12 * SR)))]) * np.exp(-tt(0.12) * 30)[:int(0.12 * SR)] * 0.18, t0)  # snare tick
    put(bass(roots[bar], beat * 0.9), t0)
    for h in range(2):  # two plucks per beat
        deg = scale[(b * 2 + h * 3 + bar * 2) % len(scale)]
        put(pluck(roots[bar] * 4 * 2 ** (deg / 12)), t0 + h * beat / 2)
env = np.minimum(1, np.arange(n) / (0.01 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.25 * SR))
out *= env; out = np.tanh(out * 1.2) / np.tanh(1.2)
sf.write(a.out, np.stack([out, out], 1).astype('float32'), SR, subtype='PCM_16')
print(f'{a.out}  {a.bpm} BPM  {a.dur}s')
