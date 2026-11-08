"""Find each full-quality piece's true start on the proxy timeline (audio cross-correlation), then conform it to CFR 30 fps."""
import glob, json, os, re, subprocess, numpy as np, soundfile as sf
from scipy.signal import fftconvolve
S = '/tmp/claude-0/-home-claude/7f3602e2-2584-533b-a206-586fedb7a675/scratchpad'
SRC = '/mnt/user-data/uploads/STAGE ORION 1/hq'; SR = 16000; out = []
for p in sorted(glob.glob(f'{SRC}/STAGE_*.mov')):
    c, s = re.match(r'.*STAGE_(\d+)_([\d.]+)\.mov', p).groups(); s = float(s)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', p, '-vn', '-ac', '1', '-ar', str(SR), f'{S}/hqa.wav'], check=True)
    a, _ = sf.read(f'{S}/hqa.wav'); ref, _ = sf.read(f'{S}/sil/{c}.wav')
    lo = max(0, int((s - 2) * SR)); r = ref[lo: lo + len(a) + 4 * SR]
    seg = a[:min(len(a), 8 * SR)]
    cc = fftconvolve(r, seg[::-1], 'valid'); k = int(np.argmax(cc))
    start = (lo + k) / SR
    norm = cc[k] / (np.linalg.norm(seg) * np.linalg.norm(r[k:k + len(seg)]) + 1e-9)
    o = f'hq-cfr/STAGE_{c}_{s:.2f}.mp4'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', p, '-an', '-vf', 'fps=30,setsar=1', '-fps_mode', 'cfr', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', o], check=True)
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', o], capture_output=True, text=True).stdout)
    out.append(dict(clip=c, file=o, start=round(start, 4), dur=round(d, 4), nominal=s, match=round(float(norm), 3)))
    print(f'{c} nominal {s:7.2f} -> true {start:8.3f}  shift {start - s:+.3f}s  match {norm:.2f}  dur {d:.2f}')
json.dump(out, open('edit/hq_index.json', 'w'), indent=1)
