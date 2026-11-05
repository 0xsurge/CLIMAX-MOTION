// Sterling, "One key": 76 beats at 129.24 BPM (35.3 s), 16:9, one continuous take. Built from the storyboard (review/boards).
// The carrier is Sterling's own 3D key illustration: it smashes in on the drop, gathers the model names, opens the green aurora through
// its keyhole, lands in the 01 card, comes back for "One key. Every model.", and folds into the logo; the button opens Mira's glowing mark.
// Real assets only: Sterling's logo (SVG), fonts (Zalando Sans Expanded, Public Sans), UI cards and illustrations; Mira's 3D mark and
// GT Super tagline face. Hook (first 5 s): the film starts four beats before the song's lift, giant type slams on every beat.
const { spring, track, clamp, lerp } = Motion;
const W = 1920, H = 1080, BEAT = 0.46427, b = n => n * BEAT, END = b(76);
const PAPER = '#F6F7F6', INK = '#111111', GREEN = '#063D31', MINT = '#59D9A3', MUTED = '#56605A';
const DISP = "'Zalando', 'Public', sans-serif", BODY = "'Public', system-ui, sans-serif", SERIF = "'GTSuper', Georgia, serif";
const S = (t, t0, p = 'default') => spring(t - t0, p);
const SLOW = { k: 4, c: 4 }, SOFT = { k: 120, c: 20 }, GLIDE = { k: 18, c: 8.5 }, WHIP = { k: 520, c: 38 };
const STAGE = document.getElementById('stage');
const A = 'assets/net/', U = 'assets/ui/', M = 'assets/mira/net/';

// ---------- TIMELINE (beats) ----------
const B = { w1: 0, w2: 2, drop: 4, pills: 5, label: 6.5, suck: 10.4, zoom: 11.1, unlock: 11.6, h1: 12.6, sub: 13.6,
  card: 20, steps: [21.5, 23, 24.5], grow: 27.4, routed: 28.4, cards: 32.6, focus: [33.4, 35.9, 38.4, 40.9, 43.4], gather: 45,
  three: 45.6, deal: 49.2, keyIn: 50.6, code: 55.2, url: 57, fold: 60.6, onekey: 61.2, lock: 64.4, btn: 65.6, click: 67,
  mira: 68.4, light: [69, 70.6, 72.2], miraL: 69.2, tag: 70.2 };
const T = Object.fromEntries(Object.entries(B).map(([k, v]) => [k, Array.isArray(v) ? v.map(b) : b(v)]));
window.TIMELINE = { BEAT, beats: B, seconds: T };

const css = document.createElement('style');
css.textContent = `@font-face{font-family:'Zalando';src:url(${A}zalando-sans-expanded-500.b8897a08ae.woff2) format('woff2');font-weight:500}
@font-face{font-family:'Public';src:url(${A}public-sans-latin-wght-normal.035c7fe496.woff2) format('woff2');font-weight:100 900}
@font-face{font-family:'GTSuper';src:url(${M}57e0ca951e5b15b9-s.p.woff2) format('woff2');font-weight:400}
#stage *{position:absolute;box-sizing:border-box;margin:0;padding:0}
#stage .fx{display:flex;justify-content:center;align-items:center}
#stage .fx *{position:relative;display:block}`;
document.head.appendChild(css);
const ld = s => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = s; });
const UIS = ['herocard', 'card_0', 'card_1', 'card_2', 'card_3', 'card_4', 'card_5', 'card_6', 'card_7', 'code_0'];
window.__preload = [document.fonts.load("500 100px 'Zalando'"), document.fonts.load("400 30px 'Public'"), document.fonts.load("600 30px 'Public'"), document.fonts.load("400 60px 'GTSuper'"),
  ...['key.webp', 'aurora.webp'].map(n => ld(A + n)), ...UIS.map(n => ld(U + n + '.png')), ld(U + 'logo_0.svg'), ld(U + 'poweredby.svg'),
  ...['bg_1.12f4880b.webp', 'bg_2.5089ebe7.webp', 'bg_3.ff981df6.webp'].map(n => ld(M + n))];

// ---------- helpers ----------
const PXK = new Set(['left', 'top', 'width', 'height', 'borderRadius']);
function mk(parent, o = {}, html) {
  const e = document.createElement('div'); e.style.left = '0px'; e.style.top = '0px';
  for (const k in o) e.style[k] = (PXK.has(k) && typeof o[k] === 'number') ? o[k] + 'px' : o[k];
  if (html != null) e.innerHTML = html; parent.appendChild(e); return e;
}
const put = (e, o) => { e.style.transform = `translate(${o.x || 0}px,${o.y || 0}px) rotate(${o.rot || 0}deg) scale(${o.sx ?? o.s ?? 1},${o.sy ?? o.s ?? 1})`; };
const vis = (e, on) => { e.style.visibility = on ? '' : 'hidden'; return on; };   // '' inherits: a hidden parent hides its children
const bump = (t, t0, hold = .5) => clamp(S(t, t0, 'snappy') - S(t, t0 + hold, SOFT));
const rimConic = a => `conic-gradient(from ${a}deg,rgba(89,217,163,0) 0deg,rgba(89,217,163,0) 200deg,#59D9A3 280deg,#E9FFF4 305deg,#59D9A3 330deg,rgba(89,217,163,0) 360deg)`;
function Line(parent, o) {   // a centred flex line of masked words
  const box = mk(parent, { left: 0, top: o.y, width: W, height: o.h }); box.className = 'fx'; box.style.gap = (o.gap ?? 30) + 'px';
  const ws = o.words.map(wd => { const w = typeof wd === 'string' ? { t: wd } : wd; const m = mk(box, { height: o.h, overflow: 'hidden', padding: '0 8px' });
    const inn = mk(m, { font: o.font, color: w.color || o.color || INK, letterSpacing: o.ls || '-.03em', paddingLeft: o.ls && o.ls[0] !== '-' ? o.ls : '0', whiteSpace: 'nowrap', lineHeight: o.h + 'px' }, w.t);
    [m, inn].forEach(e => { e.style.left = ''; e.style.top = ''; }); return { m, inn }; });
  return { box, ws, upd(t, tIn, tOut = 999, p = 'heavy') { vis(box, t > tIn - .05 && t < tOut + .6);
    ws.forEach((w, i) => { const u = S(t, tIn + i * .05, p), v = S(t, tOut + i * .04, 'snappy'); w.inn.style.transform = `translateY(${((1 - u) - v) * o.h * 1.08}px)`; }); } };
}

// ---------- layers: paper, the aurora (opened through the keyhole), the world under the camera, the Mira frame, light sweeps ----------
mk(STAGE, { width: W, height: H, background: `radial-gradient(120% 100% at 50% 40%,#FFFFFF 0%,${PAPER} 60%,#EAF1EC 100%)` });
const AUR = mk(STAGE, { width: W, height: H, overflow: 'hidden' }, `<img src="${A}aurora.webp" style="left:-120px;top:-90px;width:2160px;height:1260px;object-fit:cover">`);
const WORLD = mk(STAGE, { width: W, height: H, transformOrigin: '0 0' });
const MIRA = mk(STAGE, { width: W, height: H, overflow: 'hidden' });
const SWEEP = mk(STAGE, { left: -450, top: -700, width: 900, height: 2480, transformOrigin: '50% 50%',
  background: 'linear-gradient(90deg,rgba(89,217,163,0) 0%,rgba(89,217,163,.14) 30%,rgba(233,255,244,.5) 50%,rgba(89,217,163,.14) 70%,rgba(89,217,163,0) 100%)' });

// ---------- camera: spring keys, kicks on the hits, a sway that returns to centre ----------
const CAMK = [{ t: 0, v: 1.12 }, { t: -.2, v: 1, s: 'heavy' }, { t: T.w2, v: 1.06, s: 'snappy' }, { t: T.w2 + .12, v: 1 },
  { t: T.drop, v: 1.18, s: 'snappy' }, { t: T.drop + .12, v: 1 }, { t: T.drop + .4, v: 1.05, s: SLOW },
  { t: T.unlock, v: 1 }, { t: T.unlock + .3, v: 1.06, s: SLOW }, { t: T.card, v: 1.1, s: 'snappy' }, { t: T.card + .12, v: 1.02 }, { t: T.card + .4, v: 1.08, s: SLOW },
  { t: T.grow, v: 1 }, { t: T.routed, v: 1.05, s: SLOW }, { t: T.cards, v: 1 }, { t: T.cards + .3, v: 1.04, s: SLOW },
  { t: T.gather, v: 1 }, { t: T.three, v: 1.05, s: SLOW }, { t: T.deal, v: 1 }, { t: T.deal + .3, v: 1.04, s: SLOW },
  { t: T.code, v: 1 }, { t: T.url - .3, v: 1.07, s: GLIDE }, { t: T.fold, v: 1 }, { t: T.onekey, v: 1.06, s: SLOW }, { t: T.lock, v: 1 }, { t: T.lock + .3, v: 1.05, s: SLOW }];
const camZ = t => track(t, CAMK.map(k => ({ t: k.t, v: k.v, spring: k.s || 'default' })));
const camY = t => track(t, [{ t: 0, v: 0 }, { t: T.url - .3, v: -30, spring: GLIDE }, { t: T.fold, v: 0, spring: 'default' }]);
const camX = t => track(t, [{ t: 0, v: 0 }, { t: T.url - .3, v: -150, spring: GLIDE }, { t: T.fold, v: 0, spring: 'default' }]);
function camera(t) {
  const a = 1 - .4 * S(t, T.btn, 'heavy'), sx = a * 12 * Math.sin(t * 2 * Math.PI / 6.4), sy = a * 7 * Math.sin(t * 2 * Math.PI / 4.7 + 1);
  const z = camZ(t) * (1 + .008 * Math.sin(t * 2 * Math.PI / 9));
  WORLD.style.transform = `translate(${960 + sx}px,${540 + sy}px) scale(${z}) translate(${-960 - camX(t)}px,${-540 - camY(t)}px)`;
  return { sx, sy };
}
const SWEEPS = [T.unlock - .1, T.grow + .3, T.gather + .2, T.code, T.mira];
function sweep(t) { let ts = -9; for (const s of SWEEPS) if (s <= t) ts = s; const u = t - ts;
  if (!vis(SWEEP, u >= 0 && u < 2.2)) return; put(SWEEP, { x: lerp(-700, 2600, S(t, ts, { k: 16, c: 8 })), rot: 18 }); SWEEP.style.opacity = 1 - S(t, ts + .5, SOFT); }

// ---------- scene 1, the hook: giant type on every beat, the key smashes in on the drop, the model names lock into orbit ----------
const L1 = Line(WORLD, { y: 330, h: 250, font: `500 230px/250px ${DISP}`, words: ['A', 'model', 'name'], gap: 46 });
const L2 = Line(WORLD, { y: 330, h: 250, font: `500 230px/250px ${DISP}`, words: ['on', 'an', 'API'], gap: 46 });
const L3 = Line(WORLD, { y: 700, h: 230, font: `500 200px/230px ${DISP}`, words: [{ t: 'is a', color: INK }, { t: 'claim.', color: GREEN }], gap: 50 });
const UL = mk(WORLD, { left: 0, top: 922, width: 10, height: 12, borderRadius: 6, background: MINT, transformOrigin: '0 50%' });
const LB1 = Line(WORLD, { y: 96, h: 34, font: `600 24px/34px ${BODY}`, words: ['ONE KEY FOR CLAUDE, GPT, GEMINI AND MORE'], ls: '.24em', color: MUTED });
const PILLS = ['Claude', 'GPT', 'Gemini', 'and more', 'Claude', 'GPT', 'Gemini', 'and more'].map((s, i) => ({ i, el: mk(WORLD, { width: 0, height: 0 },
  `<div style="left:0;top:0;transform:translate(-50%,-50%);height:${i < 4 ? 84 : 64}px;padding:0 ${i < 4 ? 38 : 28}px;border-radius:42px;background:#fff;font:500 ${i < 4 ? 36 : 28}px/${i < 4 ? 84 : 64}px ${BODY};color:${INK};white-space:nowrap;box-shadow:0 18px 40px rgba(6,61,49,.14),inset 0 0 0 1.5px rgba(6,61,49,.12)">${s}</div>`) }));
const KEY = mk(WORLD, { width: 0, height: 0, zIndex: 3 }, `<img src="${A}key.webp" style="left:-220px;top:-160px;width:440px;height:320px;filter:drop-shadow(0 30px 40px rgba(6,40,30,.22))">`);
const HOLE = [.64 * 440 - 220, .26 * 320 - 160];   // the square hole in the key's bow, relative to the key's centre
const POOL = mk(WORLD, { width: 900, height: 260, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(89,217,163,.5),rgba(89,217,163,.16) 55%,rgba(89,217,163,0))' });

// ---------- scene 2: the aurora and the real "Three steps" card ----------
const H1a = Line(AUR, { y: 360, h: 124, font: `500 104px/124px ${DISP}`, words: ['The model you pay for.'], color: '#fff' });
const H1b = Line(AUR, { y: 484, h: 124, font: `500 104px/124px ${DISP}`, words: ['From a verified provider.'], color: '#fff' });
const H1c = Line(AUR, { y: 670, h: 50, font: `400 32px/50px ${BODY}`, words: ['Sterling sends every request to a provider Mira Network has tested.'], color: 'rgba(255,255,255,.82)', ls: '0' });
const HC = { x: 560, y: 180, w: 800, h: 800 * 838 / 1026 };
const HCARD = mk(AUR, { left: HC.x, top: HC.y, width: HC.w, height: HC.h, borderRadius: 30, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,.35)', transformOrigin: '50% 50%' }, `<img src="${U}herocard.png" style="left:0;top:0;width:${HC.w}px;height:${HC.h}px">`);
const STEPGLOW = [382, 499, 616].map(y => mk(AUR, { left: 592, top: y, width: 740, height: 112, borderRadius: 18, boxShadow: `0 0 0 3px ${MINT}, 0 0 36px rgba(89,217,163,.55)` }));
const GROWR = mk(STAGE, { background: PAPER });   // the card grows into the paper page

// ---------- scene 3: routed only to verified providers, and the five real checks ----------
const R1 = Line(WORLD, { y: 410, h: 124, font: `500 104px/124px ${DISP}`, words: ['Routed only to providers'] });
const R2 = Line(WORLD, { y: 534, h: 124, font: `500 104px/124px ${DISP}`, words: ['that are verified.'] });
const LB2 = Line(WORLD, { y: 150, h: 34, font: `600 24px/34px ${BODY}`, words: ['CHECKED ON A SCHEDULE, PER MODEL AND PROVIDER'], ls: '.24em', color: MUTED });
const VC = [0, 1, 2, 3, 4].map(i => mk(WORLD, { width: 646, height: 448, transformOrigin: '50% 50%' }, `<img src="${U}card_${i}.png" style="left:0;top:0;width:646px;height:448px">`));
// ---------- scene 4: three steps, the step cards, the code card ----------
const T1 = Line(WORLD, { y: 410, h: 124, font: `500 104px/124px ${DISP}`, words: ['Three steps.'] });
const T2 = Line(WORLD, { y: 534, h: 124, font: `500 104px/124px ${DISP}`, words: ["Then you're in."] });
const SCW = 520, SCH = 520 * 640 / 746, SCX = [150, 700, 1250], SCY = 300;
const STC = [5, 6, 7].map((n, i) => mk(WORLD, { width: SCW, height: SCH, transformOrigin: '50% 50%' }, `<img src="${U}card_${n}.png" style="left:0;top:0;width:${SCW}px;height:${SCH}px">`));
const CK = { x: 200, y: 300, w: 1520, h: 1520 * 746 / 2304 };
const MORPH = mk(WORLD, { background: '#F1F3F1', borderRadius: 26, overflow: 'hidden', boxShadow: '0 24px 60px rgba(6,40,30,.10), inset 0 0 0 1.5px rgba(17,17,17,.35)' }, `<img src="${U}code_0.png" style="left:0;top:0;width:100%;height:100%">`);
const CH = Line(WORLD, { y: 130, h: 96, font: `500 70px/96px ${DISP}`, words: ['Change the endpoint.', 'Keep your workflow.'], gap: 36 });
const URLG = mk(WORLD, { left: CK.x + 30, top: CK.y + 96, width: 10, height: 10 }, `<svg width="900" height="60" style="left:0;top:0;overflow:visible"><rect x="0" y="0" width="866" height="46" rx="10" fill="rgba(89,217,163,.08)" stroke="${MINT}" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="filter:drop-shadow(0 0 8px rgba(89,217,163,.8))"/></svg>`);
const URLR = URLG.querySelector('rect');
// ---------- scene 5: one key, the lockup ----------
const O1 = Line(WORLD, { y: 600, h: 120, font: `500 100px/120px ${DISP}`, words: ['One key.', 'Every model.'], gap: 40 });
const O2 = Line(WORLD, { y: 720, h: 120, font: `500 100px/120px ${DISP}`, words: ['Verified inference.'], color: GREEN });
const LOGO = mk(WORLD, { left: 960 - 264, top: 300, width: 528, height: 104, transformOrigin: '12% 50%' }, `<img src="${U}logo_0.svg" style="left:0;top:0;width:528px;height:104px">`);
const PB = mk(WORLD, { left: 960 - 120, top: 452, width: 240, height: 24 }, `<img src="${U}poweredby.svg" style="left:0;top:0;width:240px;height:24px">`);
const BTN = mk(WORLD, { left: 960 - 190, top: 560, width: 380, height: 104, transformOrigin: '50% 50%' },
  `<div class="rg" style="left:-10px;top:-10px;width:400px;height:124px;border-radius:30px;filter:blur(12px)"></div><div class="rm" style="left:-3px;top:-3px;width:386px;height:110px;border-radius:25px"></div><div style="left:0;top:0;width:380px;height:104px;border-radius:22px;background:${INK}"></div><div class="fx" style="left:0;top:0;width:380px;height:104px"><div style="font:600 38px/1 ${BODY};color:#fff">Get your key</div></div>`);
const BRG = BTN.querySelector('.rg'), BRM = BTN.querySelector('.rm');
const URL = Line(WORLD, { y: 720, h: 50, font: `400 34px/50px ${BODY}`, words: ['sterling.mira.network'], color: MUTED, ls: '0' });
const CUR = mk(WORLD, { width: 44, height: 62, zIndex: 6 }, `<svg width="44" height="62" viewBox="0 0 28 40" style="left:0;top:0;overflow:visible"><path d="M3 2 L3 30 L10 24 L15 36 L20 34 L15 22 L24 22 Z" fill="${INK}" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>`);
// ---------- scene 6: Mira's mark, the light moving across its three bars, the tagline in GT Super ----------
const MB = ['bg_1.12f4880b.webp', 'bg_2.5089ebe7.webp', 'bg_3.ff981df6.webp'].map(n => mk(MIRA, { left: -60, top: -40, width: 2040, height: 1160 }, `<img src="${M}${n}" style="left:0;top:0;width:2040px;height:1160px;object-fit:cover">`));
const MLB = Line(MIRA, { y: 150, h: 34, font: `600 24px/34px ${BODY}`, words: ['STERLING IS BUILT ON MIRA NETWORK'], ls: '.24em', color: 'rgba(255,255,255,.62)' });
const MTAG = Line(MIRA, { y: 770, h: 130, font: `400 112px/130px ${SERIF}`, words: ['The', 'Trust', 'Layer', 'of', 'AI'], color: '#fff', ls: '-.01em', gap: 26 });

// ---------- the key's journey ----------
const KK = [{ t: 0, x: 2350, y: -380, s: 2.6, r: -30 }, { t: T.drop - .22, x: 960, y: 370, s: 1.18, r: -8, sp: WHIP },
  { t: T.suck, x: 960, y: 380, s: 1.1, r: 0, sp: 'default' }, { t: T.zoom, x: 960 - HOLE[0] * 7, y: 540 - HOLE[1] * 7, s: 7, sp: { k: 60, c: 13 } },
  { t: T.keyIn, x: 960, y: -260, s: .7, r: -20, sp: 'snappy' }, { t: T.keyIn + .02, x: SCX[0] + .74 * SCW, y: SCY + .24 * SCH, s: SCW * .47 / 440, r: 0, sp: WHIP },
  { t: T.fold, x: 960, y: 360, s: 1.05, r: -6, sp: 'default' }, { t: T.lock, x: 960 - 264 + 52, y: 352, s: .2, r: -40, sp: 'default' }];
const KP = ['x', 'y', 's', 'r'].map(p => { const k = KK.filter(o => o[p] !== undefined).map(o => ({ t: o.t, v: o[p], spring: o.sp || 'default' })); return t => track(t, k); });
const keyOn = t => (t < T.zoom + .55) || (t > T.keyIn - .05 && t < T.keyIn + .62) || (t > T.fold - .05 && t < T.lock + .45);

window.seek = function (t) {
  camera(t); sweep(t);
  const inAur = t >= T.unlock - .05 && t < T.grow + .7, inMira = t >= T.mira + .5;
  // the hook
  L1.upd(t, -.25, T.w2 - .05, WHIP); L1.box.style.transformOrigin = '50% 50%'; L1.box.style.transform = `scale(${1 + .5 * (1 - S(t, -.25, WHIP))})`;
  L2.upd(t, T.w2 - .05, T.drop - .05, WHIP); L2.box.style.transformOrigin = '50% 50%'; L2.box.style.transform = `scale(${1 + .5 * (1 - S(t, T.w2 - .05, WHIP))})`;
  L3.upd(t, T.drop - .05, T.suck + .2, WHIP); const sk = S(t, T.suck, 'default');
  L3.box.style.transformOrigin = '50% 50%'; L3.box.style.transform = `translateY(${-sk * 300}px) scale(${1 - .9 * sk})`;
  vis(UL, t > T.drop && t < T.suck + .3); const ulw = clamp(S(t, T.drop + .25, { k: 40, c: 12 })); const cw = L3.ws[1].m.offsetWidth;
  Object.assign(UL.style, { left: (L3.ws[1].m.offsetLeft + 12) + 'px', width: (cw - 24) + 'px' }); UL.style.transform = `scaleX(${ulw * (1 - sk)})`;
  LB1.upd(t, T.label, T.suck, 'default');
  const kx = KP[0](t), ky = KP[1](t), ks = KP[2](t), kr = KP[3](t);
  const vx = (KP[0](t + .006) - KP[0](t - .006)) / .012, vy = (KP[1](t + .006) - KP[1](t - .006)) / .012, sp = Math.hypot(vx, vy), st = clamp(sp / 9000, 0, .28);
  const land = S(t, T.drop + .1, 'snappy') - S(t, T.drop + .26, 'default');
  vis(KEY, keyOn(t)); put(KEY, { x: kx, y: ky + 8 * Math.sin(t * 2.1) * S(t, T.drop + .5) * (1 - S(t, T.suck)), rot: kr + 4 * Math.sin(t * 1.4) * (t > T.drop + .5 && t < T.suck ? 1 : 0),
    sx: ks * (1 + st + .1 * land), sy: ks * (1 - .5 * st - .12 * land) });
  PILLS.forEach(p => { const e = S(t, T.pills + .07 * p.i, 'default'), sc = S(t, T.suck + .03 * p.i, 'snappy'), big = p.i < 4;
    const a = p.i / 8 * Math.PI * 2 + (t - T.pills) * .35 + (big ? 0 : .4), R = big ? 560 : 760, ry = big ? 250 : 330;
    const fx = 960 + Math.cos(a) * R, fy = 380 + Math.sin(a) * ry, ox = 960 + Math.cos(a) * 2200, oy = 380 + Math.sin(a) * 1300;
    const x = lerp(lerp(ox, fx, e), 960 + HOLE[0], sc), y = lerp(lerp(oy, fy, e), 380 + HOLE[1], sc); vis(p.el, e > .01 && sc < .99 && t < T.zoom + .3);
    put(p.el, { x, y, s: (big ? 1 : .85) * (1 - sc) }); p.el.style.opacity = big ? 1 : .7; });
  // through the keyhole into the aurora
  const r = 1300 * S(t, T.unlock, { k: 40, c: 13 }); const hx = 960, hy = 540;
  vis(AUR, inAur); AUR.style.clipPath = t < T.unlock + 1.2 ? `circle(${r}px at ${hx}px ${hy}px)` : 'none';
  if (inAur) { H1a.upd(t, T.h1, T.card - .4); H1b.upd(t, T.h1 + .12, T.card - .35); H1c.upd(t, T.sub, T.card - .4, 'default');
    AUR.firstChild.style.transform = `translate(${-30 * Math.sin(t * .25)}px,${-14 * t / 8}px) scale(${1.02 + .01 * t / 8})`;
    const ce = S(t, T.card, 'default'); vis(HCARD, ce > .01); put(HCARD, { y: (1 - ce) * 700 + 6 * Math.sin(t * 1.4), s: .94 + .06 * ce });
    STEPGLOW.forEach((g, i) => { const k = bump(t, T.steps[i], .5) * (1 - S(t, T.grow, 'snappy')); vis(g, k > .01); g.style.opacity = k; put(g, { y: (1 - ce) * 700 + 6 * Math.sin(t * 1.4) }); }); }
  // the card grows into the paper page
  const gr = S(t, T.grow, 'default'); vis(GROWR, t > T.grow && t < T.grow + .75);
  if (t > T.grow) { const x0 = HC.x, y0 = HC.y + 6 * Math.sin(t * 1.4), w = lerp(HC.w, W + 80, gr), h = lerp(HC.h, H + 80, gr);
    Object.assign(GROWR.style, { left: lerp(x0, -40, gr) + 'px', top: lerp(y0, -40, gr) + 'px', width: w + 'px', height: h + 'px', borderRadius: lerp(30, 0, gr) + 'px' }); }
  vis(WORLD, !inAur || t < T.unlock + .4); WORLD.style.opacity = 1;
  // routed + the five checks: the focused card large and sharp, the rest small and blurred
  R1.upd(t, T.routed, T.cards - .1); R2.upd(t, T.routed + .1, T.cards - .05); LB2.upd(t, T.cards + .3, T.gather, 'default');
  const ve = S(t, T.cards, 'default'), vg = S(t, T.gather, 'snappy');
  const foc = track(t, [{ t: 0, v: 0 }, ...T.focus.map((f, i) => ({ t: f, v: i, spring: 'default' }))]);
  VC.forEach((c, i) => { const d = i - foc, f = clamp(1 - Math.abs(d)), s = (.62 + .55 * f) * (1 - vg);
    vis(c, ve > .01 && vg < .99); c.style.transformOrigin = '50% 50%'; c.style.filter = f < .9 ? `blur(${(1 - f) * 5}px)` : 'none'; c.style.opacity = .55 + .45 * f;
    put(c, { x: lerp(960 + d * 560 + (1 - ve) * 1400, 960, vg) - 323, y: 560 - 224 + (1 - ve) * 60 + vg * 500 + 5 * Math.sin(t * 1.6 + i), s }); c.style.zIndex = f > .5 ? 2 : 1; });
  // three steps; the cards deal in; the key lands in card 01
  T1.upd(t, T.three, T.deal - .1); T2.upd(t, T.three + .12, T.deal - .05);
  STC.forEach((c, i) => { const e = S(t, T.deal + .15 * i, 'default'), m = i === 2 ? S(t, T.code, 'default') : 0, o = i < 2 ? S(t, T.code - .1 + .05 * i, 'snappy') : 0;
    vis(c, e > .01 && o < .99 && m < .05); c.style.transformOrigin = '50% 50%';
    put(c, { x: SCX[i] + (1 - e) * (i - 1) * 300, y: SCY + (1 - e) * 700 - 160 * Math.sin(Math.PI * e) * (1 - e) - o * 700 + 5 * Math.sin(t * 1.5 + i), rot: (1 - e) * (i - 1) * 10, s: 1 }); });
  // card 03 grows into the real code card
  const m = S(t, T.code, 'default'), fo = S(t, T.fold, 'default'); vis(MORPH, m > .01 && fo < .99);
  if (m > .01) { const x = lerp(SCX[2], CK.x, m), y = lerp(SCY, CK.y, m), w = lerp(SCW, CK.w, m), h = lerp(SCH, CK.h, m), s = 1 - fo;
    Object.assign(MORPH.style, { left: lerp(x, 960 - w * s / 2, fo) + 'px', top: lerp(y, 360 - h * s / 2, fo) + 'px', width: w * s + 'px', height: h * s + 'px', borderRadius: (26 + 200 * fo) + 'px' });
    MORPH.firstChild.style.opacity = clamp((m - .35) / .4); }
  CH.upd(t, T.code + .2, T.fold - .1); const ud = clamp(S(t, T.url, { k: 30, c: 11 })); vis(URLG, ud > .01 && fo < .3); URLR.style.strokeDashoffset = 1 - ud;
  // one key, every model; then the lockup
  O1.upd(t, T.onekey, T.lock - .1); O2.upd(t, T.onekey + .2, T.lock - .05);
  const pl = S(t, T.onekey, 'heavy') * (1 - S(t, T.lock, 'snappy')); vis(POOL, pl > .01); put(POOL, { x: 960 - 450, y: 400 - 130 + 120, s: .8 + .2 * pl * (1 + .04 * Math.sin(t * 3)) }); POOL.style.opacity = pl;
  const lg = S(t, T.lock + .25, 'snappy'), mo = S(t, T.mira, 'snappy');
  vis(LOGO, lg > .01); put(LOGO, { s: lg, y: 3 * Math.sin(t * 1.5) }); vis(PB, t > T.lock + .4); PB.style.opacity = clamp(S(t, T.lock + .4, 'default')); put(PB, { y: (1 - S(t, T.lock + .4, 'default')) * 20 });
  const be = S(t, T.btn, 'snappy'), pr = S(t, T.click, 'snappy') - S(t, T.click + .12, 'default'); vis(BTN, be > .01); put(BTN, { s: be * (1 - .05 * pr) });
  const ri = Math.max(bump(t, T.btn + .3, .7), bump(t, T.click, .7)) * .9 + .1 * be; BRG.style.background = BRM.style.background = rimConic(160 * t); BRG.style.opacity = BRM.style.opacity = ri;
  URL.upd(t, T.btn + .3, 999, 'default'); const cu = S(t, T.btn + .5, 'default'); vis(CUR, cu > .01);
  put(CUR, { x: lerp(1600, 1010, cu), y: lerp(1000, 620, cu), s: 1 - .14 * pr });
  // the button grows into Mira's frame; the light moves across the three bars; the tagline rises
  vis(MIRA, t > T.mira); const mr = 2300 * S(t, T.mira, { k: 30, c: 11 });
  MIRA.style.clipPath = t < T.mira + 1.5 ? `circle(${mr}px at 960px 612px)` : 'none';
  const lt = track(t, [{ t: 0, v: 1 }, ...T.light.map((l, i) => ({ t: l, v: [0, 1, 2][i], spring: SOFT }))]);
  MB.forEach((e, i) => { e.style.opacity = clamp(1 - Math.abs(i - lt)); put(e, { x: -20 * (t - T.mira) / 6, y: -10 * (t - T.mira) / 6, s: 1 + .012 * (t - T.mira) }); });
  MLB.upd(t, T.miraL, 999, 'default'); MTAG.upd(t, T.tag, 999, 'heavy');
};
