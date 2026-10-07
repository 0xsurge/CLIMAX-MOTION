#!/usr/bin/env python3
"""Measure a track and write beats.json: bpm, beats, downbeats (every 4th beat), hits (onset peaks).
   python3 beats.py audio/music.wav --out beats.json
State changes land on beats, big moments on downbeats, SFX on hits."""
import argparse, json, numpy as np, librosa

p = argparse.ArgumentParser(); p.add_argument('wav'); p.add_argument('--out', default='beats.json')
a = p.parse_args()
y, sr = librosa.load(a.wav, sr=None, mono=True)
env = librosa.onset.onset_strength(y=y, sr=sr)
tempo, frames = librosa.beat.beat_track(onset_envelope=env, sr=sr, units='frames', tightness=200)
beats = librosa.frames_to_time(frames, sr=sr)
bpm = float(np.atleast_1d(tempo)[0])
# Re-fit a perfect grid to the measured beats (least squares), then anchor beat 0 where audio starts.
if len(beats) > 3:
    k = np.arange(len(beats)); period, t0 = np.polyfit(k, beats, 1); bpm = 60 / period
    back = int((t0 + 0.03) / period)            # beat_track skips the first beat; extend the grid back to the start
    n = int((len(y) / sr - t0) / period) + 1; beats = t0 + period * np.arange(-back, max(n, 0))
onsets = librosa.onset.onset_detect(onset_envelope=env, sr=sr, units='time', backtrack=False)
json.dump({'bpm': round(bpm, 3), 'duration': round(len(y) / sr, 3),
           'beats': [round(float(b), 4) for b in beats],
           'downbeats': [round(float(b), 4) for b in beats[::4]],
           'hits': [round(float(h), 4) for h in onsets]}, open(a.out, 'w'), indent=1)
print(f'{a.out}  bpm {bpm:.2f}  beats {len(beats)}  hits {len(onsets)}')
