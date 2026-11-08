"""Colour grade: per-clip match (partial grey-world balance + exposure) then one film look, written as 3D LUTs (.cube) per clip & look."""
import json, glob, cv2, numpy as np, sys
LOOKS = ('clean', 'orion', 'warm')
N = 33
def srgb_to_lin(x): return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4)
def lin_to_srgb(x): x = np.clip(x, 0, 1); return np.where(x <= 0.0031308, x * 12.92, 1.055 * x ** (1 / 2.4) - 0.055)
def DET(w, h): return cv2.FaceDetectorYN.create('.cache/yunet.onnx', '', (w, h), 0.6)
def stats(clip):
    idx = json.load(open('edit/hq_index.json')); fr = []; skin = []
    for h in [h for h in idx if h['clip'] == clip]:
        cap = cv2.VideoCapture(h['file']); n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        for k in np.linspace(5, n - 5, 6).astype(int):
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(k)); ok, f = cap.read()
            if ok:
                sm = cv2.resize(f, (540, int(540 * f.shape[0] / f.shape[1])))
                _, fc = DET(sm.shape[1], sm.shape[0]).detect(sm)
                if fc is not None and len(fc):
                    x, y, w, h = fc[np.argmax(fc[:, 2] * fc[:, 3])][:4].astype(int)
                    skin.append(sm[max(0, y + h // 4):y + 3 * h // 4, max(0, x + w // 4):x + 3 * w // 4, ::-1].reshape(-1, 3) / 255.0)
                fr.append(cv2.resize(f, (270, 480))[:, :, ::-1] / 255.0)
    a = np.concatenate([f.reshape(-1, 3) for f in fr]); lum = a @ [0.2126, 0.7152, 0.0722]
    mid = a[(lum > 0.15) & (lum < 0.85)]
    sk = np.concatenate(skin) if skin else mid; skl = float(np.median(sk @ [0.2126, 0.7152, 0.0722]))
    return mid.mean(0), skl, float(np.percentile(lum, 2)), float(np.percentile(lum, 98))
def grade(rgb, st, look):
    mean, med, lo, hi = st
    lin = srgb_to_lin(rgb)
    # 1) match: 60% grey-world white balance, black/white points, exposure to a common middle
    g = (mean.mean() / mean) ** 0.6; lin = lin * g
    x = lin_to_srgb(lin)
    WP = max(min(1, hi + 0.02), 1 / 1.1); BP = min(lo * 0.7, 0.05)                   # gentle levels: at most +10% white gain, small black lift
    x = (x - BP) / (WP - BP)
    target = 0.40; cur = np.clip((med - BP) / (WP - BP), 0.05, 0.95)
    gam = np.log(target) / np.log(cur); gam = 1 + (gam - 1) * 0.6          # move 60% of the way: match, don't flatten
    x = np.clip(x, 0, 1) ** np.clip(gam, 0.8, 1.25)
    # 2) look
    l = x @ [0.2126, 0.7152, 0.0722]
    if look == 'clean':          # neutral, gentle S-curve, a little richer colour
        s = 0.5 + (x - 0.5) * 1.06; x = l[..., None] + (s - l[..., None]) * 1.08
    elif look == 'orion':        # brand: cool navy-teal shadows, warm skin highlights, punchier contrast
        sh = np.clip(1 - l / 0.45, 0, 1)[..., None]; hl = np.clip((l - 0.55) / 0.45, 0, 1)[..., None]
        x = x + sh * np.array([-0.035, 0.0, 0.05]) * 1.0 + hl * np.array([0.03, 0.012, -0.025])
        x = 0.5 + (x - 0.5) * 1.12; l2 = x @ [0.2126, 0.7152, 0.0722]; x = l2[..., None] + (x - l2[..., None]) * 1.05
    elif look == 'warm':         # soft film: warm mids, lifted blacks, gentle contrast
        x = x * np.array([1.04, 1.0, 0.93]); x = 0.035 + x * 0.95; x = 0.5 + (x - 0.5) * 1.03
    return np.clip(x, 0, 1)
def write_cube(path, st, look):
    r = np.linspace(0, 1, N); B, G, R = np.meshgrid(r, r, r, indexing='ij')
    grid = np.stack([R, G, B], -1).reshape(-1, 3); out = grade(grid, st, look)
    with open(path, 'w') as f:
        f.write(f'TITLE "stage-orion {look}"\nLUT_3D_SIZE {N}\n')
        for v in out: f.write(f'{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n')
if __name__ == '__main__':
    clips = sorted({h['clip'] for h in json.load(open('edit/hq_index.json'))} | {'03'})
    ST = {}
    for c in clips:
        ST[c] = stats(c)
        for lk in LOOKS: write_cube(f'grade/{c}_{lk}.cube', ST[c], lk)
        m, med, lo, hi = ST[c]; print(c, 'face luma', round(med, 3), 'black', round(lo, 3), 'white', round(hi, 3))
