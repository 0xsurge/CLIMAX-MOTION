#!/usr/bin/env python3
"""Sound for the 6 s DRIP VERSE 3D test shot.   python3 make_audio.py
Music: Mixkit #132 'Hazy After Hours' from ../dripverse/audio/song_raw.wav, 6 s from a groove bar (beat grid t0 0.271, 0.49973 s).
SFX: downloaded Mixkit files in ../dripverse/audio/sfx, each placed by its measured peak (or start) on the action times in src/Shot.tsx."""
import json, numpy as np, soundfile as sf, librosa, warnings
warnings.filterwarnings('ignore')
SR = 44100; DUR = 6.0; SRC = '../dripverse/audio'
g = json.load(open(f'{SRC}/song_grid.json')); t0, per = g['t0'], g['period']
song, sr = sf.read(f'{SRC}/song_raw.wav'); assert sr == SR
if song.ndim == 1: song = np.stack([song, song], 1)
a = int((t0 + 40 * per) * SR); music = song[a:a + int(DUR * SR)].copy()
t = np.arange(len(music)) / SR
music *= (np.clip(t / .35, 0, 1) * (1 - np.clip((t - 5.0) / 1.0, 0, 1) ** 1.5))[:, None] * .8
CUES = [(175, .25, 'peak', .35, None), (2350, .45, 'peak', .25, 1.2), (2578, 1.45, 'peak', .4, 1.0), (175, 2.1, 'peak', .25, None),
        (1109, 2.62, 'peak', 1.0, None), (2350, 2.7, 'peak', .35, 1.4), (2867, 2.75, 'peak', .3, None), (2356, 3.65, 'peak', .35, None),
        (2357, 3.8, 'peak', .5, None), (2354, 4.1, 'peak', .3, None), (2350, 4.05, 'peak', .22, 1.2), (2350, 5.25, 'peak', .18, 1.0)]
def load(i):
    y, _ = librosa.load(f'{SRC}/sfx/{i}.mp3', sr=SR, mono=False); return np.stack([y, y], 1) if y.ndim == 1 else y.T
bus = np.zeros((int(DUR * SR), 2))
for i, tc, mode, gain, dur in CUES:
    y = load(i); y = y / (np.abs(y).max() + 1e-9) * .85
    env = np.convolve(np.abs(y).max(1), np.ones(132) / 132, 'same'); an = int(np.argmax(env)) if mode == 'peak' else int(np.argmax(env > .06 * env.max()))
    if dur: y = y[:int(an + dur * SR)]
    fo = min(len(y) // 4, int(.06 * SR)); y = y.copy(); y[-fo:] *= np.linspace(1, 0, fo)[:, None]
    s0 = int(round(tc * SR)) - an; y = y[max(0, -s0):]; s0 = max(0, s0); e = min(len(bus), s0 + len(y)); bus[s0:e] += y[:e - s0] * gain
bus = np.tanh(bus * .9) / np.tanh(.9)
sf.write('audio/music.wav', music.astype('float32'), SR, subtype='PCM_16'); sf.write('audio/sfx.wav', bus.astype('float32'), SR, subtype='PCM_16')
print('ok', len(CUES), 'cues')
