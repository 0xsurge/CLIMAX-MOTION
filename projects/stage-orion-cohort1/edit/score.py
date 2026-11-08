"""Stage Orion Cohort 1.0 score + SFX, synthesized in code (house rule: no supplied track).

124 BPM, F minor. Every section restarts its bar at its own start so intros cut on the downbeat.
  hook      : low pad + sub pulse under the speaker
  logo      : reverse swell into an impact on the logo hit, drums enter
  intro_Qn  : full kit, pumping bass, 16th arp; ticks on words, wheel ticks, impact on land, whoosh on exit
  answers_* : soft bed (pad, bass, light hats), ducked under dialogue
  end       : last chord + impact, long tail
Writes hf/assets/media/music.wav and hf/assets/media/sfx.wav (48 kHz stereo) plus edit/beats.json.
"""
import json, numpy as np, soundfile as sf
from scipy.signal import fftconvolve, butter, sosfilt

SR = 48000
E = json.load(open('edit/edl.json'))
IT = json.load(open('edit/intro_timing.json'))
BPM = IT['bpm']; B = 60 / BPM
N = int(E['duration'] * SR) + SR
rng = np.random.default_rng(1)          # seeded: same score every run

music = np.zeros((N, 2)); sfx = np.zeros((N, 2))

def lp(x, f, o=2):  return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x, axis=0)
def hp(x, f, o=2):  return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)
def bp(x, lo, hi):  return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)
def env(n, a, d):   # attack/decay envelope (seconds)
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)); return e * np.exp(-t / max(d, 1e-4))
def put(buf, x, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= len(buf) or i + len(x) <= 0: return
    if x.ndim == 1: x = np.stack([x * (1 - pan) ** 0.5 * 1.0, x * (1 + pan) ** 0.5 * 1.0], 1) / 2 ** 0.5
    j = max(0, -i); x = x[j:]; i = max(i, 0); n = min(len(x), len(buf) - i); buf[i:i + n] += x[:n] * g
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def saw(f, n, det=0.0):
    t = np.arange(n) / SR; ph = (t * f * (1 + det)) % 1; return 2 * ph - 1

# ---- instruments ----
def kick(g=1.0):
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t / 0.035); ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.22); click = hp(rng.standard_normal(n) * np.exp(-t / 0.004), 2500) * 0.25
    return np.tanh((body + click) * 1.6) * g
def clap(g=1.0):
    n = int(0.25 * SR); x = np.zeros(n)
    for k, d in enumerate([0, 0.011, 0.022]):
        i = int(d * SR); m = n - i; x[i:] += rng.standard_normal(m) * env(m, 0.0005, 0.012 if k < 2 else 0.09)
    return bp(x, 900, 3200) * 1.4 * g
def hat(g=1.0, open_=False):
    n = int((0.18 if open_ else 0.05) * SR); return hp(rng.standard_normal(n) * env(n, 0.0005, 0.06 if open_ else 0.012), 7000) * g
def bass(m, dur, g=1.0):
    n = int(dur * SR); x = saw(hz(m), n) * 0.6 + np.sin(2 * np.pi * hz(m - 12) * np.arange(n) / SR) * 0.8
    return lp(x, 380) * env(n, 0.004, dur * 0.7) * g
def pad(notes, dur, g=1.0, cut=1400):
    n = int(dur * SR); x = np.zeros((n, 2))
    for m in notes:
        for d, p in ((-0.004, -0.6), (0.0, 0.0), (0.005, 0.6)):
            s = saw(hz(m), n, d); x[:, 0] += s * (1 - p) * 0.5; x[:, 1] += s * (1 + p) * 0.5
    t = np.arange(n) / SR; a = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.4).clip(0, 1)
    return lp(x, cut) * a[:, None] * g / len(notes)
def pluck(m, g=1.0):
    n = int(0.22 * SR); x = (saw(hz(m), n) + saw(hz(m), n, 0.006)) * 0.5
    return lp(x * env(n, 0.002, 0.07), 3200) * g

# F minor loop: Fm - Db - Ab - Eb, one chord per bar
CH = [[53, 56, 60, 65], [49, 53, 56, 61], [56, 60, 63, 68], [51, 55, 58, 63]]
ROOT = [41, 37, 44, 39]

def drums(t0, t1, level, full=True):
    beat = 0
    while t0 + beat * B < t1 - 0.02:
        t = t0 + beat * B
        put(music, kick(level), t)
        if full and beat % 2 == 1: put(music, clap(level * 0.55), t)
        for s in range(4):
            ts = t + s * B / 4
            if ts < t1 - 0.02 and (full or s == 2):
                put(music, hat(level * (0.35 if s % 2 else 0.18), open_=(s == 2 and not full)), ts, pan=0.3)
        beat += 1

def harmony(t0, t1, level, cut, arp=False, bassline=True):
    bar = 0
    while t0 + bar * 4 * B < t1 - 0.05:
        tb = t0 + bar * 4 * B; dur = min(4 * B, t1 - tb); c = bar % 4
        put(music, pad(CH[c], dur + 0.3, level, cut), tb)
        if bassline:
            for e in range(8):                       # off-beat 8ths, pumping
                te = tb + e * B / 2 + B / 4
                if te < t1 - 0.05: put(music, bass(ROOT[c], B / 2 * 0.9, level * 1.1), te)
        if arp:
            seq = [0, 2, 1, 3, 2, 1, 3, 2]
            for s in range(16):
                ts = tb + s * B / 4
                if ts < t1 - 0.05: put(music, pluck(CH[c][seq[s % 8]] + 12, level * 0.5), ts, pan=(-0.4 if s % 2 else 0.4))
        bar += 1

# ---- SFX (noise-based; three takes of each, rotated) ----
def whoosh(take, dur=0.5, g=1.0, rev=False):
    n = int(dur * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
    f0, f1 = [(500, 6000), (350, 4500), (700, 7500)][take % 3]
    fcs = np.geomspace(f0, f1, 7); out = np.zeros(n)       # sweep = moving weight across fixed bands
    pos = (t / dur) * (len(fcs) - 1)
    for j, fc in enumerate(fcs):
        band = bp(x, max(60, fc * 0.7), min(20000, fc * 1.4))
        out += band * np.exp(-0.5 * ((pos - j) / 0.8) ** 2)
    e = np.sin(np.pi * (t / dur)) ** 2 * (1 - 0.6 * t / dur)
    y = out * e * g
    return y[::-1] if rev else y
def impact(g=1.0):
    n = int(1.6 * SR); t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.5)
    crack = lp(rng.standard_normal(n) * np.exp(-t / 0.08), 5000) * 0.5
    return np.tanh((sub + crack) * 1.4) * g
def tick(take, g=1.0):
    n = int(0.03 * SR); return hp(rng.standard_normal(n) * env(n, 0.0003, 0.004), [3500, 4500, 5500][take % 3]) * g
def wheel_tick(g=1.0):
    n = int(0.05 * SR); t = np.arange(n) / SR
    return (bp(rng.standard_normal(n), 1800, 4200) * np.exp(-t / 0.006) + np.sin(2 * np.pi * 1200 * t) * np.exp(-t / 0.01) * 0.3) * g
def swell(dur=1.2, g=1.0):           # reversed noise swell (lead into a hit)
    n = int(dur * SR); t = np.arange(n) / SR
    return lp(rng.standard_normal(n), 3000) * (t / dur) ** 3 * g

# ---- arrange by section ----
sec = {s['kind']: s for s in E['sections']}
beats = []
for s in E['sections']:
    k, t0, t1 = s['kind'], s['start'], s['end']
    if k == 'answers_HOOK':
        harmony(t0, t1, 0.09, 700, bassline=False)
    elif k == 'logo':
        put(sfx, swell(1.0, 0.25), t0 - 1.0 + 0.05)
        put(sfx, impact(0.6), t0 + 1 / 30)
        drums(t0, t1, 0.8); harmony(t0, t1, 0.4, 2200, arp=True)
    elif k.startswith('intro_'):
        q = IT['questions'][k[-2:]]
        drums(t0, t1, 0.9); harmony(t0, t1, 0.42, 2600, arp=True)
        put(sfx, whoosh(int(k[-1]), 0.4, 0.35), t0 - 0.15)
        for i, wt in enumerate(q['word_times']): put(sfx, tick(i, 0.07), t0 + wt + 1 / 30, pan=(0.2 if i % 2 else -0.2))
        for wt in q['wheel_times'][:-1]: put(sfx, wheel_tick(0.12), t0 + wt + 1 / 30)
        put(sfx, impact(0.55), t0 + q['land'] + 1 / 30)
        put(sfx, whoosh(int(k[-1]) + 1, 0.45, 0.45), t0 + q['exit'] - 0.1)
        beats += [round(t0 + i * B, 4) for i in range(int((t1 - t0) / B) + 1)]
    elif k.startswith('answers_'):
        harmony(t0, t1, 0.065, 850); drums(t0, t1, 0.07, full=False)
    elif k == 'end':
        put(music, pad(CH[0], 4.5, 0.5, 2400), t0); put(music, bass(ROOT[0], 2.5, 0.8), t0)
        put(sfx, impact(0.6), t0 + 1 / 30)

# whoosh on each new speaker inside answer sections (rotated takes, quiet)
prev = None
for i, sg in enumerate(E['segments']):
    if sg['key'] != prev and prev is not None and sg['q'] == E['segments'][i - 1]['q']:
        put(sfx, whoosh(i, 0.28, 0.12), sg['t_in'] - 0.14)
    prev = sg['key']

# ---- glue: room reverb on music, sidechain under dialogue ----
ir_n = int(1.4 * SR); ir = rng.standard_normal((ir_n, 2)) * np.exp(-np.arange(ir_n) / SR / 0.35)[:, None]
ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum(0))
wet = np.stack([fftconvolve(music[:, c], ir[:, c])[:N] for c in range(2)], 1)
music = music * 0.85 + wet * 0.22
dlg, _ = sf.read('hf/assets/media/dialogue.wav'); d = np.zeros(N); d[:len(dlg)] = np.abs(dlg).mean(1)
w = int(0.05 * SR); de = np.convolve(d, np.ones(w) / w, 'same')
speaking = (de > 10 ** (-38 / 20)).astype(float)
k = int(0.25 * SR); speaking = np.convolve(speaking, np.ones(k) / k, 'same').clip(0, 1)
music *= (1 - 0.6 * speaking)[:, None]            # about -7 dB more under speech
# end fade
fe = sec['end']; i0 = int((fe['end'] - 1.8) * SR); i1 = int(fe['end'] * SR)
music[i0:i1] *= np.linspace(1, 0, i1 - i0)[:, None] ** 2; music[i1:] = 0; sfx[i1:] = 0
for buf, name, peak in ((music, 'music', -6.0), (sfx, 'sfx', -4.0)):
    buf[:] = np.tanh(buf / (10 ** (peak / 20))) * 10 ** (peak / 20)
    sf.write(f'hf/assets/media/{name}.wav', buf[:int(E['duration'] * SR)], SR, subtype='PCM_24')
json.dump(dict(bpm=BPM, beats=beats), open('edit/beats.json', 'w'))
print('music + sfx written', round(E['duration'], 2), 's')
