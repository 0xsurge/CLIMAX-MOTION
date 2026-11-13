# Pace the YarnGPT2 lines like the approved jude sample: trim silence, slow to 85 % (pitch kept).
# Reads sound/vo/<key>.raw.wav, writes sound/vo/<key>.wav, and flags lines longer than their slot.
# usage (from videos/moniepoint): python3 sound/pace_vo.py [tempo]
import json, subprocess, sys
TEMPO = float(sys.argv[1]) if len(sys.argv) > 1 else .85
L = json.load(open('sound/vo_lines.json'))
for n, (key, t0, text) in enumerate(L):
    src, out = f'sound/vo/{key}.raw.wav', f'sound/vo/{key}.wav'
    trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-af', f'{trim},atempo={TEMPO}', out], check=True)
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]))
    slot = (L[n + 1][1] if n + 1 < len(L) else 43.0) - t0
    print(f'{key} {d:5.2f}s slot {slot:5.2f}s {"OVER" if d > slot - .15 else "ok"}  {text}')
