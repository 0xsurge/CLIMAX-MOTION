#!/usr/bin/env python3
"""Builds audio/music.wav (Mixkit #132 'Hazy After Hours', edited on its measured grid to 30 s) and audio/sfx.wav (downloaded Mixkit
effects, each placed by its measured peak or start on the film's visual contact time).   python3 make_audio.py
Grid: kicks every 0.4997 s, first kick 0.271 s (120.07 BPM). Film [0,26) <- source [4.27,30.27): the groove lands at film 12.0 s (source 16.27).
Film [26,30) <- source [112.21,116.21): the quiet outro bars. Equal-power 20 ms crossfade at the splice (both on bar lines)."""
import json, numpy as np, soundfile as sf, librosa, warnings
warnings.filterwarnings('ignore')
SR = 44100; DUR = 30.0
g = json.load(open('audio/song_grid.json')); t0, per = g['t0'], g['period']
song, sr = sf.read('audio/song_raw.wav'); assert sr == SR
if song.ndim == 1: song = np.stack([song, song], 1)
SEG = [(0.0, 26.0, t0 + 8 * per), (26.0, 30.0, t0 + 224 * per)]
out = np.zeros((int(DUR * SR), 2)); XF = int(0.02 * SR)
for k, (fa, fb, sa) in enumerate(SEG):
    a, b = int(fa * SR), int(fb * SR); seg = song[int(sa * SR):int(sa * SR) + (b - a)].copy(); n = len(seg); w = np.ones(n)
    if k > 0: w[:XF] = np.sin(np.linspace(0, np.pi / 2, XF))
    if k < len(SEG) - 1: w[-XF:] = np.cos(np.linspace(0, np.pi / 2, XF))
    out[a:a + n] += seg * w[:, None]
t = np.arange(len(out)) / SR
out *= (1 - np.clip((t - 28.8) / 1.2, 0, 1) ** 1.5)[:, None]       # last 1.2 s: let the tail ring out
out[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))[:, None]
sf.write('audio/music.wav', out.astype('float32'), SR, subtype='PCM_16'); print('music.wav', len(out) / SR, 's')

# ---------- sound effects: (mixkit id, film time of the visual contact, mode peak|start, gain, max duration s) ----------
CUES = [
 (2356, .58, 'peak', .35, None), (3000, 2.00, 'peak', .30, None), (1317, 3.00, 'peak', .95, None), (1321, 3.00, 'start', .45, 2.0), (2357, 3.12, 'peak', .5, None),
 (1489, 3.45, 'start', .5, 1.4), (2578, 4.50, 'peak', .5, 1.0), (2354, 5.70, 'peak', .45, None), (2357, 6.15, 'peak', .45, None),
 (2295, 8.00, 'start', .35, 4.0),
 *[(1317, tb, 'peak', .75, None) for tb in (8.0, 9.0, 10.0, 11.0)], *[(175, tb + 0.1, 'peak', .45, None) for tb in (8.0, 9.0, 10.0, 11.0)],
 (2900, 12.00, 'peak', .85, None), (1311, 12.00, 'peak', .8, None), (1143, 12.00, 'peak', .6, 3.0),
 *[((2356, 2357)[i % 2], tt, 'peak', .45, None) for i, tt in enumerate((12.10, 12.22, 12.32, 12.46, 12.54))],
 *[(2356, tf, 'peak', .5, None) for tf in (13.0, 14.0, 15.0)], *[(175, tf + 0.05, 'peak', .35, None) for tf in (13.0, 14.0, 15.0)],
 (1489, 15.95, 'start', .45, 1.4), (2358, 16.25, 'peak', .5, None), (2358, 16.37, 'peak', .5, None), (2358, 16.49, 'peak', .5, None),
 (2350, 17.00, 'peak', .4, 1.4), (2358, 18.00, 'peak', .45, None), (2358, 19.00, 'peak', .45, None),
 (2357, 19.90, 'peak', .6, None), (1109, 21.00, 'peak', 1.0, None), (2638, 21.00, 'start', .5, 1.8),
 (2578, 22.40, 'peak', .55, 1.0), (2867, 22.60, 'peak', .55, None), (2358, 23.60, 'peak', .55, None), (933, 25.00, 'peak', .85, None),
 (175, 25.55, 'start', .6, .6), (1489, 25.60, 'start', .5, 1.5), (2356, 26.70, 'peak', .4, None), (2354, 27.75, 'peak', .4, None),
 (1317, 28.00, 'peak', .8, None), (1321, 28.00, 'start', .4, 2.0)]
def load(i):
    y, _ = librosa.load(f'audio/sfx/{i}.mp3', sr=SR, mono=False); return np.stack([y, y], 1) if y.ndim == 1 else y.T
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
    log.append({'id': i, 'contact_t': tc, 'mode': mode, 'placed_start_t': round(start / SR, 3), 'anchor_in_file_s': round(a / SR, 3), 'gain': gain})
bus = np.tanh(bus * 0.9) / np.tanh(0.9)
sf.write('audio/sfx.wav', bus.astype('float32'), SR, subtype='PCM_16')
json.dump(log, open('audio/cues_placed.json', 'w'), indent=0); print('sfx.wav', len(CUES), 'cues; peak', round(float(np.abs(bus).max()), 3))
