#!/usr/bin/env python3
"""Builds audio/music.wav and audio/sfx.wav for the DRIP VERSE Musixquare-style film (32 s).   python3 make_audio.py
Song: Mixkit #132 'Hazy After Hours' (grid 120.07 BPM, first kick 0.271 s), read from ../dripverse/audio/song_raw.wav.
Film [0,28) <- source [8.27,36.27): the groove lands at film 8.0 s on the button click. Film [28,32) <- the quiet outro bars
[112.21,116.21): the splice sits on the first hard cut. SFX: downloaded Mixkit files in ../dripverse/audio/sfx, each placed by its
measured peak (or start) on the timeline time in film.js."""
import json, numpy as np, soundfile as sf, librosa, warnings
warnings.filterwarnings('ignore')
SR = 44100; DUR = 32.0; SRC = '../dripverse/audio'
g = json.load(open(f'{SRC}/song_grid.json')); t0, per = g['t0'], g['period']
song, sr = sf.read(f'{SRC}/song_raw.wav'); assert sr == SR
if song.ndim == 1: song = np.stack([song, song], 1)
SEG = [(0.0, 28.0, t0 + 16 * per), (28.0, 32.0, t0 + 224 * per)]
out = np.zeros((int(DUR * SR), 2)); XF = int(0.02 * SR)
for k, (fa, fb, sa) in enumerate(SEG):
    a, b = int(fa * SR), int(fb * SR); seg = song[int(sa * SR):int(sa * SR) + (b - a)].copy(); n = len(seg); w = np.ones(n)
    if k > 0: w[:XF] = np.sin(np.linspace(0, np.pi / 2, XF))
    if k < len(SEG) - 1: w[-XF:] = np.cos(np.linspace(0, np.pi / 2, XF))
    out[a:a + n] += seg * w[:, None]
t = np.arange(len(out)) / SR
out *= (1 - np.clip((t - 30.9) / 1.1, 0, 1) ** 1.5)[:, None]
out[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))[:, None]
sf.write('audio/music.wav', out.astype('float32'), SR, subtype='PCM_16'); print('music.wav', len(out) / SR, 's')

T = dict(arrow=0.7, flip1=1.3, flip2=1.9, tick1=2.75, tick2=3.5, out1=4.0, all=4.3, pill=4.75, click=7.5, drop=8.0, collapse=8.75, word=9.45,
         phone=10.45, pick=11.0, chip=12.6, add=13.5, check=13.8, phoneOut=14.3, ordered=14.6, code=15.6, field=15.7, land=16.4, out6=17.9,
         mark2=18.35, orbit=18.45, zoom=21.0, dtime=21.6, flyOut=24.6, tracker=24.6, n1=25.3, n2=26.0, n3=27.0, cut1=27.995, cut2=28.995,
         end=29.995, cta=30.7, pow=31.0, ctaClick=31.5)
CUES = [   # (mixkit id, film time, mode, gain, max duration)
 (2356, T['arrow'], 'peak', .4, None), (2356, T['flip1'], 'peak', .35, None), (2358, T['flip2'], 'peak', .4, None), (175, T['flip2'], 'peak', .35, None),
 (2357, 2.1, 'peak', .4, None), (2354, 2.3, 'peak', .3, None), (2358, T['tick1'], 'peak', .45, None), (175, T['tick1'], 'peak', .3, None),
 (2358, T['tick2'], 'peak', .45, None), (175, T['tick2'], 'peak', .3, None), (1489, T['out1'], 'start', .45, 1.2), (2356, T['all'], 'peak', .35, None),
 (2578, T['pill'], 'peak', .55, 1.0), (1109, T['click'], 'peak', 1.0, None),
 (2900, T['drop'], 'peak', .85, None), (1311, T['drop'], 'peak', .7, None), (1143, T['drop'], 'peak', .55, 3.0), (1489, T['collapse'], 'start', .45, 1.0),
 (2350, T['word'], 'peak', .45, 1.4), (2578, T['phone'], 'peak', .5, 1.0), (2357, T['pick'], 'peak', .4, None), (2354, T['pick'] + .4, 'peak', .3, None),
 (1109, T['chip'], 'peak', .85, None), (1109, T['add'], 'peak', .85, None), (2867, T['check'] + .15, 'peak', .55, None), (175, T['phoneOut'], 'start', .45, .6),
 (2356, T['ordered'], 'peak', .4, None), (2357, T['code'], 'peak', .5, None), (2354, T['field'], 'peak', .3, None), (2358, T['land'], 'peak', .55, None),
 (1489, T['out6'], 'start', .35, 1.0), (3000, 18.0, 'peak', .4, None), (1317, T['mark2'], 'peak', .7, None),
 *[(2357, T['orbit'] + .07 * i, 'peak', .25, None) for i in range(6)],
 (1489, T['zoom'], 'start', .5, 1.4), (175, T['zoom'], 'peak', .4, None), (1317, T['dtime'], 'peak', .6, None), (1321, T['dtime'], 'start', .3, 1.6),
 (175, T['flyOut'], 'start', .5, .6), (2578, T['tracker'], 'peak', .5, 1.0), (2867, T['n1'], 'peak', .5, None), (2358, T['n2'], 'peak', .5, None), (933, T['n3'], 'peak', .8, None),
 (2356, T['cut1'], 'peak', .45, None), (2356, T['cut2'], 'peak', .45, None), (1317, T['end'], 'peak', .7, None), (1321, T['end'], 'start', .35, 1.6),
 (2357, T['cta'], 'peak', .55, None), (2354, T['pow'], 'peak', .35, None), (1109, T['ctaClick'], 'peak', 1.0, None)]
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
