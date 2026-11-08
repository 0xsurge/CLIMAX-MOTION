"""Generate the HyperFrames project (hf/) from edit/edl.json + edit/intro_timing.json.

Root (1080x1920, 30 fps)
  footage   : plate.mp4 inside a punch-in frame (scale steps on every cut, push on power words)
  captions  : word-timed subtitle groups; each answer's power word in a glowing blue box (Ref 1)
  logo      : Stage Orion mark + COHORT 1.0 badge after the cold-open hook
  q1..q3    : question intros (Ref 2, flipped dark): word build + crumbs, push, slot wheel + brackets, whip / dot-matrix exit
  endcard   : logo lockup
  audio     : dialogue.wav, music.wav, sfx.wav
"""
import json, html, re, os, shutil
E = json.load(open('edit/edl.json'))
IT = json.load(open('edit/intro_timing.json'))
OUT = 'hf'; os.makedirs(f'{OUT}/compositions', exist_ok=True); os.makedirs(f'{OUT}/assets', exist_ok=True)
shutil.copy('assets/logo-mark.svg', f'{OUT}/assets/logo-mark.svg')
D = E['duration']; FPS = 30
f = lambda x: f'{x:.4f}'.rstrip('0').rstrip('.')
sec = {s['kind']: s for s in E['sections']}

PAL = dict(navy='#01042A', navy2='#0E1347', indigo='#3736AE', blue='#001CD2', blue_hi='#2F4BFF', char='#171D1D', ink='#E0E2E8', sky='#7CC4FF')
GSAP = '<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>'
GROUND_CSS = f"""
  .ground {{ position:absolute; inset:0; background:{PAL['navy']};
    background-image: linear-gradient(rgba(224,226,232,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(224,226,232,.045) 1px, transparent 1px),
      radial-gradient(120% 70% at 50% 38%, {PAL['navy2']} 0%, {PAL['navy']} 70%);
    background-size: 72px 72px, 72px 72px, 100% 100%; }}"""

# ---------------- power words (one per answer; Ref 1 punch word) ----------------
POWER = {'HOOK': 'unique', '0': 'transformational', '1': 'insightful.', '2': 'eye-opening.', '3': 'amazing', '4': 'insightful,',
         '5': 'growth', '6': 'value-adding', '7': 'rewarding', '8': 'knowledge.', '9': 'enjoyed', '10': 'family',
         '11': 'intentional.', '12': 'ownership.', '13': 'empathy,', '14': 'support.', '15': 'changer.', '16': 'listening.',
         '17': 'difficult', '18': 'patience.', '19': 'empathy', '20': 'Freshdesk', '21': 'patience,', '22': 'accountability,',
         '23': 'start?', '24': 'network.', '25': 'bad.', '26': 'shook', '27': 'challenging.', '28': 'emojis', '29': 'waiting.',
         '30': 'cooperate', '31': 'nights.', '32': 'quickly', '33': 'family.', '34': 'best.', '35': 'memorable'}
PHRASE = {}

# ---------------- B-roll cutaways (client posters while the intern keeps talking) ----------------
BROLL = [('poster-1', '6', 'because there'), ('poster-3', '13', 'because as'), ('poster-5', '16', 'I learned'), ('poster-9', '17', 'handling'),
         ('poster-6', '19', 'to stay'), ('poster-8', '20', 'Freshdesk'), ('poster-4', '21', 'is the realization'), ('poster-2', '25', 'connect'),
         ('poster-7', '31', 'practical')]
WIDE = {'poster-2'}
cuts = []
for img, key, ph in BROLL:
    ws = [w for w in E['words'] if w['key'] == key]; a = ph.lower().split()
    i = next(i for i in range(len(ws)) if [x['text'].strip(',.').lower() for x in ws[i:i + len(a)]] == a)
    pend = max(sg_['t_out'] for sg_ in E['segments'] if sg_['key'] == key)
    t = round(ws[i]['start'] - 0.08, 3); d = round(min(3.0, pend - 0.7 - t), 3)
    cuts.append(dict(img=img, key=key, t=t, d=d))
KINETIC = [('0', 'and', [('AND', 'small'), ('FUN', 'hero'), ('EXPERIENCE.', 'mid')])]
kcards = []
for key, first, lines in KINETIC:
    ws = [w for w in E['words'] if w['key'] == key]; i = next(i for i, w in enumerate(ws) if w['text'].strip(',.').lower() == first)
    pend = max(sg_['t_out'] for sg_ in E['segments'] if sg_['key'] == key)
    kcards.append(dict(key=key, t=round(ws[i]['start'] - 0.1, 3), end=pend, words=[(txt, kind, ws[i + j]['start']) for j, (txt, kind) in enumerate(lines)]))
json.dump([[c['t'], c['d']] for c in cuts], open('edit/broll_times.json', 'w'))
json.dump([dict(t=k['t'], d=round(k['end'] - k['t'], 3), words=[w[2] for w in k['words']]) for k in kcards], open('edit/kinetic_times.json', 'w'))
bh, bj = [], []
for i, c in enumerate(cuts):
    bid = f'br{i}'; t, d = c['t'], c['d']; w = 1000 if c['img'] in WIDE else 900
    from PIL import Image as _I; iw, ih = _I.open(f"references/palette-posters/{c['img']}.jpg").size
    ch = 720 if c['img'] in WIDE else int(w * ih / iw); ctop = max(200, 860 - ch // 2)
    extra = ';height:720px;object-fit:cover;object-position:46% 40%' if c['img'] in WIDE else ''
    bh.append(f'''    <div id="{bid}" class="clip bro" data-start="{f(t)}" data-duration="{f(d)}" data-track-index="1">
      <div class="bground" id="{bid}g"><img class="bbg" src="assets/posters/{c['img']}.jpg" alt=""><div class="bshade"></div></div>
      <div class="bxp" id="{bid}x"></div>
      <img class="bcard" id="{bid}c" src="assets/posters/{c['img']}.jpg" alt="Stage Orion Cohort 1.0 poster" style="width:{w}px;left:{(1080 - w) // 2}px;top:{ctop}px{extra}"></div>''')
    bj += [f'tl.fromTo("#{bid}g",{{clipPath:"inset(0% 0% 0% 100%)"}},{{clipPath:"inset(0% 0% 0% 0%)",duration:0.28,ease:"power3.out"}},{f(t)});',
           f'tl.fromTo("#{bid}c",{{opacity:0,scale:1.18,y:70,filter:"blur(12px)"}},{{opacity:1,scale:1,y:0,filter:"blur(0px)",duration:0.45,ease:"expo.out"}},{f(t + 0.05)});',
           f'tl.fromTo("#{bid}x",{{opacity:0.6}},{{opacity:0,duration:0.18,ease:"power2.out"}},{f(t + 0.12)});',
           f'tl.to("#{bid}c",{{y:-24,duration:{f(d - 0.8)},ease:"none"}},{f(t + 0.5)});',
           f'tl.to("#{bid}c",{{y:-260,opacity:0,filter:"blur(10px)",duration:0.24,ease:"power3.in"}},{f(t + d - 0.26)});',
           f'tl.to("#{bid}g",{{clipPath:"inset(0% 100% 0% 0%)",duration:0.26,ease:"power3.in"}},{f(t + d - 0.27)});']
for n, k in enumerate(kcards):
    kid = f'kc{n}'; t, d = k['t'], round(k['end'] - k['t'], 3)
    spans = ''.join(f'<div class="kw kw-{kind}" id="{kid}w{j}">{html.escape(txt)}</div>' for j, (txt, kind, _) in enumerate(k['words']))
    bh.append(f'''    <div id="{kid}" class="clip bro" data-start="{f(t)}" data-duration="{f(d + 0.32)}" data-track-index="2">
      <div class="ground kground" id="{kid}g"></div><div class="kstack" id="{kid}s">{spans}</div></div>''')
    bj.append(f'tl.fromTo("#{kid}g",{{clipPath:"inset(0% 0% 0% 100%)"}},{{clipPath:"inset(0% 0% 0% 0%)",duration:0.2,ease:"power3.out"}},{f(t)});')
    for j, (txt, kind, wt) in enumerate(k['words']):
        bj.append(f'tl.fromTo("#{kid}w{j}",{{opacity:0,scale:1.25,filter:"blur(14px)"}},{{opacity:1,scale:1,filter:"blur(0px)",duration:0.14,ease:"expo.out"}},{f(max(t + 0.05, wt - 0.03))});')
    bj += [f'tl.to("#{kid}s",{{x:-1200,filter:"blur(16px)",duration:0.22,ease:"power3.in"}},{f(t + d - 0.12)});',
           f'tl.to("#{kid}g",{{x:-1180,duration:0.3,ease:"power3.in"}},{f(t + d)});']
broll = f'''<template>
  <style>
    #root {{ position:absolute; inset:0; pointer-events:none; }}
    .bro {{ position:absolute; inset:0; }}
    {GROUND_CSS}
    .kstack {{ position:absolute; left:0; right:0; top:640px; display:flex; flex-direction:column; align-items:center; gap:6px; }}
    .kw {{ font-family:"League Gothic", sans-serif; color:{PAL['ink']}; line-height:.95; letter-spacing:.01em; white-space:nowrap; }}
    .kw-small {{ font-family:Montserrat, sans-serif; font-weight:800; font-size:78px; letter-spacing:.3em; color:{PAL['sky']}; }}
    .kw-hero {{ font-size:430px; background:{PAL['blue']}; padding:0 50px; border-radius:10px; box-shadow:0 0 60px rgba(0,28,210,.8), 0 0 140px rgba(55,54,174,.55); }}
    .kw-mid {{ font-size:190px; }}
    .bground {{ position:absolute; inset:0; overflow:hidden; background:{PAL['navy']}; }}
    .bbg {{ position:absolute; left:-240px; top:-120px; width:1560px; height:2160px; object-fit:cover; filter:blur(40px) saturate(1.2); opacity:.55; }}
    .bxp {{ position:absolute; inset:0; background:#fff4e6; opacity:0; z-index:3; mix-blend-mode:plus-lighter; }}
    .bshade {{ position:absolute; inset:0; background:radial-gradient(90% 60% at 50% 42%, rgba(1,4,42,.15) 0%, rgba(1,4,42,.85) 100%); }}
    .bcard {{ position:absolute; border-radius:22px; box-shadow:0 30px 80px rgba(0,0,0,.55), 0 0 0 2px rgba(224,226,232,.12), 0 0 70px rgba(0,28,210,.45); }}
  </style>
  <div id="root" data-composition-id="broll" data-width="1080" data-height="1920" data-layout-allow-overflow data-layout-allow-overlap>
{chr(10).join(bh)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {chr(10).join('    ' + j for j in bj)}
    window.__timelines["broll"] = tl;
  </script>
</template>'''
open(f'{OUT}/compositions/broll.html', 'w').write(broll)

# ---------------- caption groups ----------------
words = E['words']
groups = []
for key in dict.fromkeys(w['key'] for w in words):
    ws = [w for w in words if w['key'] == key]
    pi = next((i for i, w in enumerate(ws) if w['text'] == POWER.get(key)), None)
    cur = []
    def flush(power=None):
        global cur
        if cur: groups.append(dict(key=key, words=cur, power=power)); cur = []
    for i, w in enumerate(ws):
        if cur:
            gap = w['start'] - cur[-1]['end']
            if gap >= 0.4 or len(cur) >= 4 or re.search(r'[.?!]$', cur[-1]['text']) or i == pi: flush()
        if i == pi:
            lead = cur; cur = []
            groups.append(dict(key=key, words=lead + [w], power=dict(index=len(lead), text=PHRASE.get(key, re.sub(r'[^\w\-’\']', '', w['text']).upper()))))
            continue
        cur.append(w)
    flush()
# fold a lead-in that was already flushed into the power group so it reads "lead-in + PUNCH"
groups = [g for g in groups if not any(k['key'] == g['key'] and g['words'][0]['start'] >= k['t'] for k in kcards)]
for g in groups:
    for k in kcards:
        if k['key'] == g['key'] and g['words'][-1]['start'] >= k['t']:
            g['words'] = [w for w in g['words'] if w['start'] < k['t']]; g['power'] = g['power'] if g['power'] and g['power']['index'] < len(g['words']) else None
groups = [g for g in groups if g['words']]
for g in groups: g['start'] = g['words'][0]['start']; g['end'] = g['words'][-1]['end']
for i, g in enumerate(groups):
    nxt = groups[i + 1]['start'] if i + 1 < len(groups) else D
    g['t0'] = max(0.1 if i == 0 else 0, g['start'] - 0.06, groups[i - 1]['t1'] if i else 0)
    g['t1'] = (nxt - 0.02) if nxt - g['end'] < 0.8 else min(max(g['end'] + 0.35, g['t0'] + (1.1 if g['power'] else 0.7)), nxt - 0.02)
    if g['power']: g['t1'] = max(g['t1'], g['words'][-1]['start'] + 0.42)   # box must finish landing before it leaves
    pick_end = max(sg_['t_out'] for sg_ in E['segments'] if sg_['key'] == g['key'])
    pick_end = min([pick_end] + [k['t'] + 0.06 for k in kcards if k['key'] == g['key']])   # captions leave as a type card arrives
    g['t1'] = min(g['t1'], pick_end - 0.03)

def est_w(txt, px, k=0.6): return len(txt) * px * k
FACES = json.load(open('edit/faces.json'))
CYC = [1.0, 1.13, 1.05, 1.19]
SEG_SCALE = []; _pk = None; _n = 0; _pn = 0
for sg_, fb in zip(E['segments'], FACES):
    if sg_['key'] != _pk: _n = 0; _pn += 1
    sc = (1.0 if _pn % 2 else 1.06) * CYC[_n % 4]
    if fb and fb[3] - fb[1] > 600: sc = min(sc, 1.08)        # already a tight close-up: punch gently
    SEG_SCALE.append(round(min(sc, 1.22), 3)); _pk = sg_['key']; _n += 1
def seg_at(t):
    for i_, sg_ in enumerate(E['segments']):
        if sg_['t_in'] - 0.05 <= t < sg_['t_out']: return i_
    return None
def cap_top(t, h):
    """Default: caption bottom at y=1330. If the speaker's chin would be covered, drop the caption just below the chin."""
    for c_ in cuts:                                             # during a poster cutaway: sit under the card
        if c_['t'] - 0.1 <= t < c_['t'] + c_['d']: return int(min(1790 - h, 1500))
    i_ = seg_at(t); top = 1330 - h
    if i_ is None or not FACES[i_]: return top
    sc = SEG_SCALE[i_]; oy = 0.38 * 1920; ty = (sc - 1) * 120
    chin = oy + (FACES[i_][3] + 0.12 * (FACES[i_][3] - FACES[i_][1]) - oy) * sc + ty
    if top < chin + 30: top = min(chin + 40, 1790 - h)
    return int(top)
cap_html, cap_js = [], []
for i, g in enumerate(groups):
    gid = f'cg{i}'; t0, t1 = g['t0'], g['t1']; dur = t1 - t0
    ws = g['words']; p = g['power']
    if p:
        lead = ws[:p['index']]; ptxt = p['text']
        fs = min(168, int(860 / (0.43 * max(4, len(ptxt)))))
        lead_txt = ' '.join(w['text'] for w in lead)
        lfs = 46 if est_w(lead_txt, 46) < 900 else int(900 / (len(lead_txt) * 0.6))
        lead_html = ''.join(f'<span class="w" id="{gid}w{j}">{html.escape(w["text"])}</span> ' for j, w in enumerate(lead))
        h = (int(lfs * 1.12) + 14 if lead else 0) + int(fs * 1.0) + 8
        cap_html.append(f'''    <div id="{gid}" class="clip cg pg" style="top:{cap_top(t0, h)}px" data-start="{f(t0)}" data-duration="{f(dur)}" data-track-index="1">
      <div class="gi" id="{gid}i"><div class="lead" style="font-size:{lfs}px">{lead_html}</div>
        <div class="pbox" id="{gid}b"><span class="pt" id="{gid}t" style="font-size:{fs}px">{html.escape(ptxt)}</span></div></div></div>''')
        for j, w in enumerate(lead):
            cap_js.append(f'tl.fromTo("#{gid}w{j}",{{opacity:0,filter:"blur(5px)"}},{{opacity:1,filter:"blur(0px)",duration:0.1,ease:"power2.out"}},{f(max(t0, w["start"] - 0.03))});')
        ps = ws[-1]['start']
        cap_js.append(f'tl.fromTo("#{gid}b",{{scaleX:0}},{{scaleX:1,duration:0.2,ease:"power4.out"}},{f(max(t0, ps - 0.08))});')
        cap_js.append(f'tl.fromTo("#{gid}t",{{opacity:0,scale:1.12,filter:"blur(8px)"}},{{opacity:1,scale:1,filter:"blur(0px)",duration:0.16,ease:"expo.out"}},{f(max(t0, ps - 0.02))});')
        cap_js.append(f'tl.to("#{gid}t",{{opacity:0,duration:0.08,ease:"power2.in"}},{f(t1 - 0.2)});')
        cap_js.append(f'tl.to("#{gid}b",{{scaleX:0,transformOrigin:"100% 50%",duration:0.12,ease:"power3.in"}},{f(t1 - 0.14)});')
        cap_js.append(f'tl.to("#{gid}i .lead",{{opacity:0,filter:"blur(6px)",duration:0.12,ease:"power2.in"}},{f(t1 - 0.14)});')
    else:
        txt = ' '.join(w['text'] for w in ws); fs = 56 if est_w(txt, 56) < 920 else max(40, int(920 / (len(txt) * 0.6)))
        inner = ''.join(f'<span class="w" id="{gid}w{j}">{html.escape(w["text"])}</span> ' for j, w in enumerate(ws))
        h = int(fs * 1.12 * (1 if est_w(txt, fs) < 920 else 2))
        cap_html.append(f'''    <div id="{gid}" class="clip cg" style="top:{cap_top(t0, h)}px" data-start="{f(t0)}" data-duration="{f(dur)}" data-track-index="1">
      <div class="gi" id="{gid}i"><div class="sub" style="font-size:{fs}px">{inner}</div></div></div>''')
        for j, w in enumerate(ws):
            cap_js.append(f'tl.fromTo("#{gid}w{j}",{{opacity:0.0,filter:"blur(5px)"}},{{opacity:1,filter:"blur(0px)",duration:0.09,ease:"power2.out"}},{f(max(t0, w["start"] - 0.03))});')
        nxt0 = groups[i + 1]['t0'] if i + 1 < len(groups) else D
        if nxt0 - t1 > 0.3: cap_js.append(f'tl.to("#{gid}i",{{opacity:0,filter:"blur(6px)",duration:0.12,ease:"power2.in"}},{f(t1 - 0.13)});')

captions = f'''<template>
  <style>
    #root {{ position:absolute; inset:0; pointer-events:none; }}
    .cg {{ position:absolute; left:0; right:0; text-align:center; overflow:visible; }}
    .gi {{ display:flex; flex-direction:column; align-items:center; gap:14px; padding:0 70px; }}
    .sub, .lead {{ font-family:Montserrat, sans-serif; font-weight:800; color:{PAL['ink']}; line-height:1.12; letter-spacing:-0.01em;
      text-shadow: 2px 2px 0 {PAL['navy']}, -2px 2px 0 {PAL['navy']}, 2px -2px 0 {PAL['navy']}, -2px -2px 0 {PAL['navy']}, 0 3px 0 {PAL['navy']}, 0 -3px 0 {PAL['navy']}, 3px 0 0 {PAL['navy']}, -3px 0 0 {PAL['navy']}, 0 6px 18px rgba(1,4,42,.65); max-width:940px; }}
    .lead {{ font-weight:700; opacity:.92; }}
    .w {{ display:inline-block; }}
    .pbox {{ background:{PAL['blue']}; padding:6px 30px 2px; border-radius:6px; transform-origin:0% 50%;
      box-shadow: 0 0 0 2px rgba(47,75,255,.55), 0 0 38px rgba(0,28,210,.85), 0 0 110px rgba(55,54,174,.55); }}
    .pt {{ display:inline-block; font-family:"League Gothic", sans-serif; color:{PAL['ink']}; line-height:1.0; letter-spacing:.01em; white-space:nowrap; }}
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920" data-layout-allow-overflow>
{chr(10).join(cap_html)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {chr(10).join('    ' + j for j in cap_js)}
    window.__timelines["captions"] = tl;
  </script>
</template>'''
open(f'{OUT}/compositions/captions.html', 'w').write(captions)

# ---------------- Ref 3 transitions: flash cuts, block peeks, exposure pops ----------------
import random as _r
_rng = _r.Random(7)
SEGS = E['segments']; FX = []
kin_starts = {k['key'] for k in kcards}
kinds = ['flash', 'blocks', 'zoom', 'pop']; kc = 0; jc = 0
for i_ in range(1, len(SEGS)):
    a_, b_ = SEGS[i_ - 1], SEGS[i_]
    if b_['q'] == 'HOOK' or b_['q'] != a_['q']: continue
    t = b_['t_in']
    if any(c_['t'] - 0.4 <= t <= c_['t'] + c_['d'] + 0.4 for c_ in cuts): continue          # poster cutaway owns this moment
    if b_['key'] != a_['key']:
        if a_['key'] in kin_starts: continue                                                # the type card already whips out here
        FX.append(dict(t=t, kind=kinds[kc % 4], seg=i_)); kc += 1
    elif b_['jump']:
        if jc % 3 == 0: FX.append(dict(t=t, kind='mini', seg=i_))
        jc += 1
FX = [e for k_, e in enumerate(FX) if k_ == 0 or e['t'] - FX[k_ - 1]['t'] > 0.35]
json.dump([dict(t=e['t'], kind=e['kind']) for e in FX], open('edit/fx_events.json', 'w'))

# ---------------- footage (punch-ins) ----------------
fj = []
for sg, sc in zip(E['segments'], SEG_SCALE):
    fj.append(f'tl.set("#frame",{{scale:{sc},y:{round((sc - 1) * 120, 1)},x:0}},{f(sg["t_in"])});')
# whip-in at the start of each answer block after a whip exit; smooth push on each power word
for q in ('Q1', 'Q2'):
    t = sec[f'answers_{q}']['start']
    fj.append(f'tl.fromTo("#frame",{{x:260}},{{x:0,duration:0.38,ease:"expo.out"}},{f(t)});')
# the camera never sits still: slow push across every shot
for sg in SEGS:
    fj.append(f'tl.fromTo("#push",{{scale:1}},{{scale:1.035,duration:{f(sg["t_out"] - sg["t_in"])},ease:"none"}},{f(sg["t_in"])});')
peek_html = []
for n_, e in enumerate(FX):
    t = e['t']
    if e['kind'] == 'flash':      # outgoing blows out, one white frame, incoming lands hot and settles
        fj += [f'tl.fromTo("#xp",{{opacity:0}},{{opacity:0.52,duration:0.07,ease:"power2.in"}},{f(t - 0.07)});',
               f'tl.to("#xp",{{opacity:0,duration:0.12,ease:"power2.out"}},{f(t + 0.034)});',
               f'tl.fromTo("#frame",{{x:14}},{{x:0,duration:0.18,ease:"expo.out"}},{f(t)});']
    elif e['kind'] == 'pop':      # hard cut, then a one-frame pop that decays
        fj += [f'tl.fromTo("#xp",{{opacity:0.55}},{{opacity:0,duration:0.1,ease:"power2.out"}},{f(t + 0.034)});',
               f'tl.fromTo("#frame",{{y:"+=10"}},{{y:"-=10",duration:0.14,ease:"expo.out"}},{f(t)});']
    elif e['kind'] == 'zoom':     # outgoing rushes in and blows out, incoming lands zoomed and pulls back
        fj += [f'tl.fromTo("#zoom",{{scale:1,filter:"blur(0px)"}},{{scale:1.24,filter:"blur(6px)",duration:0.13,ease:"power3.in"}},{f(t - 0.13)});',
               f'tl.fromTo("#zoom",{{scale:1.18,filter:"blur(6px)"}},{{scale:1,filter:"blur(0px)",duration:0.24,ease:"expo.out"}},{f(t)});',
               f'tl.fromTo("#xp",{{opacity:0}},{{opacity:0.42,duration:0.06,ease:"power2.in"}},{f(t - 0.06)});',
               f'tl.to("#xp",{{opacity:0,duration:0.18,ease:"power2.out"}},{f(t + 0.034)});']
    elif e['kind'] == 'mini':     # soft exposure lift on a punch-in
        fj += [f'tl.fromTo("#xp",{{opacity:0.2}},{{opacity:0,duration:0.09,ease:"power2.out"}},{f(t)});']
    elif e['kind'] == 'blocks':   # rectangles of the next shot break into this one, then the cut lands
        pid = f'pk{n_}'; d_ = 0.16
        peek_html.append(f'<div class="peekw" id="{pid}w"><video id="{pid}" class="clip peek" src="assets/media/plate.mp4" muted playsinline data-start="{f(t - d_)}" data-duration="{f(d_)}" data-media-start="{f(t)}" data-track-index="2"></video></div>')
        steps = 4; rects = []
        for st in range(steps):
            k = 2 + st; cur = []
            for b in range(5):
                if b < k:
                    w = _rng.randint(70, 140) + st * 45; h = _rng.randint(50, 110) + st * 40
                    x = _rng.randint(40, 1080 - w - 40); y = _rng.randint(260, 1500)
                    cur.append((w, h, x, y))
                else: cur.append((0, 0, 0, 0))
            props = ','.join(f'"--s{b}":"{w}px {h}px","--p{b}":"{x}px {y}px"' for b, (w, h, x, y) in enumerate(cur))
            fj.append(f'tl.set("#{pid}w",{{{props}}},{f(t - d_ + st * d_ / steps)});')
        fj += [f'tl.fromTo("#xp",{{opacity:0.4}},{{opacity:0,duration:0.09,ease:"power2.out"}},{f(t)});',
               f'tl.fromTo("#frame",{{x:-10}},{{x:0,duration:0.16,ease:"expo.out"}},{f(t)});']
for g in groups:
    if g['power']:
        ps = g['words'][-1]['start']
        segs = [s_ for s_ in E['segments'] if s_['t_in'] <= ps < s_['t_out']]
        if segs and segs[0]['t_out'] - ps > 0.5:
            fj.append(f'tl.to("#frame",{{scale:"+=0.05",duration:0.35,ease:"expo.out"}},{f(ps - 0.02)});')
TRACK_JSON = open('edit/track.json').read() if os.path.exists('edit/track.json') else '{"fps":10,"x":[0,0],"y":[0,0],"r":[0,0]}'
footer_unused = None
footage = f'''<template>
  <style>
    #root {{ position:absolute; inset:0; overflow:hidden; background:{PAL['navy']}; }}
    #frame {{ position:absolute; inset:0; transform-origin:50% 38%; }}
    #push {{ position:absolute; inset:0; transform-origin:50% 40%; }}
    #zoom {{ position:absolute; inset:0; transform-origin:50% 42%; }}
    #track {{ position:absolute; inset:0; transform-origin:50% 40%; }}
    #plate {{ position:absolute; left:0; top:0; width:1080px; height:1920px; object-fit:cover; }}
    #xp {{ position:absolute; inset:0; background:#fff7ec; mix-blend-mode:plus-lighter; opacity:0; pointer-events:none; }}
    .peekw {{ position:absolute; inset:0; -webkit-mask-image:{",".join(["linear-gradient(#000,#000)"] * 5)}; mask-image:{",".join(["linear-gradient(#000,#000)"] * 5)};
      -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat;
      -webkit-mask-size:var(--s0,0 0),var(--s1,0 0),var(--s2,0 0),var(--s3,0 0),var(--s4,0 0); mask-size:var(--s0,0 0),var(--s1,0 0),var(--s2,0 0),var(--s3,0 0),var(--s4,0 0);
      -webkit-mask-position:var(--p0,0 0),var(--p1,0 0),var(--p2,0 0),var(--p3,0 0),var(--p4,0 0); mask-position:var(--p0,0 0),var(--p1,0 0),var(--p2,0 0),var(--p3,0 0),var(--p4,0 0); }}
    .peek {{ position:absolute; left:0; top:0; width:1080px; height:1920px; object-fit:cover; }}
  </style>
  <div id="root" data-composition-id="footage" data-width="1080" data-height="1920">
    <div id="frame" data-layout-allow-overflow><div id="zoom"><div id="track"><div id="push"><video id="plate" class="clip" src="assets/media/plate.mp4" muted playsinline data-start="0" data-duration="{f(D)}" data-track-index="0"></video></div></div></div></div>
    {chr(10).join('    ' + h_ for h_ in peek_html)}
    <div id="xp"></div>
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    tl.set("#frame",{{scale:1,x:0,y:0}},0); tl.set("#xp",{{opacity:0}},0);
    {chr(10).join('    ' + j for j in fj)}
    // head-tracking camera: follows each speaker's head with a slight lag (edit/track.json, 10 samples/s)
    const TR = {TRACK_JSON};
    const cam = {{ t: 0 }};
    const at = (arr, t) => {{ const k = t * TR.fps, i = Math.max(0, Math.min(arr.length - 2, Math.floor(k))), u = Math.min(1, Math.max(0, k - i)); return arr[i] + (arr[i + 1] - arr[i]) * u; }};
    tl.fromTo(cam, {{ t: 0 }}, {{ t: {f(D)}, duration: {f(D)}, ease: "none", onUpdate: () => {{
      gsap.set("#track", {{ x: Math.max(-26, Math.min(26, at(TR.x, cam.t))), y: Math.max(-24, Math.min(24, at(TR.y, cam.t))), rotation: Math.max(-0.5, Math.min(0.5, at(TR.r, cam.t))), scale: 1.06 }});
    }} }}, 0);
    window.__timelines["footage"] = tl;
  </script>
</template>'''
open(f'{OUT}/compositions/footage.html', 'w').write(footage)

# ---------------- question intros ----------------
def intro(qk):
    q = IT['questions'][qk]; cid = qk.lower(); words_ = q['text'].split()
    key_i = next(i for i, w in enumerate(words_) if re.sub(r'\W', '', w).lower() == q['key'])
    spans = ''.join(f'<span class="qw{" kw" if i == key_i else ""}" id="{cid}w{i}">{html.escape(w)}</span> ' for i, w in enumerate(words_))
    wheel = ''.join(f'<div class="ww" id="{cid}r{i}"><span class="wt" id="{cid}t{i}">{html.escape(w)}</span></div>' for i, w in enumerate(q['wheel']))
    host_len = q['out'] + 0.5
    return host_len, f'''<template>
  <style>
    #root {{ position:absolute; inset:0; overflow:hidden; }}
    {GROUND_CSS}
    #{cid}-content {{ position:absolute; inset:0; }}
    .lbl {{ position:absolute; left:0; right:0; top:470px; text-align:center; font-family:Montserrat, sans-serif; font-weight:700; font-size:30px;
      letter-spacing:.34em; color:{PAL['sky']}; }}
    .sent {{ position:absolute; left:90px; top:560px; width:900px; height:700px; font-family:Montserrat, sans-serif; font-weight:800; font-size:76px; line-height:1.1;
      letter-spacing:-0.02em; color:{PAL['ink']}; }}
    .qw {{ position:absolute; left:0; top:0; white-space:nowrap; }}
    .kw {{ color:{PAL['blue_hi']}; }}
    .small {{ position:absolute; left:110px; right:110px; top:330px; text-align:center; font-family:Montserrat, sans-serif; font-weight:600; font-size:36px;
      line-height:1.25; color:{PAL['ink']}; opacity:.78; }}
    .wheel {{ position:absolute; left:0; right:0; top:800px; height:250px; overflow:hidden; }}
    .wcol {{ position:absolute; left:0; right:0; top:0; }}
    .wt {{ display:inline-block; }}
    .ww {{ height:250px; line-height:262px; text-align:center; font-family:"League Gothic", sans-serif; font-size:236px; color:{PAL['ink']}; letter-spacing:.01em; white-space:nowrap; }}
    .br {{ position:absolute; width:64px; height:64px; border-color:{PAL['blue_hi']}; border-style:solid; border-width:0; filter: drop-shadow(0 0 10px rgba(0,28,210,.9)); }}
    .crumb {{ position:absolute; font-family:"Space Mono", monospace; font-weight:700; font-size:40px; color:{PAL['sky']}; }}
    #{cid}-dots {{ position:absolute; inset:0; }}
    .xp {{ position:absolute; inset:0; background:#dfe6ff; mix-blend-mode:plus-lighter; opacity:0; pointer-events:none; z-index:5; }}
  </style>
  <div id="root" data-composition-id="{cid}" data-width="1080" data-height="1920" data-layout-allow-overflow data-layout-allow-overlap>
    <div class="ground" id="{cid}-ground"></div>
    <div class="xp" id="{cid}-xp"></div>
    <canvas id="{cid}-dots" width="1080" height="1920"></canvas>
    <div id="{cid}-content">
      <div class="lbl" id="{cid}-lbl">{q['label']}</div>
      <div class="sent" id="{cid}-sent">{spans}</div>
      <div class="small" id="{cid}-small">{html.escape(q['text'])}</div>
      <div class="wheel" id="{cid}-wheel"><div class="wcol" id="{cid}-wcol">{wheel}</div></div>
      <div class="br" id="{cid}-b0" style="border-top-width:8px;border-left-width:8px"></div>
      <div class="br" id="{cid}-b1" style="border-top-width:8px;border-right-width:8px"></div>
      <div class="br" id="{cid}-b2" style="border-bottom-width:8px;border-left-width:8px"></div>
      <div class="br" id="{cid}-b3" style="border-bottom-width:8px;border-right-width:8px"></div>
      <div id="{cid}-crumbs"></div>
    </div>
  </div>
  <script>
  (function() {{
    const Q = {json.dumps(dict(word_times=q['word_times'], push=q['push'], wheel_times=q['wheel_times'], land=q['land'], exit=q['exit'], out=q['out'], exit_kind=q['exit_kind'], key=key_i, n=len(words_), nw=len(q['wheel'])))};
    const C = "{cid}";
    function mulberry32(a){{return function(){{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}}}
    const rnd = mulberry32({ {'q1': 11, 'q2': 22, 'q3': 33}[cid] });
    function build() {{
      const tl = gsap.timeline({{ paused: true }});
      const $ = s => document.querySelector(s);
      const root = $("#" + C + "-content");
      // lay the sentence out from font metrics (scenes are hidden until they start, so DOM boxes read 0)
      const cv0 = document.createElement("canvas").getContext("2d");
      const FS = 76, LS = -0.02 * FS, LH = FS * 1.1, MAXW = 900, SX = 90, SY = 560;
      cv0.font = "800 " + FS + "px Montserrat";
      const mw = t => cv0.measureText(t).width + LS * t.length;
      const space = cv0.measureText(" ").width + LS;
      const P = []; let x = 0, y = 0;
      for (let i = 0; i < Q.n; i++) {{
        const el = $("#" + C + "w" + i), w = mw(el.textContent);
        if (x > 0 && x + w > MAXW) {{ x = 0; y += LH; }}
        P.push({{ x: x, y: y, w: w }}); el.style.left = x + "px"; el.style.top = y + "px"; x += w + space;
      }}
      const SH = y + LH, ST = Math.round(880 - SH / 2);
      $("#" + C + "-sent").style.top = ST + "px"; $("#" + C + "-lbl").style.top = (ST - 92) + "px";
      for (const p_ of P) p_.top = ST;
      // ground drifts slowly the whole scene (the world behind moves, titles stay still)
      tl.fromTo("#" + C + "-ground", {{ backgroundPosition: "0px 0px, 0px 0px, 0 0" }}, {{ backgroundPosition: "0px 144px, 72px 0px, 0 0", duration: Q.out, ease: "none" }}, 0);
      tl.fromTo("#" + C + "-lbl", {{ opacity: 0, filter: "blur(8px)" }}, {{ opacity: 1, filter: "blur(0px)", duration: 0.16, ease: "power4.out" }}, 0.04);
      // word build: blur-in, no translate; crumbs fly off every other word
      const crumbs = $("#" + C + "-crumbs"); const glyphs = ["/", "*", "0", "1", "+", "/", "·"];
      for (let i = 0; i < Q.n; i++) {{
        const el = $("#" + C + "w" + i); const t = Q.word_times[i];
        tl.fromTo(el, {{ opacity: 0, filter: "blur(10px)" }}, {{ opacity: 1, filter: "blur(0px)", duration: 0.13, ease: "power4.out" }}, t);
        if (i % 2 === 0) {{
          const r = {{ left: SX + P[i].x, top: P[i].top + P[i].y, width: P[i].w, height: LH }}, rr = {{ left: 0, top: 0 }};
          for (let k = 0; k < 2; k++) {{
            const c = document.createElement("span"); c.className = "crumb"; c.textContent = glyphs[Math.floor(rnd() * glyphs.length)];
            c.style.left = (r.left - rr.left + r.width * (0.2 + rnd() * 0.6)) + "px"; c.style.top = (r.top - rr.top + r.height * 0.3) + "px"; crumbs.appendChild(c);
            const dx = (rnd() - 0.5) * 360, dy = -40 - rnd() * 200, rot = (rnd() - 0.5) * 220;
            tl.fromTo(c, {{ opacity: 0, x: 0, y: 0, rotation: 0, scale: 0.6 }}, {{ opacity: 1, scale: 1, duration: 0.06, ease: "none" }}, t + 0.02);
            tl.to(c, {{ x: dx, y: dy, rotation: rot, duration: 0.55, ease: "expo.out" }}, t + 0.02);
            tl.to(c, {{ opacity: 0, filter: "blur(4px)", duration: 0.25, ease: "power2.in" }}, t + 0.32);
          }}
        }}
      }}
      // camera push: zoom through the key word
      const K = P[Q.key];
      tl.set("#" + C + "-sent", {{ transformOrigin: (K.x + K.w / 2).toFixed(1) + "px " + (K.y + LH / 2).toFixed(1) + "px" }}, 0);
      tl.fromTo("#" + C + "-sent", {{ scale: 1, filter: "blur(0px)", opacity: 1 }}, {{ scale: 3.2, filter: "blur(14px)", opacity: 0, duration: Q.push[1] - Q.push[0], ease: "power3.in" }}, Q.push[0]);
      tl.fromTo("#" + C + "-lbl", {{ y: 0 }}, {{ y: -120, opacity: 0, duration: 0.3, ease: "power3.in" }}, Q.push[0]);
      tl.fromTo("#" + C + "-small", {{ opacity: 0, filter: "blur(8px)" }}, {{ opacity: 0.78, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }}, Q.push[1] - 0.05);
      // slot wheel: one roll per wheel time, last roll lands on the downbeat
      const H = 250;
      tl.fromTo("#" + C + "-wheel", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.08, ease: "none" }}, Q.wheel_times[0] - 0.12);
      tl.set("#" + C + "-wcol", {{ y: 0 }}, 0);
      for (let i = 1; i < Q.nw; i++) {{
        const last = i === Q.nw - 1, t0 = Q.wheel_times[i - 1];
        tl.to("#" + C + "-wcol", {{ y: -i * H, duration: last ? (Q.land - t0) : 0.09, ease: last ? "expo.out" : "power2.inOut" }}, t0);
        tl.fromTo("#" + C + "-wcol", {{ filter: "blur(6px)" }}, {{ filter: last ? "blur(0px)" : "blur(3px)", duration: last ? (Q.land - t0) : 0.09, ease: "power2.out" }}, t0);
      }}
      // corner brackets snap tight around the landed word
      cv0.font = "236px 'League Gothic'"; const lt = $("#" + C + "t" + (Q.nw - 1)).textContent;
      const ww = cv0.measureText(lt).width + 0.01 * 236 * lt.length;
      const cx = 540, top = 800 + 18, bot = 800 + 250 - 6, hw = ww / 2 + 46;
      const pos = [[cx - hw, top], [cx + hw - 64, top], [cx - hw, bot - 64], [cx + hw - 64, bot - 64]]; const out = [[-60, -40], [60, -40], [-60, 40], [60, 40]];
      for (let b = 0; b < 4; b++) {{
        tl.set("#" + C + "-b" + b, {{ left: pos[b][0], top: pos[b][1] }}, 0);
        tl.fromTo("#" + C + "-b" + b, {{ opacity: 0, x: out[b][0], y: out[b][1] }}, {{ opacity: 1, x: 0, y: 0, duration: 0.22, ease: "expo.out" }}, Q.land - 0.02);
      }}
      tl.fromTo("#" + C + "r" + (Q.nw - 1), {{ color: "{PAL['ink']}" }}, {{ color: "#FFFFFF", duration: 0.1 }}, Q.land);
      tl.fromTo("#" + C + "-xp", {{ opacity: 0.7 }}, {{ opacity: 0, duration: 0.2, ease: "power2.out" }}, Q.land + 0.034);
      tl.fromTo("#" + C + "-content", {{ y: 14 }}, {{ y: 0, duration: 0.18, ease: "expo.out" }}, Q.land);
      // exit
      if (Q.exit_kind === "whip") {{
        tl.to("#" + C + "-content", {{ x: -1300, filter: "blur(18px)", duration: 0.3, ease: "power3.in" }}, Q.exit);
        tl.to("#" + C + "-ground", {{ x: -1180, duration: 0.42, ease: "power3.in" }}, Q.out - 0.08);
      }} else {{
        tl.to("#" + C + "-content", {{ opacity: 0, filter: "blur(12px)", scale: 1.08, duration: 0.28, ease: "power3.in" }}, Q.exit);
        // dot-matrix dissolve: a navy dot grid replaces the ground, then every dot shrinks to nothing on a diagonal stagger
        const cv = $("#" + C + "-dots"), ctx = cv.getContext("2d"), st = {{ p: 0 }};
        const draw = () => {{
          ctx.clearRect(0, 0, 1080, 1920); const g = 36; ctx.fillStyle = "{PAL['navy']}";
          for (let y = 0; y < 1920 + g; y += g) for (let x = 0; x < 1080 + g; x += g) {{
            const d = (x / 1080) * 0.45 + (1 - y / 1920) * 0.55; const k = Math.min(1, Math.max(0, (st.p * 1.6 - d) / 0.6));
            const r = g * 0.75 * (1 - k); if (r > 0.3) {{ ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }}
          }}
        }};
        tl.set("#" + C + "-ground", {{ opacity: 1 }}, 0);
        tl.set("#" + C + "-ground", {{ opacity: 0 }}, Q.out - 0.04);
        tl.fromTo(st, {{ p: 0 }}, {{ p: 1, duration: 0.42, ease: "power2.inOut", onUpdate: draw }}, Q.out - 0.04);
        tl.set(st, {{ p: 0, onComplete: draw }}, 0);
      }}
      window.__timelines[C] = tl;
    }}
    Promise.all([document.fonts.load("800 76px Montserrat"), document.fonts.load("236px 'League Gothic'"), document.fonts.load("700 40px 'Space Mono'")]).then(build, build);
  }})();
  </script>
</template>'''

intros = {}
for qk in ('Q1', 'Q2', 'Q3'):
    L, h = intro(qk); intros[qk] = L; open(f'{OUT}/compositions/{qk.lower()}.html', 'w').write(h)

# ---------------- logo + end card ----------------
def lockup(cid, dur, flood_from, sub=None, exit_=True):
    letters = ''.join(f'<span class="lt" id="{cid}l{i}">{"&nbsp;" if c == " " else c}</span>' for i, c in enumerate('STAGE ORION'))
    return f'''<template>
  <style>
    #root {{ position:absolute; inset:0; overflow:hidden; }}
    {GROUND_CSS}
    #{cid}-mark {{ position:absolute; left:340px; top:560px; width:400px; height:400px; }}
    .word {{ position:absolute; left:0; right:0; top:1010px; text-align:center; font-family:Montserrat, sans-serif; font-weight:800; font-size:92px; letter-spacing:.06em; color:{PAL['ink']}; }}
    .lt {{ display:inline-block; }}
    .badge {{ position:absolute; left:0; right:0; top:1150px; display:flex; justify-content:center; }}
    .badge span {{ font-family:"League Gothic", sans-serif; font-size:84px; letter-spacing:.06em; color:#fff; padding:2px 34px 0; border-radius:999px;
      background: linear-gradient(90deg, #19D3FF 0%, #6A5CFF 50%, #FF3DCB 100%); }}
    .sub {{ position:absolute; left:0; right:0; top:1300px; text-align:center; font-family:Montserrat, sans-serif; font-weight:600; font-size:38px; letter-spacing:.12em; color:{PAL['ink']}; opacity:.8; }}
  </style>
  <div id="root" data-composition-id="{cid}" data-width="1080" data-height="1920" data-layout-allow-overlap>
    <div class="ground" id="{cid}-ground"></div>
    <img id="{cid}-mark" src="assets/logo-mark.svg" alt="Stage Orion logo">
    <div id="{cid}-xp" style="position:absolute;inset:0;background:#dfe6ff;mix-blend-mode:plus-lighter;opacity:0"></div>
    <div class="word" id="{cid}-word">{letters}</div>
    <div class="badge"><span id="{cid}-badge">COHORT 1.0</span></div>
    {f'<div class="sub" id="{cid}-sub">{sub}</div>' if sub else ''}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    const D = {dur};
    // colour flood: the navy ground rises over the footage
    tl.fromTo("#{cid}-ground", {{ clipPath: "inset(100% 0% 0% 0%)" }}, {{ clipPath: "inset(0% 0% 0% 0%)", duration: 0.32, ease: "power2.inOut" }}, 0);
    // mark lands heavy: no spin, no overshoot on the lockup
    tl.fromTo("#{cid}-mark", {{ opacity: 0, scale: 0.55, filter: "blur(16px)" }}, {{ opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.55, ease: "expo.out" }}, {flood_from});
    tl.fromTo("#{cid}-xp", {{ opacity: 0.65 }}, {{ opacity: 0, duration: 0.22, ease: "power2.out" }}, {flood_from} + 0.06);
    for (let i = 0; i < 11; i++) tl.fromTo("#{cid}l" + i, {{ opacity: 0.0, filter: "blur(6px)" }}, {{ opacity: 1, filter: "blur(0px)", duration: 0.12, ease: "power2.out" }}, {flood_from} + 0.22 + i * 0.035);
    tl.fromTo("#{cid}-badge", {{ scaleX: 0, opacity: 0 }}, {{ scaleX: 1, opacity: 1, duration: 0.24, ease: "power4.out" }}, {flood_from} + 0.62);
    {f'tl.fromTo("#{cid}-sub", {{ opacity: 0, filter: "blur(6px)" }}, {{ opacity: 0.8, filter: "blur(0px)", duration: 0.2, ease: "power2.out" }}, {flood_from} + 0.85);' if sub else ''}
    {f'tl.to(["#{cid}-mark","#{cid}-word","#{cid}-badge"], {{ opacity: 0, filter: "blur(10px)", duration: 0.16, ease: "power2.in" }}, D - 0.18);' if exit_ else ''}
    window.__timelines["{cid}"] = tl;
  </script>
</template>'''
LOGO_LEAD = 0.12
open(f'{OUT}/compositions/logo.html', 'w').write(lockup('logo', round(sec['logo']['end'] - sec['logo']['start'] + LOGO_LEAD, 4), LOGO_LEAD + 0.05))
END_LEAD = 0.3
open(f'{OUT}/compositions/endcard.html', 'w').write(lockup('endcard', round(sec['end']['end'] - sec['end']['start'] + END_LEAD, 4), END_LEAD + 0.05, sub='CUSTOMER SUPPORT INTERNSHIP', exit_=False))

# ---------------- root ----------------
def host(cid, start, dur, z, kind='graphics'):
    return f'      <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{f(start)}" data-duration="{f(dur)}" data-track-index="{z}" data-track-kind="{kind}" data-width="1080" data-height="1920" style="z-index:{z}"></div>'
hosts = [host('footage', 0, D, 1), host('broll', 0, D, 2), host('captions', 0, D, 3, 'captions'),
         host('logo', sec['logo']['start'] - LOGO_LEAD, sec['logo']['end'] - sec['logo']['start'] + LOGO_LEAD, 5)]
for qk in ('Q1', 'Q2', 'Q3'):
    s0 = sec[f'intro_{qk}']['start']; hosts.append(host(qk.lower(), s0, min(intros[qk], D - s0), 6))
hosts.append(host('endcard', sec['end']['start'] - END_LEAD, sec['end']['end'] - sec['end']['start'] + END_LEAD, 7))
index = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    {GSAP}
    <style>
      * {{ margin:0; padding:0; box-sizing:border-box; }}
      html, body {{ margin:0; width:1080px; height:1920px; overflow:hidden; background:{PAL['navy']}; }}
      #root {{ position:relative; width:1080px; height:1920px; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{f(D)}" data-width="1080" data-height="1920" data-fps="30">
{chr(10).join(hosts)}
      <audio id="master" class="clip" src="assets/media/master.wav" data-start="0" data-duration="{f(D)}" data-track-index="20" data-volume="1" data-timeline-role="music"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>'''
open(f'{OUT}/index.html', 'w').write(index)
json.dump([round(g['words'][-1]['start'], 3) for g in groups if g['power']], open('edit/power_times.json', 'w'))
print('groups', len(groups), 'power groups', sum(1 for g in groups if g['power']), 'footage cues', len(fj), 'intro lengths', intros)
