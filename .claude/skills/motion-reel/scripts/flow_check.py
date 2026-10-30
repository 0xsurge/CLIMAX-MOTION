#!/usr/bin/env python3
"""Motion checks on a RENDERED mp4: smoothness, stillness, pops, and centring.
   python3 flow_check.py out/final_16x9.mp4 [--cuts 13.0,56.0] [--centre 64.5,70.9] [--fps 60]
smoothness: the global image motion per frame (phase correlation at 480x270) must not change speed or direction abruptly.
            A jerk is a frame-to-frame change in that motion above 2.5 px (at 480 wide) that is not on an intended cut. Frames where the
            match confidence is low (a content swap inside a morph) are skipped: they change the image, they don't move it.
stillness:  no stretch of 0.25 s or more where the mean frame difference stays under 0.05.
pops:       no single-frame spike in frame difference (> 1.5 and > 3x both neighbours) except on intended cuts.
centre:     at each --centre time, the centre of the dark content (type, objects) must be within 8 px of the frame centre."""
import argparse, subprocess, numpy as np, cv2

p = argparse.ArgumentParser(); p.add_argument('video'); p.add_argument('--cuts', default=''); p.add_argument('--centre', default=''); p.add_argument('--fps', type=float, default=60)
a = p.parse_args(); cuts = [float(x) for x in a.cuts.split(',') if x]; fps = a.fps
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.video, '-vf', 'scale=480:270,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, 270, 480).astype(np.float32)
oncut = lambda t: any(abs(t - c) < 1.5 / fps for c in cuts)
d = np.abs(np.diff(F, axis=0)).mean((1, 2))
win = cv2.createHanningWindow((480, 270), cv2.CV_32F)
PC = [cv2.phaseCorrelate(F[i], F[i + 1], win) for i in range(len(F) - 1)]
v = np.array([x[0] for x in PC]); conf = np.array([x[1] for x in PC])   # low confidence = the content changed (a swap), not a move
jerk = np.hypot(*np.diff(v, axis=0).T)
J = [(round((i + 2) / fps, 3), round(float(jerk[i]), 2)) for i in range(len(jerk)) if jerk[i] > 2.5 and min(conf[i], conf[i + 1]) > .4 and not oncut((i + 2) / fps) and d[i + 1] > .05]
still = d < .05; runs, s0 = [], None
for i, s in enumerate(list(still) + [False]):
    if s and s0 is None: s0 = i
    if not s and s0 is not None:
        if i - s0 >= .25 * fps: runs.append((round(s0 / fps, 2), round((i - s0) / fps, 2)))
        s0 = None
pops = [round((i + 1) / fps, 3) for i in range(1, len(d) - 1) if d[i] > 1.5 and d[i] > 3 * max(d[i - 1], d[i + 1]) and not oncut((i + 1) / fps)]
print(f'frames {len(F)}  smoothness: {len(J)} jerks (max {max([j[1] for j in J], default=0)})  {J[:12]}')
print(f'stillness: {len(runs)} stretches >= 0.25 s  {runs[:12]}')
print(f'pops: {len(pops)}  {pops[:12]}')
for t in [float(x) for x in a.centre.split(',') if x]:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', a.video, '-frames:v', '1', '-vf', 'format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    g = np.frombuffer(raw, np.uint8).reshape(1080, 1920); ys, xs = np.nonzero(g < 90)
    if not len(xs): print(f'centre {t}: no dark content'); continue
    x0, x1 = np.percentile(xs, [.5, 99.5]); cx = (x0 + x1) / 2
    print(f'centre {t}: content centre x {cx:.0f} ({cx - 960:+.0f} px) {"OK" if abs(cx - 960) <= 8 else "OFF"}')
