#!/usr/bin/env python3
"""Build the critique kit from a RENDERED mp4 (never from code or the browser preview).
   python3 review.py renders/16x9.mp4 --round 1 [--strip-at 2.0] [--out review]
Writes into <out>/r<round>/: contact.png (2 fps, 6 across), strip.png (12 consecutive frames at --strip-at),
phone.png (1 fps at 360 px wide), loop.mp4 (the video twice back to back), blank_frames.txt (luma-std scan)."""
import argparse, os, subprocess, numpy as np
from PIL import Image

p = argparse.ArgumentParser(); p.add_argument('video'); p.add_argument('--round', type=int, default=1)
p.add_argument('--strip-at', type=float, default=0.0); p.add_argument('--out', default='review')
a = p.parse_args(); d = f'{a.out}/r{a.round}'; os.makedirs(d, exist_ok=True)
def ff(*x): subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *x], check=True)
info = subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,nb_frames', '-of', 'csv=p=0', a.video], text=True).strip().split(',')
w, h, rate = int(info[0]), int(info[1]), eval(info[2]); dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.video]))
nframes = int(dur * 2); cols = 6
ff('-i', a.video, '-vf', f'fps=2,scale=400:-2,tile={cols}x{max(1, -(-nframes // cols))}:padding=6:color=0x222222', '-frames:v', '1', f'{d}/contact.png')
ff('-ss', str(a.strip_at), '-i', a.video, '-vf', f'select=lt(n\\,12),scale=320:-2,tile=6x2:padding=4:color=0x222222', '-frames:v', '1', '-fps_mode', 'passthrough', f'{d}/strip.png')
ff('-i', a.video, '-vf', f'fps=1,scale=360:-2,tile={min(10, max(1, int(dur)))}x{max(1, -(-int(dur) // 10))}:padding=4:color=0x222222', '-frames:v', '1', f'{d}/phone.png')
open(f'{d}/list.txt', 'w').write(f"file '{os.path.abspath(a.video)}'\nfile '{os.path.abspath(a.video)}'\n")
ff('-f', 'concat', '-safe', '0', '-i', f'{d}/list.txt', '-c', 'copy', f'{d}/loop.mp4')
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', a.video, '-vf', f'fps=10,scale=96:-2,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
fs = len(raw) // max(1, int(dur * 10)); frames = np.frombuffer(raw, np.uint8)[:fs * int(dur * 10)].reshape(int(dur * 10), -1)
blank = [(i / 10, float(f.std())) for i, f in enumerate(frames) if f.std() < 4]
open(f'{d}/blank_frames.txt', 'w').write('\n'.join(f'{t:.1f}s luma_std={s:.2f}' for t, s in blank) or 'none')
seam = float(np.abs(frames[0].astype(float) - frames[-1].astype(float)).mean()) if len(frames) > 1 else 0
print(f'{d}: contact.png strip.png phone.png loop.mp4  blank frames: {len(blank)}  first-vs-last frame diff: {seam:.1f}/255')
