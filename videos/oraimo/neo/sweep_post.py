# Luma gradient sweep on the finished frames (launch-style 4a, climax-launch D5), measured from the fridge moment of the
# user's reference (videos/reference/fridge-ref/b.mp4, 9.2-10.6 s and 29.9-31.0 s):
#  1. a glowing line of light rises from the floor to the top of the frame (about 0.6 s);
#  2. everything below it is gradient-mapped into a bright, high-key duotone by its own brightness (dark -> deep green,
#     mid -> lime, light -> pale acid/white), so the objects themselves take the colour, as the fridge turns pale blue;
#  3. under that light the camera cuts to the next scene, which arrives in the same duotone;
#  4. the new scene relaxes back into its true colours (about 0.8 s), as the fridge turns black again.
# Done in 2D on the rendered video, so the 3D lighting stays intact.
#   python3 sweep_post.py in.mp4 out.mp4 [time offset of in.mp4]
import sys, subprocess, numpy as np, cv2
W, H, FPS = 1920, 1080, 30
import os
CUTS = [float(x) for x in os.environ.get('CUTS', '4.32,15.32,40.0').split(',')]
RISE, SETTLE = 1.4, 1.6
ramp = np.array([[.03, .16, .02], [.10, .40, .02], [.36, .80, .02], [.62, .95, .18], [.88, 1.0, .55], [1.0, 1.0, .93]], np.float32)
def gmap(L):
    x = np.clip(L, 0, 1) * (len(ramp) - 1); i = np.floor(x).astype(np.int32).clip(0, len(ramp) - 2); f = (x - i)[..., None]
    return ramp[i] * (1 - f) + ramp[i + 1] * f
def sm(x): x = min(1., max(0., x)); return x * x * (3 - 2 * x)
off = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
Y = (np.arange(H, dtype=np.float32) / H)[:, None, None]          # 0 top .. 1 bottom
def duo(F, lift):
    L = (F * [.2126, .7152, .0722]).sum(-1)
    return gmap(L * .78 + .22 * lift)                             # lifted: even black reads as deep green light
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', sys.argv[2]], stdin=subprocess.PIPE)
n = 0
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    t = n / FPS + off; out = None
    for c in CUTS:
        if c - RISE <= t < c + SETTLE:
            F = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32) / 255
            if t < c:   # the line of light rises; below it the old scene is in the duotone
                u = sm((t - (c - RISE)) / RISE); edge = 1.08 - u * 1.25                     # from below the frame to above it
                below = np.clip((Y - edge) / .14 + .5, 0, 1)                             # soft boundary under the line
                D = duo(F, 1.0)
                o = F * (1 - below) + D * below
                line = np.exp(-((Y - edge) / .012) ** 2) * .9 + np.exp(-((Y - edge) / .09) ** 2) * .45
                o = o + line * np.array([.85, 1.0, .6], np.float32) * (1 - .3 * u)
            else:       # the new scene arrives in the duotone and relaxes into true colour, from the bottom up
                v = (t - c) / SETTLE; D = duo(F, 1 - .3 * v)
                rs = np.clip((sm(v) * 1.35 - (1 - Y) * .35) , 0, 1)                      # the floor settles first
                o = D * (1 - rs) + F * rs
            out = (np.clip(o, 0, 1) * 255).astype(np.uint8).tobytes()
    enc.stdin.write(out if out is not None else buf); n += 1
enc.stdin.close(); enc.wait(); print(sys.argv[2], n, 'frames')
