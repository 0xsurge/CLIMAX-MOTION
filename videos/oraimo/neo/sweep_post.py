# Luma colour sweep on the finished frames (launch-style 4a, climax-launch D5; done in 2D on the rendered video, never in
# WebGL, so tone mapping stays intact). At each dive cut the next scene floods in through its own brightness levels:
# its bright parts arrive first, painted by a moving oraimo ramp (blue-black, deep teal, forest, lime, acid yellow, white),
# the dark ground follows, then the wash relaxes into true colour. The outgoing frame keeps pushing in while it is replaced.
#   python3 sweep_post.py in.mp4 out.mp4
import sys, subprocess, numpy as np
W, H, FPS = 1920, 1080, 30
CUTS = [4.32, 15.32, 40.0]          # the dive cuts in film4 (camera keys with tau .001)
DUR = 1.25                         # length of each sweep
ramp = np.array([[.0, .0, .0], [.03, .2, .22], [.18, .66, .0], [.51, .90, .0], [.89, 1.0, .35], [1.0, 1.0, .92]])
def gmap(x):
    x = np.clip(x, 0, 1) * (len(ramp) - 1); i = np.floor(x).astype(int).clip(0, len(ramp) - 2); f = (x - i)[..., None]
    return ramp[i] * (1 - f) + ramp[i + 1] * f
def sm(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)
def push(img, k):                  # the held outgoing frame keeps diving: scale about the centre by k
    ys = ((np.arange(H) - H / 2) / k + H / 2).astype(int).clip(0, H - 1); xs = ((np.arange(W) - W / 2) / k + W / 2).astype(int).clip(0, W - 1)
    return img[ys][:, xs]
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', sys.argv[2]], stdin=subprocess.PIPE)
n = 0; held = {}
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    t = n / FPS + (float(sys.argv[3]) if len(sys.argv) > 3 else 0); out = None
    for c in CUTS:
        if c - 1.5 / FPS <= t < c - .5 / FPS: held[c] = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32) / 255
        if c <= t < c + DUR and c in held:
            p = (t - c) / DUR; B = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32) / 255
            A = push(held[c], 1 + .5 * p)
            LB = (B * [.2126, .7152, .0722]).sum(-1)
            th = sm(p / .75) * 1.4 - .2
            m = np.clip((th - (1 - LB) * .75) / .2, 0, 1)[..., None]     # bright parts of the new scene arrive first
            sh = .42 * np.sin(np.pi * min(1, p / .85))                     # the colour shifts up the ramp and comes back
            wash = gmap(LB + sh * (.25 + .75 * LB))                        # darks stay dark (a teal tint); brights go lime, acid, white
            rs = sm((p - .5) / .5)                                          # then relaxes into true colour
            o = A * (1 - m) + (wash * (1 - rs) + B * rs) * m
            out = (o.clip(0, 1) * 255).astype(np.uint8).tobytes()
    enc.stdin.write(out if out is not None else buf); n += 1
enc.stdin.close(); enc.wait(); print(sys.argv[2], n, 'frames')
