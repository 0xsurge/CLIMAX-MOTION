"""Find each segment's face box on the plate (before punch-in) so captions can avoid it."""
import json, cv2, numpy as np
E = json.load(open('edit/edl.json'))
cap = cv2.VideoCapture('hf/assets/media/plate.mp4')
det = cv2.FaceDetectorYN.create('.cache/yunet.onnx', '', (1080, 1920), 0.6) if __import__('os').path.exists('.cache/yunet.onnx') else None
casc = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
out = []; miss = 0
for sg in E['segments']:
    boxes = []
    for t in (sg['t_in'] + 0.1, (sg['t_in'] + sg['t_out']) / 2, sg['t_out'] - 0.1):
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, fr = cap.read()
        if not ok: continue
        if det is not None:
            _, f = det.detect(fr)
            if f is not None and len(f): x, y, w, h = f[np.argmax(f[:, 2] * f[:, 3])][:4]; boxes.append((x, y, x + w, y + h))
        else:
            g = cv2.cvtColor(cv2.resize(fr, (540, 960)), cv2.COLOR_BGR2GRAY); g = cv2.equalizeHist(g)
            f = casc.detectMultiScale(g, 1.1, 5, minSize=(80, 80))
            if len(f): x, y, w, h = max(f, key=lambda r: r[2] * r[3]); boxes.append((x * 2, y * 2, (x + w) * 2, (y + h) * 2))
    if boxes:
        b = np.array(boxes); box = [float(b[:, 0].min()), float(b[:, 1].min()), float(b[:, 2].max()), float(b[:, 3].max())]
    else: box = None; miss += 1
    out.append(box)
json.dump(out, open('edit/faces.json', 'w'))
print('segments', len(out), 'no face found', miss)
