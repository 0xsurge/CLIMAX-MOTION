# Sterling v2 sound: Thunder (Mixkit) cut so its drop lands at 1.9 s, plus SFX synthesized in code on the beat grid.
import numpy as np, subprocess, wave, os
SR = 44100; P = 0.625653; D = 1.9; T = 31.3057
here = os.path.dirname(os.path.abspath(__file__)); A = lambda *p: os.path.join(here, *p)
rng = np.random.default_rng(7)
out = np.zeros((int(T * SR) + SR, 2))
def put(t, sig, g=1.0, pan=0.0):
    i = int(t * SR); s = sig[: len(out) - i] * g
    out[i:i + len(s), 0] += s * (1 - pan) ** .5 if pan > 0 else s
    out[i:i + len(s), 1] += s * (1 + pan) ** .5 if pan < 0 else s
def env(n, a, d): x = np.arange(n) / SR; return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)
def noise(n): return rng.standard_normal(n)
def lp(x, f):  # one-pole low-pass
    a = np.exp(-2 * np.pi * f / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
def boom(dur=1.2, f0=70, f1=38):
    n = int(dur * SR); x = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-x * 9)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .35) + lp(noise(n), 900) * env(n, .001, .03) * .8
def slam(dur=.35):
    n = int(dur * SR); x = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(110 * np.exp(-x * 20) + 55) / SR) * env(n, .001, .09)
    return body + lp(noise(n), 3000) * env(n, .0005, .025) * .7
def tick(): n = int(.03 * SR); return (noise(n) - lp(noise(n), 2500)) * env(n, .0002, .006)
def whoosh(dur=.5, up=True):
    n = int(dur * SR); x = np.linspace(0, 1, n); shape = np.sin(np.pi * (x ** (.6 if up else 1.6))) ** 2
    nz = noise(n); lo = lp(nz, 700); hi = nz - lp(nz, 2500); mix = lo * (1 - x) + hi * x if up else hi * (1 - x) + lo * x
    return mix * shape * .9
def click(): n = int(.06 * SR); x = np.arange(n) / SR; return np.sin(2 * np.pi * 1800 * x) * env(n, .0002, .008) + (noise(n) - lp(noise(n), 4000)) * env(n, .0002, .004)
def shimmer(dur=1.6, f=880):
    n = int(dur * SR); x = np.arange(n) / SR; e = np.sin(np.pi * np.minimum(1, x / dur)) ** 2
    return sum(np.sin(2 * np.pi * f * m * x + m) / m for m in (1, 1.5, 2, 3)) * e * .18
at = lambda b: b * P
put(D, boom(1.6), 1.0)                                                         # the drop: the white frame slams in
for i in range(9):                                                             # nine words, three lines
    put(D + [0, at(1), at(2)][i // 3] + (i % 3) * .12, slam(), .55, [-.3, 0, .3][i % 3])
put(D + at(3) - .3, whoosh(.55), .6); put(D + at(3.35), boom(.9, 60, 34), .55)  # the full stop floods green
C = D + at(4)
for i in range(5):                                                             # five stamps
    put(C + i * at(1.6) + .02, slam(.5), .9); put(C + i * at(1.6) + .02, boom(.5, 90, 50), .35)
put(C + 4 * at(1.6) + at(1.1) - .1, whoosh(.7), .8)                           # zoom through the check
AU = C + at(8); put(AU, boom(1.2, 55, 30), .5); put(AU + at(5.55) - .1, whoosh(.35, False), .8, .4)
ST = AU + at(6)
for j in range(5): put(ST + .05 + j * .08, slam(.25), .35)
for i in range(3):
    t0 = ST + at(2) + i * at(2); put(t0 - .15, whoosh(.4), .6, .5 if i % 2 == 0 else -.5); put(t0 + .3, slam(.4), .7)
put(ST + at(7.35), whoosh(.45, False), .7, .5)
CD = ST + at(8)
for k in range(54): put(CD + at(1.4) + k * .03, tick(), .35, ((k % 5) - 2) * .1)
OK = CD + at(6); put(OK, whoosh(.5, False), .5); put(OK + .3, slam(.5), .8); put(OK + .3, boom(.6, 80, 45), .4)
put(OK + at(3.4), whoosh(.4), .5)
LK = OK + at(4); put(LK + .05, slam(.4), .8); put(LK + at(1.4), click(), .5); put(LK + at(3), click(), .9)
put(LK + at(3.1), whoosh(.9), .5)
MR = LK + at(4)
for i in range(4): put(MR + at(1 + i * 1.5), shimmer(1.4, [660, 880, 990, 880][i]), .8, [-.4, 0, .4, 0][i])
pk = np.abs(out).max(); out = out / pk * .9
with wave.open(A('audio', 'sfx.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())
src = 20.19 - D
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{src}', '-t', f'{T}', '-i', A('assets', 'audio', 'thunder_src.mp3'),
                '-af', f'afade=t=out:st={T - 1.6}:d=1.6', '-ar', '44100', '-ac', '2', A('audio', 'music.wav')], check=True)
print('ok')
