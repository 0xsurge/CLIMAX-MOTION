"""Audio-vs-lips offset: inner-lip opening (MediaPipe landmarks 13/14) vs speech loudness, best lag within +/-10 frames.
Positive lag = picture LATE relative to voice; negative = picture EARLY."""
import sys, cv2, numpy as np, soundfile as sf, mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions
video, audio = sys.argv[1], sys.argv[2]; ranges = [tuple(map(float, r.split('-'))) for r in sys.argv[3:]]
lm = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(base_options=BaseOptions(model_asset_path='.cache/face_landmarker.task'), running_mode=vision.RunningMode.IMAGE, num_faces=1))
y, sr = sf.read(audio); y = y.mean(1) if y.ndim > 1 else y
cap = cv2.VideoCapture(video)
for a, b in ranges:
    cap.set(cv2.CAP_PROP_POS_FRAMES, round(a * 30)); op = []
    for k in range(int((b - a) * 30)):
        ok, fr = cap.read()
        if not ok: break
        small = cv2.resize(fr, (540, 960)); r = lm.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(small, cv2.COLOR_BGR2RGB)))
        if not r.face_landmarks: op.append(np.nan); continue
        L = r.face_landmarks[0]; fh = abs(L[152].y - L[10].y) + 1e-6
        op.append(abs(L[14].y - L[13].y) / fh)
    op = np.array(op); seg = y[int(a * sr):int(b * sr)]; hop = sr // 30
    env = np.array([np.sqrt(np.mean(seg[i:i + hop] ** 2)) for i in range(0, hop * len(op), hop)])[:len(op)]
    env = np.log(env + 1e-4); n = len(op); res = []
    for lag in range(-10, 11):
        mm, ee = (op[lag:], env[:n - lag]) if lag >= 0 else (op[:n + lag], env[-lag:])
        k = ~np.isnan(mm)
        if k.sum() > 30: res.append((np.corrcoef(mm[k], ee[k])[0, 1], lag))
    res.sort(reverse=True); c, l = res[0]
    print(f'{a:7.2f}-{b:7.2f}  lips vs voice: {l:+d} frames ({l * 1000 / 30:+.0f} ms)  corr {c:.2f}   2nd {res[1][1]:+d}:{res[1][0]:.2f}  faces {np.sum(~np.isnan(op))}/{n}')
