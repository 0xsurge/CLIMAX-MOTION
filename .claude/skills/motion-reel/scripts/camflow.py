#!/usr/bin/env python3
"""Measure the camera in a reference video: for each pair of frames, one similarity transform (pan x, tilt y, zoom,
roll) from tracked feature points with RANSAC, so animation inside the frame doesn't count as camera motion.
   python3 camflow.py video.mp4 out.json
Output rows: t, dx, dy (px/frame at source resolution), s (zoom factor/frame), rot (deg/frame), n (inliers), mag (mean abs diff)."""
import cv2, numpy as np, json, sys
cap = cv2.VideoCapture(sys.argv[1]); fps = cap.get(cv2.CAP_PROP_FPS)
W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)); H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)); k = W / 540
prev = None; rows = []
while True:
    ok, f = cap.read()
    if not ok: break
    g = cv2.cvtColor(cv2.resize(f, (540, int(H / k))), cv2.COLOR_BGR2GRAY)
    if prev is not None:
        r = dict(t=(len(rows) + 1) / fps, dx=0, dy=0, s=1, rot=0, n=0, mag=float(cv2.absdiff(prev, g).mean()))
        p0 = cv2.goodFeaturesToTrack(prev, 400, .01, 6)
        if p0 is not None and len(p0) > 12:
            p1, st, _ = cv2.calcOpticalFlowPyrLK(prev, g, p0, None, winSize=(21, 21), maxLevel=4)
            a, b = p0[st == 1], p1[st == 1]
            if len(a) > 12:
                M, inl = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=2)
                if M is not None:
                    c = np.array([270, H / k / 2]); cc = M[:, :2] @ c + M[:, 2] - c
                    r.update(dx=float(cc[0]) * k, dy=float(cc[1]) * k, s=float(np.hypot(M[0, 0], M[1, 0])),
                             rot=float(np.degrees(np.arctan2(M[1, 0], M[0, 0]))), n=int(inl.sum()))
        rows.append(r)
    prev = g
json.dump(dict(fps=fps, w=W, h=H, rows=rows), open(sys.argv[2], 'w')); print(len(rows), 'frames')
