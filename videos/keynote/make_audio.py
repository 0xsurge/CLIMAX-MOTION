#!/usr/bin/env python3
"""Builds audio/music.wav (the song edited on beat lines to 27 s) and audio/sfx.wav (every downloaded Mixkit effect placed by its
measured peak or start) for the Armab keynote film.   python3 make_audio.py
Song: Mixkit 'Electro Dreams' (id 190). Measured grid: kicks every 0.5 s at phase 0.037 s (120.04 BPM, no stretching needed).
Edit (film seconds <- source seconds): [0,24) <- [8.027,32.027) lead-in (with its half-level pickup at film 7.5), the drop at film 8.0 (source 16.037), groove | [24,26) <- [47.037,49.037) taper into the breakdown |
[26,27) <- [63.037,64.037) one beat of silence, then the kick returns at film 26.5."""
import json, numpy as np, soundfile as sf, librosa, warnings
warnings.filterwarnings('ignore')
SR = 44100; DUR = 27.0
song, sr = sf.read('audio/song_raw.wav'); assert sr == SR
if song.ndim == 1: song = np.stack([song, song], 1)
SEG = [(0.0, 24.0, 8.027), (24.0, 26.0, 47.037), (26.0, 27.0, 63.037)]       # film start, film end, source start
out = np.zeros((int(DUR * SR), 2)); XF = int(0.02 * SR)
for k, (fa, fb, sa) in enumerate(SEG):
    a, b = int(fa * SR), int(fb * SR); seg = song[int(sa * SR):int(sa * SR) + (b - a)].copy(); n = len(seg)
    w = np.ones(n)
    if k > 0: w[:XF] = np.sin(np.linspace(0, np.pi / 2, XF))                 # equal-power crossfade in
    if k < len(SEG) - 1: w[-XF:] = np.cos(np.linspace(0, np.pi / 2, XF))     # ... and out
    out[a:a + n] += seg * w[:, None]
# the lead-in is near-silent in the source: lift it so the first eight seconds carry some music under the effects
t = np.arange(len(out)) / SR
gain = 1 + 1.6 * np.clip(1 - t / 8.0, 0, 1) ** 0.5 * (t < 8.0)                # up to x2.6 at 0 s, back to x1 at the drop
out *= gain[:, None]
out[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))[:, None]            # 10 ms out so the loop point does not click
sf.write('audio/music.wav', out.astype('float32'), SR, subtype='PCM_16')
print('music.wav', len(out) / SR, 's')

# ---------- sound effects ----------
M = json.load(open('audio/sfx_manifest.json')); EV = M['events']
def load(key):
    y, _ = librosa.load(f"audio/sfx/{EV[key]}.mp3", sr=SR, mono=False)
    return (np.stack([y, y], 1) if y.ndim == 1 else y.T)
def anchor(y, mode):
    env = np.abs(y).max(1); k = int(0.003 * SR); env = np.convolve(env, np.ones(k) / k, 'same'); pk = env.max()
    return int(np.argmax(env)) if mode == 'peak' else int(np.argmax(env > 0.06 * pk))
CUES = [   # key, film time of the visual contact, mode (peak | start), gain, max duration (s)
 ('squeeze', .35, 'peak', .8, None), ('dot_to_pill', 1.60, 'peak', .9, None), ('label_rise', 2.15, 'peak', .8, 0.5), ('click', 2.56, 'peak', 1.0, None),
 ('iris_close', 3.00, 'peak', .9, 0.9), ('iris_open', 3.56, 'peak', .9, 0.8), ('circle_to_square', 4.10, 'peak', .7, 0.9), ('grid_unfold', 5.50, 'start', .8, .8),
 ('grid_plus', 6.10, 'peak', .7, None), ('bento_reflow', 6.50, 'start', .8, 1.0), ('click', 7.56, 'peak', 1.0, None), ('zoom_in', 7.40, 'start', .9, None),
 ('drop_hit', 8.00, 'peak', 1.15, None), ('drop_impact', 8.00, 'peak', .7, 2.4),
 *[(('glass_letter_a', 'glass_letter_b')[i % 2], 8.05 + .2 * i, 'peak', .75, None) for i in range(6)],
 ('droplet', 9.55, 'peak', .9, None), ('toolbar_stretch', 10.0, 'start', .7, 1.0), ('click', 10.56, 'peak', .9, None), ('slider_tick', 10.62, 'peak', .8, None),
 ('lens', 11.0, 'start', .6, 1.2), ('relight_sweep', 11.1, 'start', .55, 2.6), ('orb_lift', 13.0, 'start', .6, 1.6), ('iris_open', 13.56, 'peak', .6, 0.8),
 ('orb_expand', 14.0, 'start', .8, 1.2), ('clock_tick', 14.55, 'peak', .8, None), ('player_stretch', 15.0, 'start', .7, 1.0),
 ('bezel_grow', 15.5, 'start', .7, 1.2), ('island_stretch', 16.5, 'start', .7, 1.0), ('island_pinch', 17.05, 'peak', .8, None), ('island_fly', 17.1, 'start', .7, 0.9),
 ('blind_roll', 17.85, 'start', .8, 1.3), ('long_press', 18.05, 'peak', .8, None), ('drag', 18.55, 'start', .7, 0.9), ('page_push', 19.05, 'start', .8, 1.0),
 ('drop_item', 19.55, 'peak', .9, None), ('scroll', 20.0, 'start', .6, 1.1), ('circle_to_square', 20.60, 'peak', .7, 0.9), ('paint', 21.5, 'start', .8, 1.2),
 ('pick', 22.06, 'peak', .8, None), ('button_fly', 22.5, 'start', .6, 1.2), ('click', 22.78, 'peak', 1.0, None), ('ordered', 22.9, 'peak', .8, None),
 ('printing', 23.4, 'peak', .8, None), ('route', 23.75, 'start', .7, 1.6), ('delivered', 24.4, 'start', .8, 1.6), ('flood', 24.55, 'start', .8, 1.0),
 ('flood_hit', 24.55, 'start', .55, 0.8), ('contract', 25.25, 'start', .8, 1.3), ('hang', 25.62, 'peak', 1.0, None), ('iris_close2', 26.02, 'peak', .8, 0.6),
 ('return_hit', 26.50, 'peak', 1.0, 0.45), ('return_sparkle', 26.72, 'start', .6, 0.28)]
bus = np.zeros((int(DUR * SR), 2)); log = []
for key, tc, mode, g, dur in CUES:
    y = load(key); y = y / (np.abs(y).max() + 1e-9) * 0.85
    a = anchor(y, mode); start = int(round(tc * SR)) - a
    if dur is not None: y = y[:int((a + dur * SR) if mode == 'start' else min(len(y), a + dur * SR))]
    fo = min(len(y) // 4, int(0.06 * SR)); y = y.copy(); y[-fo:] *= np.linspace(1, 0, fo)[:, None]
    s0 = max(0, start); y = y[s0 - start:]; end = min(len(bus), s0 + len(y))
    if end > s0: bus[s0:end] += y[:end - s0] * g
    log.append({'key': key, 'id': EV[key], 'contact_t': tc, 'mode': mode, 'placed_start_t': round(start / SR, 3), 'anchor_in_file_s': round(a / SR, 3), 'gain': g})
bus = np.tanh(bus * 0.9) / np.tanh(0.9)
sf.write('audio/sfx.wav', bus.astype('float32'), SR, subtype='PCM_16')
json.dump(log, open('audio/cues_placed.json', 'w'), indent=0); print('sfx.wav', len(CUES), 'cues placed;', 'peak', round(float(np.abs(bus).max()), 3))
