# Lay the voiceover lines on the film's timeline (each at its scene, never overlapping) -> sound/vo.wav
import json, sys, numpy as np, wave, subprocess
SR = 44100; DUR = 34.03; src = sys.argv[1]; out_path = sys.argv[2]
L = json.load(open('sound/vo_lines.json')); out = np.zeros(int((DUR + 2) * SR)); prev = 0
tmp = '/tmp/claude-0/-home-user-CLIMAX-MOTION/ebd3c3d1-b9fc-58c3-8e73-03b9f49be28b/scratchpad/v.wav'
for key, t0, text in L:
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{src}/{key}.wav', '-ar', str(SR), '-ac', '1', '-af',
        'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', tmp], check=True)
    w = wave.open(tmp); x = np.frombuffer(w.readframes(w.getnframes()), '<i2') / 32768
    t = max(t0, prev + .15); i = int(t * SR); x = x[:max(0, len(out) - i)]; out[i:i + len(x)] += x; prev = t + len(x) / SR
    print(key, round(t, 2), round(prev, 2))
out = out[:int(DUR * SR)]; out /= max(1e-9, abs(out).max()) / .9
with wave.open(out_path, 'wb') as o: o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((out * 32767).astype('<i2').tobytes())
