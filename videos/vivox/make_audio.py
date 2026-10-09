#!/usr/bin/env python3
"""Builds audio/music.wav and audio/sfx.wav for the Vivox film.   python3 make_audio.py
Song: Mixkit #440 'Infinity' (112.01 BPM, beat 0.5357 s). Its first low hit (the lift) at source 17.19 s lands on film beat 15 (8.035 s):
film [0, end) <- source [17.19 - 15 beats, ...). SFX: downloaded Mixkit files (../dripverse/audio/sfx), each placed by its measured
peak or start. Cue times are read from the TIMELINE (const B) in film.js, so picture and sound share one source of truth."""
import re, json, numpy as np, soundfile as sf, librosa, warnings
warnings.filterwarnings('ignore')
SR = 44100; BEAT = 0.5356526; DUR = 1930 / 60; SFX = '../dripverse/audio/sfx'
js = open('film.js').read(); body = re.search(r'const B = \{(.*?)\};', js, re.S).group(1)
B = {k: (json.loads(v) if v.startswith('[') else float(v)) for k, v in re.findall(r'(\w+): (\[[^\]]*\]|[\d.]+)', body)}
T = {k: ([x * BEAT for x in v] if isinstance(v, list) else v * BEAT) for k, v in B.items()}
song, sr = sf.read('audio/song_raw.wav'); assert sr == SR
if song.ndim == 1: song = np.stack([song, song], 1)
src0 = 17.19 - 15 * BEAT; n = int(DUR * SR)
out = song[int(src0 * SR):int(src0 * SR) + n].copy()
t = np.arange(n) / SR
out *= (1 - np.clip((t - (DUR - 1.4)) / 1.4, 0, 1) ** 1.5)[:, None]
sf.write('audio/music.wav', out.astype('float32'), SR, subtype='PCM_16'); print('music.wav', n / SR, 's from source', round(src0, 3))
b = lambda x: x * BEAT
CUES = [(2357, T['orbLand'], 'peak', .5, None),
 *[(2356, T[k], 'peak', .3, None) for k in ('w1', 'w2', 'w3', 'w4', 'w5')],
 *[(2358, x, 'peak', .35, None) for x in (T['c1'], T['c2'], T['c3'], b(B['pile']), b(B['pile'] + 1), b(B['pile'] + 2))],
 (2357, T['chip1'], 'peak', .55, None), (1489, T['pile'], 'start', .35, 1.5), (2350, b(B['lift'] + 1), 'peak', .4, 1.4),
 (175, T['cam1'], 'start', .45, .6), (1143, T['drop'], 'peak', .55, 3.0), (2357, T['chipR'], 'peak', .6, None),
 (2578, T['rachel'], 'peak', .45, 1.0), (1109, T['frame'], 'peak', .6, None), (2354, b(B['frame'] + .25), 'peak', .3, None),
 *[(2356, b(B['list'] + .25 * i), 'peak', .25, None) for i in range(5)], *[(2358, x, 'peak', .4, None) for x in T['act']],
 (1489, T['grow'], 'start', .45, 1.2), (2578, T['grow'], 'peak', .4, 1.0), (1109, T['f1'], 'peak', .6, None), (1109, T['f2'], 'peak', .55, None),
 (175, T['cam2'], 'start', .45, .6), (2350, T['ring'], 'peak', .45, 1.4), (2356, T['expl'], 'peak', .35, None), (2357, T['aud'], 'peak', .55, None),
 (175, T['ringOut'], 'start', .35, .6), (2638, T['field'], 'start', .45, 1.8), (2356, T['fw1'], 'peak', .35, None), (2357, T['fchip'], 'peak', .55, None),
 (1489, T['cam3'], 'start', .4, 1.2), (2356, T['sup'], 'peak', .4, None), (2578, T['rachel2'], 'peak', .4, 1.0),
 (175, T['cam4'], 'start', .4, .6), (3000, T['split'], 'peak', .4, None), (933, T['logo'], 'peak', .75, None),
 (2357, T['cta'], 'peak', .5, None), (1109, T['click'], 'peak', 1.0, None)]
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
