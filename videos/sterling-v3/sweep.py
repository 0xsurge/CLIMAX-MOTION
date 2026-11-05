# Luma-keyed gradient-map sweep (the V4 "SaaS gradient" transition): the next shot floods in through its own
# brightness levels, painted with a moving gradient ramp, then resolves to true colour.
# python3 sweep.py A.png B.png out_prefix p1 p2 ...   (p in 0..1)
import sys, numpy as np
from PIL import Image
A = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(float) / 255
B = np.asarray(Image.open(sys.argv[2]).convert('RGB')).astype(float) / 255
ramp = np.array([[.10, .02, .22], [.42, .08, .55], [.95, .22, .12], [1, .62, .18], [.10, .80, .50], [.80, 1, .80]])  # violet -> red-orange -> amber -> emerald -> mint
def gmap(x):
    x = np.clip(x, 0, 1) * (len(ramp) - 1); i = np.floor(x).astype(int).clip(0, len(ramp) - 2); f = (x - i)[..., None]
    return ramp[i] * (1 - f) + ramp[i + 1] * f
LB = (B * [.2126, .7152, .0722]).sum(-1)
for p in map(float, sys.argv[4:]):
    th = p * 1.4 - .2                                     # brightness threshold sweeping up through the image
    m = np.clip((th - (1 - LB) * .75) / .2, 0, 1)[..., None]   # bright parts of B arrive first, the dark ground follows
    wash = gmap(LB * .9 + p * .55 - .05)                           # the colour ramp itself keeps moving
    resolve = np.clip((p - .55) / .45, 0, 1)                # the wash relaxes into true colour at the end
    newc = wash * (1 - resolve) + B * resolve
    out = A * (1 - m) + newc * m
    Image.fromarray((out.clip(0, 1) * 255).astype(np.uint8)).save(f'{sys.argv[3]}_{p:.2f}.png')
    print(p)
