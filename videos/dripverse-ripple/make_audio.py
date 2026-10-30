#!/usr/bin/env python3
"""Builds audio/music.wav and audio/sfx.wav for the DRIP VERSE "One order" film (71.27 s).   python3 make_audio.py
Song: Mixkit #132 'Hazy After Hours' (grid 120.07 BPM, first kick 0.271 s), read from ../dripverse/audio/song_raw.wav.
Film [0,64) <- source [12.26,76.26): the groove's energy lift lands near film 4 s, like the reference. Film [64,71.27) <- the quiet
outro bars from 112.21 s: the splice sits under the wordmark landing. SFX: downloaded Mixkit files in ../dripverse/audio/sfx, each placed by its
measured peak (or start) on the timeline time in film.js."""
import json, numpy as np, soundfile as sf, librosa, warnings
warnings.filterwarnings('ignore')
SR = 44100; DUR = 71.2667; SRC = '../dripverse/audio'
g = json.load(open(f'{SRC}/song_grid.json')); t0, per = g['t0'], g['period']
song, sr = sf.read(f'{SRC}/song_raw.wav'); assert sr == SR
if song.ndim == 1: song = np.stack([song, song], 1)
SEG = [(0.0, 64.0, t0 + 24 * per), (64.0, DUR, t0 + 224 * per)]
out = np.zeros((int(DUR * SR), 2)); XF = int(0.02 * SR)
for k, (fa, fb, sa) in enumerate(SEG):
    a, b = int(fa * SR), int(fb * SR); seg = song[int(sa * SR):int(sa * SR) + (b - a)].copy(); n = len(seg); w = np.ones(n)
    if k > 0: w[:XF] = np.sin(np.linspace(0, np.pi / 2, XF))
    if k < len(SEG) - 1: w[-XF:] = np.cos(np.linspace(0, np.pi / 2, XF))
    out[a:a + n] += seg * w[:, None]
t = np.arange(len(out)) / SR
out *= (1 - np.clip((t - 69.6) / 1.6, 0, 1) ** 1.5)[:, None]
out[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))[:, None]
sf.write('audio/music.wav', out.astype('float32'), SR, subtype='PCM_16'); print('music.wav', len(out) / SR, 's')

# v2: one continuous take. Cues follow film.js: the light sweeps, the card morphs, the light passes and every pop and click.
SWEEPS = [2.4, 4.9, 7.9, 12.9, 20.4, 24.9, 29.9, 35.4, 44.4, 48.9, 55.9, 62.4]
MORPHS = [3.5, 6.95, 10.0, 12.0, 16.3, 28.0, 32.0, 39.2, 42.0, 58.5]          # card morphs that have no sweep of their own
CUES = [   # (mixkit id, film time, mode, gain, max duration)
 *[(2356, s + .3, 'peak', .4, None) for s in SWEEPS], *[(2578, m + .08, 'peak', .32, 1.0) for m in MORPHS],
 (175, .3, 'peak', .4, None), (2358, .43, 'peak', .45, None), (2354, .5, 'peak', .3, None), (2354, .6, 'peak', .25, None), (2357, 2.22, 'peak', .4, None),
 (2350, 2.6, 'peak', .22, 1.2), (1489, 5.2, 'start', .35, 1.2), (2357, 6.05, 'peak', .4, None), (175, 7.05, 'peak', .4, None), (2358, 7.35, 'peak', .3, None),
 (2356, 8.1, 'peak', .35, None), (2357, 12.38, 'peak', .4, None), (2358, 12.63, 'peak', .4, None),
 (2900, 13.0, 'peak', .6, None), (1317, 13.0, 'peak', .5, None), (2350, 13.35, 'peak', .35, 1.4),
 *[(2358, 16.72 + .07 * i, 'peak', .15, None) for i in range(10)], (2354, 16.75, 'peak', .25, None),
 (2357, 20.8, 'peak', .4, None), (2350, 21.05, 'peak', .3, 1.4), (2354, 21.25, 'peak', .3, None),
 (1489, 25.25, 'start', .35, 1.2), (2357, 26.05, 'peak', .4, None), (1109, 26.9, 'peak', .9, None), (2354, 28.55, 'peak', .25, None),
 (933, 30.2, 'peak', .6, None), *[(2357, 32.15 + .06 * i, 'peak', .2, None) for i in range(6)], (2350, 34.15, 'peak', .32, 1.4),
 (1489, 35.4, 'start', .45, 1.0), (1317, 35.65, 'peak', .6, None), (2350, 36.05, 'peak', .32, 1.4), (2354, 37.75, 'peak', .3, None),
 (2354, 42.35, 'peak', .3, None), (2350, 42.4, 'peak', .22, 1.2), (175, 44.55, 'peak', .45, None), (1321, 44.6, 'start', .28, 1.6),
 *[(2358, 44.9 + .13 * i, 'peak', .15, None) for i in range(8)], (2354, 44.95, 'peak', .3, None), (2354, 46.95, 'peak', .3, None),
 (1489, 48.95, 'start', .45, 1.0), (1317, 49.3, 'peak', .5, None), *[(2357, 49.55 + .1 * i, 'peak', .2, None) for i in range(6)],
 *[(2358, 51.05 + .1 * i, 'peak', .17, None) for i in range(6)], (175, 56.05, 'peak', .4, None), (2867, 56.45, 'peak', .5, None), (2354, 58.85, 'peak', .3, None),
 (1489, 62.5, 'start', .4, 1.0), (1143, 63.0, 'peak', .35, 2.0), (1317, 63.35, 'peak', .65, None), (1321, 63.35, 'start', .3, 1.6),
 (2354, 63.95, 'peak', .28, None), (2354, 66.75, 'peak', .28, None), (2357, 67.15, 'peak', .5, None), (2350, 67.55, 'peak', .25, 1.2), (2354, 67.75, 'peak', .25, None), (2350, 69.25, 'peak', .2, 1.2)]
def load(i):
    y, _ = librosa.load(f'{SRC}/sfx/{i}.mp3', sr=SR, mono=False); return np.stack([y, y], 1) if y.ndim == 1 else y.T
def anchor(y, mode):
    env = np.abs(y).max(1); k = int(0.003 * SR); env = np.convolve(env, np.ones(k) / k, 'same'); pk = env.max()
    return int(np.argmax(env)) if mode == 'peak' else int(np.argmax(env > 0.06 * pk))
bus = np.zeros((int(DUR * SR), 2)); log = []
for i, tc, mode, gain, dur in CUES:
    y = load(i); y = y / (np.abs(y).max() + 1e-9) * 0.85; a = anchor(y, mode); start = int(round(tc * SR)) - a
    if dur is not None: y = y[:int((a + dur * SR) if mode == 'start' else min(len(y), a + dur * SR))]
    fo = min(len(y) // 4, int(0.06 * SR)); y = y.copy(); y[-fo:] *= np.linspace(1, 0, fo)[:, None]
    s0 = max(0, start); y = y[s0 - start:]; end = min(len(bus), s0 + len(y))
    if end > s0: bus[s0:end] += y[:end - s0] * gain
    log.append({'id': i, 'contact_t': round(tc, 3), 'mode': mode, 'placed_start_t': round(start / SR, 3), 'gain': gain})
bus = np.tanh(bus * 0.9) / np.tanh(0.9)
sf.write('audio/sfx.wav', bus.astype('float32'), SR, subtype='PCM_16')
json.dump(log, open('audio/cues_placed.json', 'w'), indent=0); print('sfx.wav', len(CUES), 'cues; peak', round(float(np.abs(bus).max()), 3))
