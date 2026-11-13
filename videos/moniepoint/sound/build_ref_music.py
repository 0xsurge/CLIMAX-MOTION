# Build sound/ref_music.wav, the film's music bed, from the Demucs music stem of the user's reference film.
# The stem stays local (third-party music, not in git): demucs --two-stems=vocals -n htdemucs ref.wav -> no_vocals.wav
# Starts on the source downbeat START (skipping the quiet intro, so music plays from frame 0), splices once from
# downbeat A back to downbeat B (bar-aligned, 132 BPM, 1.818 s a bar) to fill 43 s, and fades the last second.
# usage (from videos/moniepoint): python3 sound/build_ref_music.py <no_vocals.wav>
import sys, wave, numpy as np
START, A, B, XF, DUR = 5.6, 27.41, 12.87, .03, 43.5
w = wave.open(sys.argv[1]); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, w.getnchannels()) / 32768
s, a, b, n = int(START * sr), int(A * sr), int(B * sr), int(XF * sr)
head, tail = x[s:a + n], x[b:]
r = np.linspace(0, 1, n)[:, None]; seam = head[-n:] * (1 - r) + tail[:n] * r
y = np.concatenate([head[:-n], seam, tail[n:]])
y = np.pad(y[:int(DUR * sr)], ((0, max(0, int(DUR * sr) - len(y))), (0, 0)))
y *= np.minimum(1, (len(y) - np.arange(len(y))) / sr)[:, None]
print(f'music from source {START} s at film 0; splice at film {A - START:.2f} s; source end lands at film {A - START + len(x) / sr - B:.2f} s')
with wave.open('sound/ref_music.wav', 'wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(sr); o.writeframes((np.clip(y, -1, 1) * 32767).astype('<i2').tobytes())
