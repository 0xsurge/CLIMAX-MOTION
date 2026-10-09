#!/usr/bin/env python3
"""Builds audio/music.wav and audio/sfx.wav for the Nyangu film.   python3 make_audio.py
Song: Mixkit #218 'Africa' (124 BPM, beat 0.4839 s). Its bass entry (source 28.093 s) lands on film beat 16 (the drop):
film [0, end) <- source [28.093 - 16 beats, ...). SFX: downloaded Mixkit files (../dripverse/audio/sfx) placed by measured peak or start,
at times read from the TIMELINE (const B) in film.js, so picture and sound share one source of truth."""
import re, json, numpy as np, soundfile as sf, librosa, warnings
warnings.filterwarnings('ignore')
SR = 44100; BEAT = 60 / 124; DUR = 1873 / 60; SFX = '../dripverse/audio/sfx'
body = re.search(r'const B = \{(.*?)\};', open('film.js').read(), re.S).group(1)
B = {k: (json.loads(v) if v.startswith('[') else float(v)) for k, v in re.findall(r'(\w+): (\[[^\]]*\]|[\d.]+)', body)}
b = lambda x: x * BEAT; T = {k: ([b(x) for x in v] if isinstance(v, list) else b(v)) for k, v in B.items()}
song, sr = sf.read('audio/song_raw.wav'); assert sr == SR
if song.ndim == 1: song = np.stack([song, song], 1)
src0 = 28.093 - 16 * BEAT; n = int(round(DUR * SR))
out = song[int(src0 * SR):int(src0 * SR) + n].copy(); t = np.arange(n) / SR
out *= (1 - np.clip((t - (DUR - 1.3)) / 1.3, 0, 1) ** 1.5)[:, None]
sf.write('audio/music.wav', out.astype('float32'), SR, subtype='PCM_16'); print('music.wav', round(n / SR, 3), 's from source', round(src0, 3))
CUES = [(1489, T['tile'], 'start', .45, .8), (2358, T['land'], 'peak', .55, None), (2356, T['find'], 'peak', .35, None), (2356, T['perfect'], 'peak', .35, None),
 (2350, T['space'], 'peak', .35, .8), (2357, T['lagos'], 'peak', .55, None), (1489, T['open'] - .1, 'start', .5, 1.0), (175, T['open'], 'peak', .4, None),
 (2356, T['photoH'], 'peak', .4, None), (175, T['toCard'], 'peak', .45, None), (2356, T['just'], 'peak', .4, None), (2356, T['count'], 'peak', .3, None),
 *[(2358, b(B['roll'] + .3 * k), 'peak', .35, None) for k in range(1, 6)], (2638, T['suck'], 'start', .45, 1.2), (2295, b(B['wind'] - 1), 'start', .4, 1.0),
 (1143, T['drop'], 'peak', .7, 2.5), (2900, T['drop'], 'peak', .45, None), *[(175, T['drop'] + .035 * i, 'peak', .25, None) for i in range(0, 6, 2)],
 *[(2358, f, 'peak', .45, None) for f in T['focus']], *[(175, f, 'peak', .3, None) for f in T['focus']], (1143, T['focus'][4], 'peak', .45, 2.0),
 (1489, T['panel'], 'start', .45, .9), (2356, T['nextH'], 'peak', .35, None), (175, T['cur'], 'peak', .3, None), (1109, T['click'], 'peak', 1.0, None),
 *[(175, T['strips'] + .06 * i, 'peak', .3, None) for i in range(3)], (2356, T['rent'], 'peak', .4, None),
 *[(2578, b(B['deal'] + .5 * i), 'peak', .35, .8) for i in range(3)], (1489, T['whip'], 'start', .45, .8),
 *[(2358, b(B['rows'] + .5 * i), 'peak', .45, None) for i in range(3)], (2867, b(B['rows'] + 1) + .15, 'peak', .45, None), (2357, T['pill'], 'peak', .6, None),
 (175, T['mask'], 'peak', .4, None), (2578, T['mask'], 'peak', .4, .8), (2356, T['built'], 'peak', .4, None), (2356, T['proof'], 'peak', .4, None),
 (2638, T['suck2'], 'start', .45, 1.2), (2295, T['wind2'] - .3, 'start', .35, .7), (1143, T['lock'], 'peak', .55, 2.0), (933, T['word'], 'peak', .6, None),
 (2357, T['cta'], 'peak', .55, None), (2354, T['url'], 'peak', .35, None)]
def load(i):
    y, _ = librosa.load(f'{SFX}/{i}.mp3', sr=SR, mono=False); return np.stack([y, y], 1) if y.ndim == 1 else y.T
def anchor(y, mode):
    env = np.abs(y).max(1); k = int(0.003 * SR); env = np.convolve(env, np.ones(k) / k, 'same'); pk = env.max()
    return int(np.argmax(env)) if mode == 'peak' else int(np.argmax(env > 0.06 * pk))
bus = np.zeros((n, 2)); log = []
for i, tc, mode, gain, dur in CUES:
    y = load(i); y = y / (np.abs(y).max() + 1e-9) * 0.85; a = anchor(y, mode); start = int(round(tc * SR)) - a
    if dur is not None: y = y[:int((a + dur * SR) if mode == 'start' else min(len(y), a + dur * SR))]
    fo = min(len(y) // 4, int(0.06 * SR)); y = y.copy(); y[-fo:] *= np.linspace(1, 0, fo)[:, None]
    s0 = max(0, start); y = y[s0 - start:]; end = min(n, s0 + len(y))
    if end > s0: bus[s0:end] += y[:end - s0] * gain
    log.append({'id': i, 'contact_t': round(tc, 3), 'mode': mode, 'gain': gain})
bus = np.tanh(bus * 0.9) / np.tanh(0.9)
sf.write('audio/sfx.wav', bus.astype('float32'), SR, subtype='PCM_16')
json.dump(log, open('audio/cues_placed.json', 'w'), indent=0); print('sfx.wav', len(CUES), 'cues; peak', round(float(np.abs(bus).max()), 3))
