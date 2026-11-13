# Give every voiceover line ONE shared speed, so the read is even (no line rushed to catch the picture).
# Reads sound/vo_divine_raw/<key>.wav, tries speeds from 1.00 up to MAX, and keeps the lowest one at which no line starts
# more than LATE s after its cue (laid out the way build_vo.py does: a line waits 0.15 s after the previous one ends).
# Writes sound/vo/<key>.wav (pitch kept). usage (from videos/moniepoint): python3 sound/fit_vo_even.py [LATE] [MAX]
import json, subprocess, sys, os
LATE = float(sys.argv[1]) if len(sys.argv) > 1 else .35; MAX = float(sys.argv[2]) if len(sys.argv) > 2 else 1.25
L = json.load(open('sound/vo_lines.json'))
dur = {k: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'sound/vo_divine_raw/{k}.wav'])) for k, _, _ in L}
def worst(t):
    prev, w = 0, 0
    for k, t0, _ in L: s = max(t0, prev + .15); w = max(w, s - t0); prev = s + dur[k] / t
    return w
speeds = [round(1 + i / 100, 2) for i in range(int(round((MAX - 1) * 100)) + 1)]
ok = [t for t in speeds if worst(t) <= LATE]; T = ok[0] if ok else min(speeds, key=worst)
print(f'shared speed x{T:.2f}: latest line starts {worst(T):.2f} s after its cue' + ('' if ok else f' (could not reach {LATE} s within x{MAX})'))
os.makedirs('sound/vo', exist_ok=True)
for k, _, _ in L:
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'sound/vo_divine_raw/{k}.wav', '-af', f'atempo={T:.3f}', f'sound/vo/{k}.wav'], check=True)
