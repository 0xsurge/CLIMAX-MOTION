// Vivox, "Meet Rachel" v2: 60 beats at 112.01 BPM (32.2 s), 16:9, one continuous take.
// The carrier is a real 3D glass orb (three.js): it becomes the "check." pill, swallows the pile of reports, becomes the "Rachel*" pill,
// rides the skills list as its bullet, grows out of the collapsing dashboard, rests on the dot field and finally splits onto the two
// loops of the real Vivox infinity mark. One camera (spring keys + a sway that returns to centre), centred type on three levels,
// moving blue light (rim passes, light sweeps, glowing lines, an orbiting ring). Every frame is a pure function of t.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const { spring, track, clamp, lerp } = Motion;
const W = 1920, H = 1080, BEAT = 0.5356526, b = n => n * BEAT, END = 1930 / 60;
const BLUE = '#0051FF', NAVY = '#04152A', G600 = '#535862', INTER = "'Inter', system-ui, sans-serif";
const S = (t, t0, p = 'default') => spring(t - t0, p);
const SLOW = { k: 4, c: 4 }, GLIDE = { k: 18, c: 8.5 }, SOFT = { k: 120, c: 20 };
const STAGE = document.getElementById('stage');

// ---------- TIMELINE (beats); make_audio.py reads this table for every sound cue ----------
const B = { orbLand: 1, w1: 0.5, c1: 1.5, w2: 2, w3: 3, c2: 3.5, w4: 4, w5: 5, chip1: 6, c3: 6.5, pile: 8, lift: 12, cam1: 14.6,
  drop: 15, chipR: 15.25, rachel: 15.5, sub: 15.75, frame: 16.5, list: 19, act: [20, 21.5, 23, 24.5, 26], grow: 27, f1: 29, f2: 31,
  cam2: 33.5, ring: 34, expl: 34.5, aud: 36.5, ringOut: 39.5, field: 40, fw1: 40.5, fchip: 41.5, cam3: 46.5, sup: 47, rachel2: 47.3,
  cam4: 51.5, split: 52.25, logo: 53, word: 53.5, cta: 54.5, curIn: 55, click: 57 };
const T = Object.fromEntries(Object.entries(B).map(([k, v]) => [k, Array.isArray(v) ? v.map(b) : b(v)]));
window.TIMELINE = { BEAT, beats: B, seconds: T };

const css = document.createElement('style');
css.textContent = `@font-face{font-family:'Inter';src:url(assets/fonts/inter.woff2) format('woff2');font-weight:300 800}
#stage *{position:absolute;box-sizing:border-box;margin:0;padding:0}
#stage .fx{display:flex;justify-content:center;align-items:center}
#stage .fx *{position:relative;display:block}`;
document.head.appendChild(css);
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = src; });

// ---------- type scale: three levels only ----------
const DISPLAY = `700 128px/1 ${INTER}`, SUPPORT = `500 44px/1 ${INTER}`, LABEL = `600 22px/1 ${INTER}`;

// ---------- helpers ----------
const PXK = new Set(['left', 'top', 'width', 'height', 'borderRadius']);
function mk(parent, o = {}, html) {
  const e = document.createElement('div'); e.style.left = '0px'; e.style.top = '0px';
  for (const k in o) e.style[k] = (PXK.has(k) && typeof o[k] === 'number') ? o[k] + 'px' : o[k];
  if (html != null) e.innerHTML = html; parent.appendChild(e); return e;
}
const put = (e, o) => { e.style.transform = `translate(${o.x || 0}px,${o.y || 0}px) rotate(${o.rot || 0}deg) scale(${o.sx ?? o.s ?? 1},${o.sy ?? o.s ?? 1})`; };
const vis = (e, on) => { e.style.visibility = on ? 'visible' : 'hidden'; return on; };
const bump = (t, t0, hold = .5) => clamp(S(t, t0, 'snappy') - S(t, t0 + hold, SOFT));
const rimConic = a => `conic-gradient(from ${a}deg,rgba(0,81,255,0) 0deg,rgba(0,81,255,0) 200deg,#5B8CFF 280deg,#E6EEFF 305deg,#5B8CFF 330deg,rgba(0,81,255,0) 360deg)`;
// a crop of the real Vivox dashboard (crop window cx,cy,cw,ch in the 1898x861 source, shown at scale k)
const crop = (parent, cx, cy, cw, ch, k) => mk(parent, { width: cw * k, height: ch * k, borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 24px 60px rgba(4,21,42,.14),0 0 0 1px rgba(4,21,42,.06)' },
  `<img src="assets/product_ui.webp" style="left:${-cx * k}px;top:${-cy * k}px;width:${1898 * k}px">`);

// ---------- layers ----------
mk(STAGE, { width: W, height: H, background: 'radial-gradient(120% 100% at 50% 40%,#FFFFFF 0%,#F3F6FC 65%,#E8EEF9 100%)' });
const WORLD = mk(STAGE, { width: W, height: H, transformOrigin: '0 0' });
const TYPE = mk(STAGE, { width: W, height: H });
const HUD = mk(STAGE, { width: W, height: H });
const SWEEP = mk(STAGE, { left: -450, top: -700, width: 900, height: 2480, transformOrigin: '50% 50%',
  background: 'linear-gradient(90deg,rgba(0,81,255,0) 0%,rgba(80,130,255,.12) 30%,rgba(225,235,255,.5) 50%,rgba(80,130,255,.12) 70%,rgba(0,81,255,0) 100%)' });

// ---------- camera: spring keys + a sway that always returns to centre ----------
const CAMK = [{ t: 0, z: 1, x: 0, y: 0 }, { t: 0, z: 1.05, sp: SLOW }, { t: b(6.5), z: 1 }, { t: b(6.8), z: 1.07, sp: SLOW }, { t: b(12), z: 1.1, sp: SLOW },
  { t: b(15), z: 1.14, sp: 'snappy' }, { t: b(15.15), z: 1 }, { t: b(15.4), z: 1.05, sp: SLOW }, { t: b(20), z: 1.02 }, { t: b(20.3), z: 1.07, sp: SLOW },
  { t: b(27), z: 1 }, { t: b(27.3), z: 1.06, sp: SLOW }, { t: b(29), z: 1.16, x: -260, y: -120, sp: GLIDE }, { t: b(31), x: -240, y: 150, sp: GLIDE },
  { t: b(33.5), z: 1, x: 0, y: 0 }, { t: b(33.8), z: 1.06, sp: SLOW }, { t: b(40), z: 1 }, { t: b(40.3), z: 1.06, sp: SLOW },
  { t: b(46.5), z: 1 }, { t: b(46.8), z: 1.05, sp: SLOW }, { t: b(52), z: 1 }, { t: b(52.3), z: 1.04, sp: SLOW }, { t: b(56), z: 1.06, sp: SLOW }];
const K = (keys, p, def = 'default') => { const k = keys.filter(o => o[p] !== undefined).map(o => ({ t: o.t, v: o[p], spring: o.sp || def })); return t => track(t, k); };
const camZ = K(CAMK, 'z'), camX = K(CAMK, 'x'), camY = K(CAMK, 'y');
let SW = { x: 0, y: 0 };
function camera(t) {
  const a = 1 - .5 * S(t, b(55), 'heavy');
  SW = { x: a * 14 * Math.sin(t * 2 * Math.PI / 6.4), y: a * 8 * Math.sin(t * 2 * Math.PI / 4.7 + 1) };
  const z = camZ(t) * (1 + .01 * Math.sin(t * 2 * Math.PI / 9));
  WORLD.style.transform = `translate(${960 + SW.x}px,${540 + SW.y}px) rotate(${a * .25 * Math.sin(t * 2 * Math.PI / 8.3)}deg) scale(${z}) translate(${-960 - camX(t)}px,${-540 - camY(t)}px)`;
  TYPE.style.transform = HUD.style.transform = `translate(${SW.x * .5}px,${SW.y * .5}px)`;
}
const SWEEPS = [b(6.3), b(14.5), b(26.8), b(33.3), b(39.8), b(46.3), b(51.9)];
function sweep(t) { let ts = -9; for (const s of SWEEPS) if (s <= t) ts = s; const u = t - ts;
  if (!vis(SWEEP, u >= 0 && u < 2.2)) return; put(SWEEP, { x: lerp(-700, 2600, S(t, ts, { k: 16, c: 8 })), rot: 18 }); SWEEP.style.opacity = 1 - S(t, ts + .5, SOFT); }

// ---------- type: centred flex lines with masked rises (overlapping words) and upward exits ----------
const LINES = [];
function Line(o) {
  const box = mk(TYPE, { left: 0, top: o.y, width: W, height: o.h }); box.className = 'fx'; box.style.gap = (o.gap ?? 30) + 'px';
  const words = o.words.map(wd => { const pill = typeof wd === 'object';
    const m = mk(box, { height: o.h, overflow: 'hidden', padding: '0 6px' });
    const inn = mk(m, pill ? { font: o.font, color: '#fff', background: BLUE, borderRadius: o.h / 2, padding: `0 ${o.h * .32}px`, letterSpacing: '-.03em', whiteSpace: 'nowrap', lineHeight: o.h + 'px', boxShadow: '0 18px 40px rgba(0,81,255,.28)' }
      : { font: o.font, color: o.color || NAVY, letterSpacing: o.ls || '-.035em', whiteSpace: 'nowrap', lineHeight: o.h + 'px', paddingLeft: o.ls && o.ls[0] !== '-' ? o.ls : '0' }, pill ? wd.pill : wd);
    [m, inn].forEach(e => { e.style.left = ''; e.style.top = ''; }); return { m, inn, pill }; });
  const L = { box, words, o };
  LINES.push(t => { const on = t > o.tIn - .05 && t < o.tOut + .8; if (!vis(box, on)) return;
    const rec = o.recede ? S(t, o.recede, 'heavy') : 0;
    box.style.transformOrigin = '50% 50%'; box.style.transform = `translateY(${-rec * (o.recedeY ?? 120)}px) scale(${1 - .25 * rec})`; box.style.filter = rec > .02 ? `blur(${6 * rec}px)` : 'none'; box.style.opacity = 1 - .55 * rec;
    words.forEach((w, i) => { const u = S(t, o.tIn + i * .07, o.sp || 'heavy'), v = S(t, o.tOut + i * .05, 'snappy');
      if (w.pill) { const g = S(t, o.tIn + i * .07, 'snappy'); w.inn.style.transformOrigin = '50% 50%'; w.inn.style.transform = `translateY(${-v * o.h * 1.1}px) scale(${g})`; }
      else w.inn.style.transform = `translateY(${((1 - u) - v) * o.h * 1.1}px)`; }); });
  return L;
}
// centre of a word inside a line, in screen coordinates (layout only, so the same every frame)
const wordCentre = (L, i) => { const m = L.words[i].m; return { x: m.offsetLeft + m.offsetWidth / 2, y: L.o.y + L.o.h / 2 }; };

// ---------- the 3D glass orb ----------
const OR = 512, orbCanvas = document.createElement('canvas');
const ren = new THREE.WebGLRenderer({ canvas: orbCanvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
ren.setPixelRatio(1); ren.setSize(OR, OR, false); ren.setClearColor(0x000000, 0); ren.outputColorSpace = THREE.SRGBColorSpace;
ren.toneMapping = THREE.NeutralToneMapping; ren.toneMappingExposure = 1;   // ACES pushes saturated blue toward violet
const oScene = new THREE.Scene(), oCam = new THREE.PerspectiveCamera(22, 1, .1, 50); oCam.position.set(0, 0, 6.6); oCam.lookAt(0, 0, 0);
const pmrem = new THREE.PMREMGenerator(ren); oScene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; pmrem.dispose();
const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.MeshPhysicalMaterial({ color: '#0030C8', metalness: 0, roughness: .2,
  clearcoat: 1, clearcoatRoughness: .03, transmission: .06, thickness: 1, ior: 1.45, envMapIntensity: .3, specularIntensity: 1 }));
oScene.add(ball);
const key = new THREE.PointLight('#FFFFFF', 22, 0, 2); oScene.add(key);
const rim = new THREE.PointLight('#8FB0FF', 0, 0, 2); oScene.add(rim);
const ORB = [0, 1].map(i => { const wrap = mk(WORLD, { width: 0, height: 0, zIndex: 5 });
  const halo = mk(wrap, { left: -100, top: -100, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(0,81,255,.32),rgba(0,81,255,.10) 55%,rgba(0,81,255,0))' });
  const c = i ? document.createElement('canvas') : orbCanvas; if (i) { c.width = c.height = OR; }
  Object.assign(c.style, { position: 'absolute', left: (-OR / 2) + 'px', top: (-OR / 2) + 'px', width: OR + 'px', height: OR + 'px' }); wrap.appendChild(c);
  return { wrap, halo, c }; });
function renderOrb(t, glow) {
  ball.rotation.set(.3 * Math.sin(t * .7), t * .6, 0);
  key.position.set(-3 + .8 * Math.sin(t * .5), 3, 4);
  rim.position.set(4 * Math.cos(t * 1.3), 1.5 * Math.sin(t * 1.3), 2.5); rim.intensity = 18 + 40 * glow;
  ren.render(oScene, oCam);
}
function placeOrb(o, x, y, d, haloK = 1) { const s = d / (OR * .52); const on = d > 1.5; vis(o.wrap, on); if (!on) return;
  put(o.wrap, { x, y }); o.c.style.transform = `scale(${s})`; put(o.halo, { s: (d / 200) * 2.2 * haloK }); }

// ---------- scene objects ----------
// S1/S2: the problem: three statements and the pile of real reports
const L1 = Line({ y: 250, h: 132, font: DISPLAY, words: ['Every', 'alert.'], tIn: T.w1, tOut: T.cam1, recede: T.pile, recedeY: 60 });
const L2 = Line({ y: 420, h: 132, font: DISPLAY, words: ['Every', 'entity.'], tIn: T.w2, tOut: T.cam1, recede: T.pile, recedeY: 60 });
const L3 = Line({ y: 590, h: 132, font: DISPLAY, words: ['Every', { pill: 'check.' }], tIn: T.w3, tOut: T.cam1, recede: T.pile, recedeY: 60 });
// pill "check." enters when the orb arrives: delay its own spring to chip1
L3.words[1].inn.dataset.t = T.chip1;
const CARDS = [[560, 180, 520, 170, .95], [560, 420, 520, 190, .9], [1300, 330, 520, 330, .85], [40, 200, 480, 400, .85], [560, 600, 520, 200, .9], [1300, 60, 560, 250, .85]]
  .map(([cx, cy, cw, ch, k], i) => { const el = crop(WORLD, cx, cy, cw, ch, k); return { el, w: cw * k, h: ch * k, i }; });
const CARD_SIDE = [[330, 330], [1590, 420], [360, 760], [1560, 760], [960, 900], [960, 160]];   // where they rest beside the type
const CARD_T = [T.c1, T.c2, T.c3, T.w4, T.w5, T.pile];
// S3: Meet Rachel*
const L4 = Line({ y: 70, h: 132, font: DISPLAY, words: ['Meet', { pill: 'Rachel*' }], tIn: T.drop, tOut: T.grow - .2, recede: T.list, recedeY: 20 });
const LB1 = Line({ y: 232, h: 40, font: LABEL, words: ['YOUR AI COMPLIANCE ANALYST'], tIn: T.sub, tOut: T.list, color: G600, ls: '.24em', sp: 'default' });
const RACH = mk(WORLD, { left: 960 - 520, top: 300, width: 1040, height: 1040 * 1093 / 1726, transformOrigin: '50% 50%' }, `<img src="assets/rachel_blue.webp" style="left:0;top:0;width:1040px">`);
// the selection frame around Rachel: a glowing outline that draws itself, then grows into the dashboard
const FR = { x: 960 - 520 + 1040 * .56, y: 300 + 20, w: 1040 * .4, h: 1040 * 1093 / 1726 - 40 };
const FRAME = mk(WORLD, { width: 10, height: 10 }, `<svg width="10" height="10" style="left:0;top:0;overflow:visible"><rect id="fr" x="0" y="0" width="10" height="10" fill="none" stroke="${BLUE}" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="filter:drop-shadow(0 0 6px rgba(0,81,255,.7))"/></svg>`);
const FRR = FRAME.querySelector('#fr');
const TAG = mk(WORLD, {}, `<div style="left:0;top:0;height:34px;padding:0 12px;background:${BLUE};color:#fff;font:600 20px/34px ${INTER};white-space:nowrap">Rachel · AI analyst</div>`);
// S4: the skills (the site's own list), centred, the active one large and blue with the orb as its bullet
const SKILLS = ['Adverse media monitoring', 'Sanctions and PEP alert reviews', 'Corporate registry analysis', 'UBO documents analysis', 'Narrative report writing'];
const LIST = mk(TYPE, { left: 0, top: 0, width: W, height: H });
const SK = SKILLS.map((s, i) => { const row = mk(LIST, { left: 0, top: 0, width: W, height: 90 }); row.className = 'fx';
  const tx = mk(row, { font: `700 64px/90px ${INTER}`, letterSpacing: '-.03em', whiteSpace: 'nowrap', transformOrigin: '50% 50%' }, s); tx.style.left = ''; tx.style.top = ''; return { row, tx }; });
// S5: the real dashboard
const DRIM = mk(WORLD, { filter: 'blur(14px)' }), DRIM2 = mk(WORLD, {});   // rim light layers sit behind the card
const DASH = mk(WORLD, { overflow: 'hidden', background: '#fff', boxShadow: '0 40px 100px rgba(4,21,42,.16),0 0 0 1px rgba(4,21,42,.06)' }, `<img src="assets/product_ui.webp" style="left:0;top:0;width:100%;height:100%">`);
const DW = 1640, DH = DW * 861 / 1898, DX = 960 - DW / 2, DY = 540 - DH / 2, DK = DW / 1898;
const SEC = [{ t: T.f1, x: 380, y: 300, w: 920, h: 170, label: 'Business activity risk' }, { t: T.f2, x: 380, y: 560, w: 760, h: 240, label: 'Address analysis' }]
  .map(s => { const el = mk(WORLD, { width: 10, height: 10 }, `<svg width="10" height="10" style="left:0;top:0;overflow:visible"><rect x="0" y="0" width="${s.w * DK}" height="${s.h * DK}" rx="6" fill="rgba(0,81,255,.04)" stroke="${BLUE}" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="filter:drop-shadow(0 0 6px rgba(0,81,255,.7))"/></svg><div class="lb" style="left:0;top:-42px;height:34px;padding:0 12px;background:${BLUE};color:#fff;font:600 20px/34px ${INTER};white-space:nowrap">${s.label}</div>`);
    put(el, { x: DX + s.x * DK, y: DY + s.y * DK }); return { ...s, el, r: el.querySelector('rect'), lb: el.querySelector('.lb') }; });
// S6: the ring of checks around the big orb, with a light travelling round it
const RINGTXT = 'AML · KYB · KYC · SANCTIONS · ADVERSE MEDIA · UBO · REGISTRY · ';
const RING = mk(WORLD, { left: 960 - 250, top: 430 - 250, width: 500, height: 500, transformOrigin: '50% 50%' },
  `<svg width="500" height="500" viewBox="0 0 500 500" style="left:0;top:0"><defs><path id="rc" d="M250 250 m-215 0 a215 215 0 1 1 430 0 a215 215 0 1 1 -430 0"/></defs><text font-family="Inter" font-weight="600" font-size="22" letter-spacing="5" fill="${NAVY}"><textPath href="#rc" textLength="1340">${RINGTXT}</textPath></text></svg>`);
const RLIGHT = mk(WORLD, { left: 960 - 262, top: 430 - 262, width: 524, height: 524, borderRadius: '50%', transformOrigin: '50% 50%',
  WebkitMaskImage: 'radial-gradient(closest-side,transparent 94%,#000 95%,#000 100%)', maskImage: 'radial-gradient(closest-side,transparent 94%,#000 95%,#000 100%)', filter: 'drop-shadow(0 0 10px rgba(0,81,255,.8))' });
const L5 = Line({ y: 780, h: 132, font: DISPLAY, words: ['Explainable.', { pill: 'Audited.' }], tIn: T.expl, tOut: T.ringOut });
// S7: the dot field with a wave of blue light running through it
const FIELD = document.createElement('canvas'); FIELD.width = W; FIELD.height = 560; Object.assign(FIELD.style, { position: 'absolute', left: '0px', top: '0px' }); WORLD.appendChild(FIELD);
const fctx = FIELD.getContext('2d');
const L6 = Line({ y: 190, h: 132, font: DISPLAY, words: ['Every', 'decision,', { pill: 'explained.' }], tIn: T.fw1, tOut: T.cam3 });
// S8: Superpower for compliance teams (the site's headline) with Rachel at work
const L7 = Line({ y: 110, h: 132, font: DISPLAY, words: ['Superpower'], tIn: T.sup, tOut: T.cam4 });
const LB2 = Line({ y: 262, h: 60, font: SUPPORT, words: ['for compliance teams.'], tIn: T.sup + .25, tOut: T.cam4, color: G600, ls: '-.01em', sp: 'default' });
const RL = mk(WORLD, { left: 960 - 680, top: 360, width: 1360, height: 1360 * 1437 / 2429, transformOrigin: '50% 50%' }, `<img src="assets/rachel_laptop.webp" style="left:0;top:0;width:1360px">`);
// S9: the real logo (mark and wordmark as two windows on the same file), Book a Demo, cursor
const LG = { w: 860, h: 860 * 24 / 170 }; LG.x = 960 - LG.w / 2; LG.y = 380; const LK = LG.w / 170;
const MARK = mk(WORLD, { left: LG.x, top: LG.y, width: 46 * LK, height: LG.h, overflow: 'hidden', transformOrigin: '50% 50%' }, `<img src="assets/logo.svg" style="left:0;top:0;width:${LG.w}px;height:${LG.h}px">`);
const WORD = mk(WORLD, { left: LG.x + 46 * LK, top: LG.y, width: LG.w - 46 * LK, height: LG.h, overflow: 'hidden' }, `<img src="assets/logo.svg" style="left:${-46 * LK}px;top:0;width:${LG.w}px;height:${LG.h}px">`);
const LOOPS = [[LG.x + 10.5 * LK, LG.y + LG.h / 2], [LG.x + 31.5 * LK, LG.y + LG.h / 2]];
const CTA = mk(WORLD, { left: 960 - 200, top: 640, width: 400, height: 100, transformOrigin: '50% 50%' },
  `<div class="rg" style="left:-10px;top:-10px;width:420px;height:120px;border-radius:24px;filter:blur(12px)"></div><div class="rm" style="left:-3px;top:-3px;width:406px;height:106px;border-radius:19px"></div><div style="left:0;top:0;width:400px;height:100px;border-radius:16px;background:${BLUE};box-shadow:0 18px 40px rgba(0,81,255,.3)"></div><div class="fx" style="left:0;top:0;width:400px;height:100px"><div style="font:600 36px/1 ${INTER};color:#fff">Book a Demo  →</div></div>`);
const CRG = CTA.querySelector('.rg'), CRM = CTA.querySelector('.rm');
const LB3 = Line({ y: 800, h: 40, font: LABEL, words: ['SUPERPOWER FOR COMPLIANCE TEAMS'], tIn: T.cta + .3, tOut: 999, color: G600, ls: '.24em', sp: 'default' });
const CUR = mk(WORLD, { width: 44, height: 62, zIndex: 6 }, `<svg width="44" height="62" viewBox="0 0 28 40" style="left:0;top:0;overflow:visible"><path d="M3 2 L3 30 L10 24 L15 36 L20 34 L15 22 L24 22 Z" fill="${NAVY}" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>`);

// ---------- the orb's journey (keys need laid-out positions, built once on the first seek) ----------
let OX, OY, OD;
function orbKeys() {
  const pc = wordCentre(L3, 1), rc = wordCentre(L4, 1);
  const k = [
    { t: 0, x: 960, y: 540, d: 220 }, { t: b(.35), x: 960, y: 860, d: 70, sp: GLIDE },
    { t: T.chip1 - .25, x: pc.x, y: pc.y, d: 70, sp: 'default' }, { t: T.chip1, d: 0, sp: 'snappy' },
    { t: T.lift, d: 70, sp: 'snappy' }, { t: T.lift + .3, x: 960, y: 140, sp: GLIDE },
    { t: T.cam1 - .1, x: 960, y: 540, d: 170, sp: 'default' },
    { t: T.chipR - .15, x: rc.x, y: rc.y, d: 80, sp: 'snappy' }, { t: T.chipR + .05, d: 0, sp: 'snappy' },
    { t: T.grow, x: FR.x, y: FR.y, d: 0, sp: 'default' },
    { t: T.cam2, x: 960, y: 430, d: 0 }, { t: T.cam2 + .05, d: 300, sp: 'heavy' },
    { t: T.ringOut, x: 960, y: 640, d: 96, sp: 'default' }, { t: T.cam3, x: 960, y: 440, d: 52, sp: GLIDE },
    { t: T.split, x: LOOPS[0][0], y: LOOPS[0][1], d: 70, sp: 'default' }, { t: T.logo + .1, d: 0, sp: 'snappy' }];
  OX = K(k, 'x'); OY = K(k, 'y'); OD = K(k, 'd');
}
const activeIdx = t => { let i = -1; T.act.forEach((a, j) => { if (t >= a - .15) i = j; }); return i; };

window.seek = function (t) {
  if (!OX) orbKeys();
  camera(t); sweep(t); LINES.forEach(f => f(t));
  // the "check." and "Rachel*" pills grow out of the orb as it arrives
  [[L3, T.chip1], [L4, T.chipR]].forEach(([L, tc]) => { const w = L.words[1]; const g = S(t, tc - .05, 'snappy'); const v = S(t, L.o.tOut + .05, 'snappy');
    w.inn.style.transform = `translateY(${-v * L.o.h * 1.1}px) scale(${g})`; vis(w.inn, g > .01 && L.box.style.visibility !== 'hidden'); });
  // cards: they arrive beside the type on arcs, then the pile: they stack in the centre over the receding type, then the orb swallows them
  CARDS.forEach((c, i) => { const e = S(t, CARD_T[i], 'default'), pl = S(t, T.pile + .12 * i, GLIDE), sw = S(t, T.cam1 - .2 + .04 * i, 'snappy');
    const [sx, sy] = CARD_SIDE[i], px = 960 + (i - 2.5) * 26, py = 540 + (i - 2.5) * 18;
    const x = lerp(lerp(sx + (i % 2 ? 500 : -500), sx, e), px, pl), y = lerp(lerp(sy + 300, sy, e), py, pl) - 30 * Math.sin(Math.PI * e) * (1 - pl);
    const s = (1 - sw) * lerp(.85, 1, pl) * e; vis(c.el, s > .01); c.el.style.transformOrigin = '50% 50%';
    c.el.style.filter = pl < .5 ? `blur(${3 * (1 - pl)}px)` : 'none';
    put(c.el, { x: lerp(x, 960, sw) - c.w / 2, y: lerp(y, 540, sw) - c.h / 2 + 5 * Math.sin(t * 1.7 + i), s, rot: lerp((i % 2 ? 4 : -4), (i - 2.5) * 1.5, pl) }); });
  // Rachel: rises on the drop, recedes behind the skills list, gives way to the dashboard
  const rr = S(t, T.rachel, 'heavy'), rrec = S(t, T.list, 'heavy'), rout = S(t, T.grow, 'snappy');
  vis(RACH, rr > .01 && rout < .99); put(RACH, { y: (1 - rr) * 500 + 6 * Math.sin(t * 1.3), s: (1 - .3 * rrec) * (1 - .5 * rout) });
  RACH.style.filter = rrec > .02 ? `blur(${10 * rrec}px)` : 'none'; RACH.style.opacity = 1 - .7 * rrec;
  // the selection frame draws itself around Rachel, then grows into the real dashboard
  const fd = clamp(S(t, T.frame, { k: 30, c: 11 })), gr = S(t, T.grow, 'default'), col = S(t, T.cam2 - .3, 'default');
  const fx = lerp(FR.x, DX, gr), fy = lerp(FR.y, DY, gr) + (1 - rr) * 500, fw = lerp(FR.w, DW, gr), fh = lerp(FR.h, DH, gr);
  vis(FRAME, fd > .01 && gr < .995); put(FRAME, { x: fx, y: fy }); FRR.setAttribute('width', fw); FRR.setAttribute('height', fh); FRR.style.strokeDashoffset = 1 - fd;
  FRAME.style.opacity = 1 - rrec * .6 * (1 - gr);
  const tg = S(t, T.frame + .4, 'snappy') * (1 - S(t, T.list, 'snappy')); vis(TAG, tg > .01); TAG.style.transformOrigin = '0 100%'; put(TAG, { x: FR.x, y: FR.y - 34 + (1 - rr) * 500, s: tg });
  // dashboard: the frame becomes the card; at the turn it collapses into the orb
  const dv = gr > .02 && col < .995; vis(DASH, dv); vis(DRIM, false); vis(DRIM2, false);
  if (dv) { const s = 1 - col, w = fw * s, h = fh * s, x = lerp(fx, 960 - w / 2, col), y = lerp(fy, 430 - h / 2, col);
    Object.assign(DASH.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', borderRadius: (18 + 200 * col) + 'px' });
    DASH.firstChild.style.opacity = clamp((gr - .3) / .4);
    const ri = Math.max(bump(t, T.grow + .5, .6), bump(t, T.f2 + .4, .6)) * (1 - col);
    [[DRIM, 8], [DRIM2, 3]].forEach(([e, d]) => { if (vis(e, ri > .01)) Object.assign(e.style, { left: (x - d) + 'px', top: (y - d) + 'px', width: (w + 2 * d) + 'px', height: (h + 2 * d) + 'px', borderRadius: (18 + d) + 'px', background: rimConic(160 * t), opacity: ri }); }); }
  SEC.forEach(s => { const d = clamp(S(t, s.t, { k: 30, c: 11 })), o = S(t, T.cam2 - .5, 'snappy'); vis(s.el, d > .01 && o < .99 && dv);
    s.r.style.strokeDashoffset = 1 - d; s.lb.style.transformOrigin = '0 100%'; s.lb.style.transform = `scale(${S(t, s.t + .3, 'snappy')})`; s.el.style.opacity = 1 - o; });
  // the skills list: centred, active line large and blue, the rest small and grey; the list rolls so the active line sits at the centre
  const lon = S(t, T.list, 'heavy') * (1 - S(t, T.grow, 'snappy')); vis(LIST, lon > .01);
  if (lon > .01) { const ai = activeIdx(t), roll = track(t, [{ t: 0, v: 0 }, ...T.act.map((a, j) => ({ t: a - .15, v: j, spring: 'default' }))]);
    // each line lights on its own beat and dims on the next one, both on springs (a colour switch in one frame reads as a pop)
    SK.forEach((k, i) => { const d = i - roll, on = clamp(S(t, T.act[i] - .15, 'snappy') - (i < 4 ? S(t, T.act[i + 1] - .15, 'snappy') : 0));
      put(k.row, { y: 515 + d * 96 + (1 - lon) * 120 }); k.row.style.opacity = lon * clamp(1 - Math.abs(d) * .28);
      k.tx.style.color = `rgb(${Math.round(lerp(163, 0, on))},${Math.round(lerp(171, 81, on))},${Math.round(lerp(184, 255, on))})`; k.tx.style.transform = `scale(${.6 + .4 * on})`; }); }
  // the ring around the big orb, with a light that travels round it
  const rg = S(t, T.ring, 'default') * (1 - S(t, T.ringOut, 'snappy')); vis(RING, rg > .01); vis(RLIGHT, rg > .01);
  put(RING, { rot: -(t - T.ring) * 22, s: .8 + .2 * rg }); RING.style.opacity = rg; RLIGHT.style.background = rimConic(140 * t); put(RLIGHT, { s: .8 + .2 * rg }); RLIGHT.style.opacity = rg * .9;
  // dot field: rises, a wave of blue light runs through it
  const fu = S(t, T.field, 'heavy') * (1 - S(t, T.cam3, 'snappy')); vis(FIELD, fu > .01);
  if (fu > .01) { put(FIELD, { y: 600 + (1 - fu) * 500 }); fctx.clearRect(0, 0, W, 560); const wx = ((t - T.field) * 420) % 2600 - 300;
    for (let r = 0; r < 26; r++) for (let c = 0; c < 96; c++) { const x = c * 20 + 10, y = r * 20 + 10 + 30 * Math.sin(c * .09 + t * 1.2) * (1 - r / 30);
      const crest = 1 - y / 560, lit = Math.exp(-((x - wx) ** 2) / 26000); fctx.globalAlpha = (.35 + .55 * lit) * clamp(1.5 - r / 24);
      fctx.fillStyle = lit > .3 ? BLUE : '#5C7FD0'; fctx.beginPath(); fctx.arc(x, y, 3.2 + 2.4 * lit * crest, 0, 7); fctx.fill(); } fctx.globalAlpha = 1; }
  // Superpower: Rachel at work rises under the headline
  const ru = S(t, T.rachel2, 'heavy') * (1 - S(t, T.cam4, 'snappy')); vis(RL, ru > .01); put(RL, { y: (1 - ru) * 400 + 6 * Math.sin(t * 1.2), s: .92 + .08 * ru });
  // the logo: the two orbs land on the two loops, the mark appears, the wordmark wipes on
  const mk2 = S(t, T.logo, 'snappy'); vis(MARK, mk2 > .01); put(MARK, { s: mk2 });
  const wu = S(t, T.word, 'heavy'); vis(WORD, wu > .01); WORD.style.clipPath = `inset(0 ${(1 - wu) * 100}% 0 0)`;
  const ce = S(t, T.cta, 'snappy'); vis(CTA, ce > .01); put(CTA, { s: ce * (1 - .05 * (S(t, T.click, 'snappy') - S(t, T.click + .12, 'snappy'))) });
  const cri = Math.max(bump(t, T.cta + .4, .7), bump(t, T.click, .7)) * .9 + .1 * ce; CRG.style.background = CRM.style.background = rimConic(160 * t); CRG.style.opacity = CRM.style.opacity = cri;
  const cu = S(t, T.curIn, 'default'); vis(CUR, cu > .01); put(CUR, { x: lerp(1500, 1035, cu), y: lerp(980, 700, cu) + 3 * Math.sin(t * 2), s: 1 - .14 * (S(t, T.click, 'snappy') - S(t, T.click + .12, 'snappy')) });
  // the orb (and its twin at the end)
  const glow = Math.max(bump(t, T.drop, .6), bump(t, T.cam2, .8), bump(t, T.split, .6));
  renderOrb(t, glow);
  const split = S(t, T.split, 'default');
  placeOrb(ORB[0], OX(t), OY(t) + 6 * Math.sin(t * 2.1), OD(t), 1 + glow);
  const ctx2 = ORB[1].c.getContext('2d'); ctx2.clearRect(0, 0, OR, OR); if (split > .01) ctx2.drawImage(orbCanvas, 0, 0);
  placeOrb(ORB[1], lerp(OX(t), LOOPS[1][0], split), lerp(OY(t), LOOPS[1][1], split) + 6 * Math.sin(t * 2.1 + 1), split > .01 ? OD(t) : 0, 1 + glow);
};

await Promise.all([document.fonts.load("700 100px 'Inter'"), document.fonts.load("600 30px 'Inter'"), document.fonts.load("500 40px 'Inter'"),
  ...['product_ui.webp', 'rachel_blue.webp', 'rachel_laptop.webp', 'logo.svg'].map(n => loadImg('assets/' + n))]);
await document.fonts.ready;
window.seek(0);
window.__ready = true;
