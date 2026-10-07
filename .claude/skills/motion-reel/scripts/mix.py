#!/usr/bin/env python3
"""Mix music + sfx (+ optional voiceover), normalize to -14 LUFS / -1 dBTP (two-pass loudnorm), mux onto the video.
   python3 mix.py --video renders/16x9.mp4 --music audio/music.wav --sfx audio/sfx.wav [--vo audio/vo.wav] --out out/final_16x9.mp4
Music sits at -6 dB under SFX; with a voiceover it ducks a further 8 dB while the voice plays."""
import argparse, json, re, subprocess, sys, os

p = argparse.ArgumentParser()
p.add_argument('--video', required=True); p.add_argument('--music'); p.add_argument('--sfx'); p.add_argument('--vo')
p.add_argument('--out', required=True); p.add_argument('--lufs', type=float, default=-14); p.add_argument('--tp', type=float, default=-1)
a = p.parse_args()
ins = [x for x in (a.music, a.sfx, a.vo) if x]
if not ins: sys.exit('need at least one audio input')
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.video]))
args, parts, labels, idx = ['ffmpeg', '-y', '-hide_banner', '-nostats', '-i', a.video], [], [], 1
GAIN = {'music': 0.5, 'sfx': 1.0, 'vo': 1.2}
for kind, path in (('music', a.music), ('sfx', a.sfx), ('vo', a.vo)):
    if not path: continue
    args += ['-i', path]
    out_label = 'vo_raw' if (kind == 'vo' and a.music) else kind
    parts.append(f'[{idx}:a]aresample=44100,aformat=channel_layouts=stereo,volume={GAIN[kind]}[{out_label}]')
    idx += 1
if a.vo and a.music:  # duck the music under the voice
    parts.append('[vo_raw]asplit[vo][vo_sc]')
    parts = [x.replace('[music]', '[music_raw]') for x in parts]
    parts.append('[music_raw][vo_sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=300[music]')
labels = [k for k, pth in (('music', a.music), ('sfx', a.sfx), ('vo', a.vo)) if pth]
mixchain = ''.join(f'[{l}]' for l in labels) + f'amix=inputs={len(labels)}:normalize=0,alimiter=limit=0.84:level=disabled,atrim=0:{dur},apad=whole_dur={dur}'
flt = ';'.join(parts + [mixchain + '[mix]'])
# pass 1: measure
m = subprocess.run(args + ['-filter_complex', flt + f';[mix]loudnorm=I={a.lufs}:TP={a.tp}:LRA=11:print_format=json[o]', '-map', '[o]', '-f', 'null', '-'], capture_output=True, text=True)
j = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', m.stderr, re.S).group(0))
ln = (f'loudnorm=I={a.lufs}:TP={a.tp}:LRA=11:measured_I={j["input_i"]}:measured_TP={j["input_tp"]}:measured_LRA={j["input_lra"]}'
      f':measured_thresh={j["input_thresh"]}:offset={j["target_offset"]}:linear=true')
os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
r = subprocess.run(args + ['-filter_complex', flt + f';[mix]{ln},alimiter=limit=0.70:level=disabled,aresample=48000[o]', '-map', '0:v', '-map', '[o]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', a.out], capture_output=True, text=True)
if r.returncode: sys.exit(r.stderr)
v = subprocess.run(['ffmpeg', '-hide_banner', '-i', a.out, '-af', f'loudnorm=I={a.lufs}:TP={a.tp}:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
k = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', v.stderr, re.S).group(0))
print(f'{a.out}  {dur:.2f}s  integrated {float(k["input_i"]):.1f} LUFS  true peak {float(k["input_tp"]):.1f} dBTP')
