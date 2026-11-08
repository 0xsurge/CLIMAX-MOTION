"""Head-tracking virtual camera: face centre on the plate at 10 fps -> lagged follow offsets per shot (reset on cuts)."""
import json, cv2, numpy as np
E = json.load(open('edit/edl.json')); FPS = 10
det = cv2.FaceDetectorYN.create('.cache/yunet.onnx', '', (540, 960), 0.6)
cap = cv2.VideoCapture('hf/assets/media/plate.mp4'); total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
cx = np.full(int(E['duration'] * FPS) + 1, np.nan); cy = cx.copy()
for k in range(len(cx)):
    cap.set(cv2.CAP_PROP_POS_FRAMES, min(total - 1, round(k / FPS * 30))); ok, fr = cap.read()
    if not ok: continue
    _, f = det.detect(cv2.resize(fr, (540, 960)))
    if f is not None and len(f):
        r = f[np.argmax(f[:, 2] * f[:, 3])]; cx[k] = (r[0] + r[2] / 2) * 2; cy[k] = (r[1] + r[3] / 2) * 2
ox = np.zeros(len(cx)); oy = np.zeros(len(cx)); rot = np.zeros(len(cx))
for sg in E['segments']:
    a, b = int(np.ceil(sg['t_in'] * FPS)), int(sg['t_out'] * FPS)
    xs, ys = cx[a:b + 1].copy(), cy[a:b + 1].copy()
    if np.all(np.isnan(xs)): continue
    # fill gaps, then a lagging follow (the operator reacts ~0.3 s late)
    idx = np.arange(len(xs)); m = ~np.isnan(xs)
    xs = np.interp(idx, idx[m], xs[m]); ys = np.interp(idx, idx[m], ys[m])
    fx, fy = xs[0], ys[0]; px, py = [], []
    for x, y in zip(xs, ys):
        fx += (x - fx) * 0.28; fy += (y - fy) * 0.28; px.append(fx); py.append(fy)
    px, py = np.array(px), np.array(py)
    # the camera leans with the head: offset = how far the head has moved from where the shot began, amplified, minus the lag
    dx = (xs - xs[0]) * 0.55 - (px - xs[0]) * 0.25; dy = (ys - ys[0]) * 0.35 - (py - ys[0]) * 0.15
    ox[a:b + 1] = np.clip(-dx, -46, 46); oy[a:b + 1] = np.clip(-dy, -40, 40)
    vel = np.gradient(px); rot[a:b + 1] = np.clip(vel * 0.06, -1.2, 1.2)
json.dump(dict(fps=FPS, x=np.round(ox, 1).tolist(), y=np.round(oy, 1).tolist(), r=np.round(rot, 3).tolist()), open('edit/track.json', 'w'))
print('samples', len(cx), 'faces found', int(np.sum(~np.isnan(cx))), 'max |x|', round(float(np.abs(ox).max()), 1), 'mean |x|', round(float(np.abs(ox[ox != 0]).mean()), 1), 'max |rot|', round(float(np.abs(rot).max()), 2))
