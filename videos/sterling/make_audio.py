#!/usr/bin/env python3
"""Builds audio/music.wav and audio/sfx.wav for the Sterling "One key" film (35.3 s, 76 beats).   python3 make_audio.py
Song: Mixkit #371 'Cat Walk' (grid 129.24 BPM, measured in audio/song_grid.json), read from audio/song_raw.wav.
Film [0, end) <- source from 4 beats before the song's lift, so the drop lands on film beat 4 (1.86 s): the hook starts at full energy. The
quiet bars after source 60 s fall under the Mira end card. SFX: downloaded Mixkit files in ../dripverse/audio/sfx, each placed by its
measured peak (or start) on the timeline time in film.js."""
import json, numpy as np, soundfile as sf, librosa, warnings
warnings.filterwarnings('ignore')
SR = 44100; DUR = 76 * 0.46427; SRC = 'audio'; SFX = '../dripverse/audio/sfx'
g = json.load(open(f'{SRC}/song_grid.json')); t0, per = g['t0'], g['period']; drop = g['drop_src']
song, sr = sf.read(f'{SRC}/song_raw.wav'); assert sr == SR
if song.ndim == 1: song = np.stack([song, song], 1)
SEG = [(0.0, DUR, drop - 4 * per)]
out = np.zeros((int(DUR * SR), 2)); XF = int(0.02 * SR)
for k, (fa, fb, sa) in enumerate(SEG):
    a, b = int(fa * SR), int(fb * SR); seg = song[int(sa * SR):int(sa * SR) + (b - a)].copy(); n = len(seg); w = np.ones(n)
    if k > 0: w[:XF] = np.sin(np.linspace(0, np.pi / 2, XF))
    if k < len(SEG) - 1: w[-XF:] = np.cos(np.linspace(0, np.pi / 2, XF))
    out[a:a + n] += seg * w[:, None]
t = np.arange(len(out)) / SR
out *= (1 - np.clip((t - (DUR - 1.4)) / 1.4, 0, 1) ** 1.5)[:, None]
out[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))[:, None]
sf.write('audio/music.wav', out.astype('float32'), SR, subtype='PCM_16'); print('music.wav', len(out) / SR, 's')

# v2: one continuous take. Cues follow film.js: the light sweeps, the card morphs, the light passes and every pop and click.
SWEEPS = [2.4, 4.9, 7.9, 12.9, 20.4, 24.9, 29.9, 35.4, 44.4, 48.9, 55.9, 62.4]
MORPHS = [3.5, 6.95, 10.0, 12.0, 16.3, 28.0, 32.0, 39.2, 42.0, 58.5]          # card morphs that have no sweep of their own
import re
js = open('film.js').read(); body = re.search(r'const B = \{(.*?)\};', js, re.S).group(1)
B = {k: (json.loads(v) if v.startswith('[') else float(v)) for k, v in re.findall(r'(\w+): (\[[^\]]*\]|[\d.]+)', body)}
b = lambda x: x * per
T = {k: ([b(x) for x in v] if isinstance(v, list) else b(v)) for k, v in B.items()}
CUES = [   # (mixkit id, film time, mode, gain, max duration); times from the film's B table
 (2900, 0.02, 'peak', .55, None), (2900, T['w2'], 'peak', .5, None), (175, T['drop'] - .2, 'peak', .5, None), (1311, T['drop'], 'peak', .7, None), (2358, T['drop'] + .12, 'peak', .5, None),
 *[(2357, T['pills'] + .07 * i, 'peak', .2, None) for i in range(8)], (2354, T['label'], 'peak', .3, None),
 (1489, T['suck'], 'start', .5, 1.0), (1143, T['zoom'], 'peak', .45, 2.0), (1317, T['unlock'] + .1, 'peak', .55, None), (2350, T['h1'], 'peak', .3, 1.4),
 (2578, T['card'], 'peak', .45, 1.0), *[(2358, x, 'peak', .35, None) for x in T['steps']], (1489, T['grow'], 'start', .4, .9), (2354, T['routed'], 'peak', .3, None),
 (2578, T['cards'], 'peak', .35, 1.0), *[(2358, x, 'peak', .3, None) for x in T['focus']], (175, T['gather'], 'peak', .4, None), (2354, T['three'], 'peak', .3, None),
 *[(2357, T['deal'] + .15 * i, 'peak', .4, None) for i in range(3)], (1109, T['keyIn'] + .35, 'peak', .8, None), (2578, T['code'], 'peak', .4, 1.0),
 *[(2354, T['url'] - .8 + .12 * i, 'peak', .12, None) for i in range(6)], (2867, T['url'] + .3, 'peak', .4, None), (175, T['fold'], 'peak', .4, None),
 (2350, T['onekey'], 'peak', .3, 1.4), (1317, T['lock'] + .25, 'peak', .6, None), (2357, T['btn'], 'peak', .5, None), (1109, T['click'], 'peak', .9, None),
 (1489, T['mira'], 'start', .45, 1.2), (1321, T['mira'] + .3, 'start', .3, 1.6), (2354, T['miraL'], 'peak', .25, None), (2350, T['tag'], 'peak', .3, 1.4)]
def load(i):
    y, _ = librosa.load(f'{SFX}/{i}.mp3', sr=SR, mono=False); return np.stack([y, y], 1) if y.ndim == 1 else y.T
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
