# Sound for the product card: a slice of Track 1 (the user's pick) with a quick fade, and a soft motion layer from
# climax-launch/SOUND.md: a pop on each fragment landing and on the dot, ticks as the wordmark types, an air pass as the
# cluster flies in and collapses, a sub on the card landing, a soft click on every colour swap, a pop for Buy, a sub on the final dot.
import numpy as np, wave, subprocess
SR = 44100; DUR = 8.6; N = int((DUR + .5) * SR); TMP = '/tmp/claude-0/-home-user-CLIMAX-MOTION/ebd3c3d1-b9fc-58c3-8e73-03b9f49be28b/scratchpad/card_tmp.wav'
PACK = '../../obi-reel/sound/sfxpack/'; rng = np.random.default_rng(3); fx = np.zeros((N, 2))
def put(t0, s, g, pan=0.):
    i = int(max(0, t0) * SR); j = min(N, i + len(s)); fx[i:j, 0] += s[:j - i] * g * (1 - max(pan, 0)); fx[i:j, 1] += s[:j - i] * g * (1 + min(pan, 0))
def hp(x): return x - np.concatenate([[0], x[:-1]]) * .95
def click(f=2400, d=.006): n = int(.04 * SR); t = np.arange(n) / SR; return hp(rng.standard_normal(n)) * np.exp(-t / .003) * .6 + np.sin(2 * np.pi * f * t) * np.exp(-t / d) * .4
def pop(f0=850):
    n = int(.06 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-t * 28) + f0 * .4) / SR) * np.exp(-t / .014) * (1 - np.exp(-t / .001)) * .8
def sub(): n = int(.5 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(55 + 40 * np.exp(-t * 8.6)) / SR) * np.exp(-t / .14) * (1 - np.exp(-t / .002))
def load(p, af=None):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', p] + (['-af', af] if af else []) + ['-ar', '44100', '-ac', '1', TMP], check=True)
    w = wave.open(TMP); return np.frombuffer(w.readframes(w.getnframes()), '<i2') / 32768
air = load(PACK + 'sweep/sweep_18_mixkit2636.wav', 'lowpass=f=5200,highpass=f=180'); pk = int(np.argmax(np.abs(air)))
for t0 in (.25, .4, .55, .62): put(t0, pop(900 + 120 * rng.random()), .05, rng.uniform(-.3, .3))
put(.62, pop(780), .09)
for k in range(6): put(1.0 + k * .08, click(3200, .003), .05, -.3 + k * .12)
put(1.75 - pk / SR, air, .13, .2); put(2.42 - pk / SR, air, .1, -.1); put(2.55, sub(), .25)
for t0 in (3.75, 4.31, 4.85, 5.38, 5.92): put(t0 - .02, click(1900, .007), .14); put(t0, sub(), .08)
put(6.43 - pk / SR * .5, air, .07); put(6.97, pop(700), .1); put(7.5, sub(), .1); put(8.12, pop(820), .12); put(8.15, sub(), .22)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '73.2', '-t', str(DUR + .5), '-i', '../../moniepoint/sound/cand/760.mp3', '-af', f'afade=t=in:d=0.3,afade=t=out:st={DUR - 1.0}:d=1.0', '-ar', '44100', '-ac', '2', TMP], check=True)
w = wave.open(TMP); m = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2) / 32768
n = min(len(m), N); mix = fx.copy(); mix[:n] += m[:n] * .7; mix = mix[:int(DUR * SR)]; mix /= max(1e-9, np.abs(mix).max()) / .9
with wave.open('mix.wav', 'wb') as o: o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((mix * 32767).astype('<i2').tobytes())
print('mix.wav')
