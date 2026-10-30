// DRIP VERSE, "One order" v2: the revest reference's 71 s story rebuilt as ONE continuous take.
// One camera for the whole film (spring keys + a centred sway, never linear, never reset), one carrier card that morphs through
// every scene (shoe -> photo -> catalogue -> map -> light pool -> product page -> ... -> the drop mark), centred flex type on a
// strict 3-level scale, and moving gold light: rim passes, light sweeps, light pools, glowing lines, an orbiting ring.
// Shop UI is a stand-in (no prices, no stock numbers). Every frame is a pure function of t.
const { spring, track, swapAlpha, clamp, lerp, mulberry32 } = Motion;
const W = 1920, H = 1080, END = 71.2667;
const INK = '#121214', BONE = '#F3EFE8', STONE = '#ECE6DC', PAPER = '#FFFDF9';
const GRAD = 'linear-gradient(135deg,#E2C48A 0%,#B8904F 55%,#8E6A31 100%)';
const GEIST = "'Geist', system-ui, sans-serif", BOD = "'Bodoni', 'Times New Roman', serif";
const STAGE = document.getElementById('stage');
const S = (t, t0, p = 'default') => spring(t - t0, p);
const SLOW = { k: 4, c: 4 }, SOFT = { k: 120, c: 20 };

const css = document.createElement('style');
css.textContent = `@font-face{font-family:'Bodoni';src:url(assets/fonts/bodoni-normal.woff2) format('woff2');font-weight:400 900;font-style:normal}
@font-face{font-family:'Geist';src:url(assets/fonts/geist.woff2) format('woff2');font-weight:100 900}
#stage *{position:absolute;box-sizing:border-box;margin:0;padding:0}
#stage .fx{display:flex;justify-content:center;align-items:center}
#stage .fx *{position:relative;display:block}`;
document.head.appendChild(css);
const SHOES = { 'adidas-niteball': [579, 365], 'axel-arigato': [688, 394], 'nb-550': [390, 304], 'nb-480': [577, 470], 'nike-af1': [707, 607], 'nike-zoom': [405, 307] };
const PH = ['nb-550', 'jordan-4', 'asics-kayano'];
const ld = s => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = s; });
window.__preload = [document.fonts.load("600 100px 'Bodoni'"), document.fonts.load("600 30px 'Geist'"), document.fonts.load("400 30px 'Geist'"), document.fonts.load("500 30px 'Geist'"),
  ...Object.keys(SHOES).map(n => ld(`assets/cut/${n}_c.png`)), ...PH.map(n => ld(`assets/photos/${n}.jpg`))];

// ---------- type scale: three levels only ----------
const DISPLAY = `600 150px/1 ${BOD}`, SUPPORT = `400 42px/1 ${GEIST}`, LABEL = `600 24px/1 ${GEIST}`;

// ---------- helpers ----------
const PXK = new Set(['left', 'top', 'width', 'height', 'borderRadius']);
function mk(parent, o = {}, html) {
  const e = document.createElement('div'); e.style.left = '0px'; e.style.top = '0px';
  for (const k in o) e.style[k] = (PXK.has(k) && typeof o[k] === 'number') ? o[k] + 'px' : o[k];
  if (html != null) e.innerHTML = html; parent.appendChild(e); return e;
}
const put = (e, o) => { e.style.transform = `translate(${o.x || 0}px,${o.y || 0}px) rotate(${o.rot || 0}deg) skewX(${o.skx || 0}deg) scale(${o.sx ?? o.s ?? 1},${o.sy ?? o.s ?? 1})`; };
const vis = (e, on) => { e.style.visibility = on ? 'visible' : 'hidden'; return on; };
const bump = (t, t0, hold = .5) => clamp(S(t, t0, 'snappy') - S(t, t0 + hold, SOFT));        // light rises, then dies away
// a value keyed over time: keys = [{t, prop: v, sp}], one spring per change, never restarted (track)
function keyed(keys, prop, def = 'default') {
  const K = keys.filter(k => k[prop] !== undefined).map(k => ({ t: k.t, v: k[prop], spring: k.sp || def }));
  return t => track(t, K);
}
const shoeImg = (n, w) => { const [iw, ih] = SHOES[n], h = w * ih / iw; return `<img src="assets/cut/${n}_c.png" style="left:${-w / 2}px;top:${-h / 2}px;width:${w}px;height:${h}px;filter:drop-shadow(0 26px 26px rgba(60,44,20,.26))">`; };
const DROPW = (s = 1) => `<svg width="${60 * s}" height="${86 * s}" viewBox="0 0 60 86" style="left:${-30 * s}px;top:${-46 * s}px"><path d="M30 2 C 24 26 6 42 6 60 a24 24 0 0 0 48 0 C 54 42 36 26 30 2z" fill="#FFF9EE"/></svg>`;
const DROPB = (s, id) => `<svg width="${60 * s}" height="${86 * s}" viewBox="0 0 60 86" style="left:0;top:0;overflow:visible"><defs><linearGradient id="dg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EAD5A8"/><stop offset=".45" stop-color="#C39A57"/><stop offset="1" stop-color="#7E5A26"/></linearGradient></defs><path d="M30 2 C 24 26 6 42 6 60 a24 24 0 0 0 48 0 C 54 42 36 26 30 2z" fill="url(#dg${id})"/><ellipse cx="21" cy="58" rx="6" ry="11" fill="#fff" opacity=".5" transform="rotate(16 21 58)"/></svg>`;
const ICON = { box: '<path d="M8 20 L32 8 L56 20 L56 46 L32 58 L8 46Z M8 20 L32 32 L56 20 M32 32 L32 58" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>',
  check: '<path d="M14 33 l12 12 l24 -26" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
  bag: '<path d="M14 22 h36 l-3 34 h-30z M24 22 a8 8 0 0 1 16 0" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>',
  card: '<rect x="8" y="16" width="48" height="32" rx="6" fill="none" stroke="#fff" stroke-width="4"/><path d="M8 26 h48" stroke="#fff" stroke-width="4"/>',
  receipt: '<path d="M16 8 h32 v48 l-6 -4 -5 4 -5 -4 -5 4 -5 -4 -6 4z M22 20 h20 M22 30 h20 M22 40 h12" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>' };
const svgIcon = (k, s) => `<svg width="${s}" height="${s}" viewBox="0 0 64 64" style="left:${-s / 2}px;top:${-s / 2}px">${ICON[k]}</svg>`;
const chipHTML = (txt, icon = 'check', dim = false) => `<div style="left:0;top:0;transform:translate(-50%,-50%);height:76px;padding:0 30px 0 84px;border-radius:38px;background:${PAPER};box-shadow:0 14px 30px rgba(60,48,30,.14);font:600 28px/76px ${GEIST};color:${INK};white-space:nowrap;opacity:${dim ? .72 : 1}"><div style="left:12px;top:12px;width:52px;height:52px;border-radius:26px;background:${GRAD}"><svg width="52" height="52" viewBox="0 0 64 64" style="left:0;top:0">${ICON[icon]}</svg></div>${txt}</div>`;

// ---------- layers: background, bokeh, world (camera), type (screen space), hud, light sweep ----------
const BG = mk(STAGE, { width: W, height: H, background: 'radial-gradient(120% 100% at 50% 45%,#FAF7F1 0%,#EFE8DC 70%,#E6DCCB 100%)' });
const BGW = mk(STAGE, { width: W, height: H, background: 'radial-gradient(110% 90% at 50% 42%,#FCF7EE 0%,#F1E4CB 62%,#E2CDA6 100%)' });
const BOKEH = mk(STAGE, { width: W, height: H });
const WORLD = mk(STAGE, { width: W, height: H, transformOrigin: '0 0' });
const TYPE = mk(STAGE, { width: W, height: H });
const HUD = mk(STAGE, { width: W, height: H });
const SWEEP = mk(STAGE, { left: -450, top: -700, width: 900, height: 2480, transformOrigin: '50% 50%',
  background: 'linear-gradient(90deg,rgba(230,190,110,0) 0%,rgba(230,190,110,.22) 30%,rgba(255,236,196,.55) 50%,rgba(230,190,110,.22) 70%,rgba(230,190,110,0) 100%)' });

// ---------- the camera: spring keys (zoom, framing) + a sway that always returns to centre ----------
const CAMK = [
  { t: 0, z: 1, y: 0 }, { t: .05, z: 1.05, sp: SLOW }, { t: 2.3, z: 1 }, { t: 2.6, z: 1.06, sp: SLOW }, { t: 3.5, z: .98 }, { t: 3.8, z: 1.04, sp: SLOW },
  { t: 5.0, z: 1 }, { t: 5.3, z: 1.07, sp: SLOW }, { t: 7.0, z: 1.02 }, { t: 7.3, z: 1.08, sp: SLOW }, { t: 8.0, z: 1 }, { t: 8.3, z: 1.05, sp: SLOW },
  { t: 10, z: 1.02 }, { t: 10.3, z: 1.08, sp: SLOW }, { t: 12, z: 1 }, { t: 12.3, z: 1.06, sp: SLOW },
  { t: 13.0, z: 1.12, sp: 'snappy' }, { t: 13.12, z: 1 }, { t: 13.4, z: 1.05, sp: SLOW }, { t: 16.3, z: 1 }, { t: 16.6, z: 1.07, sp: SLOW },
  { t: 20.5, z: 1 }, { t: 20.8, z: 1.06, sp: SLOW }, { t: 25, z: 1 }, { t: 25.3, z: 1.05, sp: SLOW }, { t: 28, z: 1 }, { t: 28.3, z: 1.07, sp: SLOW },
  { t: 30, z: 1 }, { t: 30.3, z: 1.05, sp: SLOW }, { t: 32, z: 1 }, { t: 32.3, z: 1.05, sp: SLOW }, { t: 35.5, z: 1 }, { t: 35.8, z: 1.06, sp: SLOW },
  { t: 39.2, z: 1 }, { t: 39.5, z: 1.05, sp: SLOW }, { t: 42, z: 1, y: 110 }, { t: 42.3, z: 1.05, sp: SLOW },
  { t: 44.5, z: .42, sp: { k: 9, c: 6 } }, { t: 49, z: 1, y: 0 }, { t: 49.3, z: 1.07, sp: SLOW },
  { t: 56, z: 1 }, { t: 56.3, z: 1.05, sp: SLOW }, { t: 58.5, z: 1 }, { t: 58.8, z: 1.05, sp: SLOW }, { t: 62.5, z: 1 }, { t: 62.8, z: 1.04, sp: SLOW }];
const camZ = keyed(CAMK, 'z'), camY = keyed(CAMK, 'y');
const swayA = t => 1 - .82 * S(t, 64.6, 'heavy');                      // the lockup settles almost exactly on centre
function camera(t) {
  const a = swayA(t), sx = a * 16 * Math.sin(t * 2 * Math.PI / 6.4), sy = a * 9 * Math.sin(t * 2 * Math.PI / 4.7 + 1), r = a * .3 * Math.sin(t * 2 * Math.PI / 8.3);
  const z = camZ(t) * (1 + .012 * Math.sin(t * 2 * Math.PI / 9));
  WORLD.style.transform = `translate(${960 + sx}px,${540 + sy}px) rotate(${r}deg) scale(${z}) translate(-960px,${-540 - camY(t)}px)`;
  TYPE.style.transform = `translate(${sx * .5}px,${sy * .5}px)`; HUD.style.transform = TYPE.style.transform;
  BOKEH.style.transform = `translate(${sx * .3}px,${sy * .3}px)`;
}

// ---------- gold light pool (under the hero object), breathing ----------
const POOL = mk(WORLD, { width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(226,178,92,.78),rgba(226,178,92,.32) 48%,rgba(226,178,92,0) 100%)' });
const PK = [{ t: 0, x: 960, y: 720, w: 560, i: 0 }, { t: .2, i: 1 }, { t: 2.3, i: 0 }, { t: 6.95, x: 960, y: 830, w: 900, i: 1 }, { t: 8.0, i: 0 },
  { t: 35.5, x: 960, y: 420, w: 420, i: .8 }, { t: 39.2, i: 0 }, { t: 42.0, x: 960, y: 880, w: 760, i: .9 }, { t: 44.5, y: 1010, w: 1500, sp: { k: 9, c: 6 } }, { t: 49.0, x: 960, y: 540, w: 640, i: .7 }, { t: 56.0, i: 0 },
  { t: 62.5, x: 960, y: 400, w: 520, i: 1 }];
const poolX = keyed(PK, 'x'), poolY = keyed(PK, 'y'), poolW = keyed(PK, 'w'), poolI = keyed(PK, 'i');
function pool(t) { const px = t < 2.6 ? gapX('open') : poolX(t), w = poolW(t) * (1 + .05 * Math.sin(t * 2.2)), h = w * .32, i = clamp(poolI(t)) * (.85 + .15 * Math.sin(t * 3.1));
  POOL.style.width = w + 'px'; POOL.style.height = h + 'px'; put(POOL, { x: px - w / 2, y: poolY(t) - h / 2 }); POOL.style.opacity = i; vis(POOL, i > .01); }

// ---------- background bokeh drops (depth) ----------
const BK = (() => { const r = mulberry32(9), P = [[120, 160], [1780, 220], [240, 900], [1700, 860], [70, 560], [1860, 560], [520, 60], [1420, 1010]];
  return P.map(([x, y], i) => { const s = 1.2 + r() * 1.6; return { x, y, s, ph: r() * 6, el: mk(BOKEH, { width: 60 * s, height: 86 * s, filter: `blur(${4 + r() * 5}px)`, opacity: .55 }, DROPB(s, 50 + i)) }; }); })();
function bokeh(t) { const on = S(t, 13.1, 'heavy'); BK.forEach((d, i) => { put(d.el, { x: d.x + 30 * Math.sin(t * .35 + d.ph), y: d.y + (1 - on) * (i % 2 ? 300 : -300) + 20 * Math.sin(t * .5 + d.ph), rot: 10 * Math.sin(t * .3 + d.ph) }); vis(d.el, on > .01); }); }
function bgWipe(t) { const r = 2300 * S(t, 12.85, { k: 30, c: 11 }); BGW.style.clipPath = `circle(${r}px at 960px 860px)`; vis(BGW, r > 1); }

// ---------- the light sweep that carries every scene change ----------
const SWEEPS = [2.4, 4.9, 7.9, 12.9, 20.4, 24.9, 29.9, 35.4, 44.4, 48.9, 55.9, 62.4];
function sweep(t) { let ts = -9; for (const s of SWEEPS) if (s <= t) ts = s; const u = t - ts;
  if (!vis(SWEEP, u >= 0 && u < 2.2)) return; const p = S(t, ts, { k: 16, c: 8 });
  put(SWEEP, { x: lerp(-700, 2600, p), rot: 18 }); SWEEP.style.opacity = 1 - S(t, ts + .5, SOFT); }

// ---------- the carrier card ----------
const CK = [
  { t: 0, x: 960, y: 540, w: 300, h: 180, r: 40, g: 0, rot: 0, skx: 0, sy: 1, s: 0, bl: 0 }, { t: 2.2, s: 1, sp: 'snappy' }, { t: 2.3, w: 560, h: 700, r: 34 },
  { t: 3.5, w: 1560, h: 880, r: 30 }, { t: 5.0, w: 1700, h: 940 }, { t: 6.95, w: 760, h: 70, r: 35, y: 830, g: 1, bl: 16 }, { t: 8.0, w: 1520, h: 860, r: 30, y: 540, g: 0, bl: 0 },
  { t: 10.0, w: 820, h: 440, r: 34 }, { t: 12.0, w: 700, h: 800, r: 40 },
  { t: 13.15, w: 1300, h: 720, r: 30, y: 720, rot: -5, skx: 14, sy: .78, s: .72 }, { t: 16.3, y: 580, rot: -2, skx: 6, sy: .92, s: 1 },
  { t: 20.5, w: 170, h: 170, r: 48, x: 700, y: 440, rot: 0, skx: 0, sy: 1, g: 1 }, { t: 25.0, w: 1440, h: 760, r: 30, x: 960, y: 540, g: 0 },
  { t: 28.0, w: 560, h: 700, r: 34, y: 500 }, { t: 30.0, w: 680, h: 440, y: 540 }, { t: 32.0, w: 420, h: 300, r: 28 }, { t: 34.0, s: .62, bl: 12 },
  { t: 35.5, w: 130, h: 130, r: 65, g: 1, s: 1, bl: 0, y: 420 }, { t: 39.2, w: 1320, h: 760, r: 30, g: 0, y: 540 }, { t: 42.0, w: 560, h: 400, y: 650 }, { t: 44.5, s: 1.6, sp: { k: 9, c: 6 } },
  { t: 49.0, w: 340, h: 340, r: 170, y: 540, s: 1 }, { t: 56.0, w: 2080, h: 1180, r: 0 }, { t: 58.5, w: 520, h: 680, r: 34, y: 650 },
  { t: 62.5, w: 130, h: 130, r: 65, g: 1, y: 400 }];
const C = {}; ['x', 'y', 'w', 'h', 'r', 'g', 'rot', 'skx', 'sy', 's', 'bl'].forEach(p => C[p] = keyed(CK, p));
const RIMG = mk(WORLD, { filter: 'blur(16px)' }), RIM = mk(WORLD, {});
const CARD = mk(WORLD, { background: PAPER, overflow: 'hidden', boxShadow: '0 30px 80px rgba(60,48,30,.2)' });
const GOLD = mk(CARD, { width: '100%', height: '100%', background: GRAD });
const CONTENT = [];
function content(w, h, tIn, tOut, html, upd) { const el = mk(CARD, { width: w, height: h }, html); CONTENT.push({ el, w, h, tIn, tOut, upd }); return el; }
const PASSES = [2.6, 3.8, 5.3, 8.3, 10.3, 12.3, 16.6, 25.3, 28.3, 30.3, 39.5, 42.3, 43.7, 49.3, 58.8];
const rimConic = a => `conic-gradient(from ${a}deg,rgba(226,182,98,0) 0deg,rgba(226,182,98,0) 200deg,#D9B26A 280deg,#FFF1D2 305deg,#D9B26A 330deg,rgba(226,182,98,0) 360deg)`;
function card(t) {
  const w = C.w(t), h = C.h(t), x = C.x(t), y = C.y(t), r = Math.max(0, C.r(t)), s = C.s(t), on = s > .005;
  const tf = el => { el.style.transformOrigin = '50% 50%'; put(el, { rot: C.rot(t), skx: C.skx(t), sx: s, sy: s * C.sy(t) }); };
  const geo = (el, d) => { el.style.left = (x - w / 2 - d) + 'px'; el.style.top = (y - h / 2 - d) + 'px'; el.style.width = (w + 2 * d) + 'px'; el.style.height = (h + 2 * d) + 'px'; el.style.borderRadius = (r + d) + 'px'; tf(el); };
  vis(CARD, on); geo(CARD, 0); CARD.style.filter = C.bl(t) > .2 ? `blur(${C.bl(t)}px)` : 'none'; GOLD.style.opacity = clamp(C.g(t));
  let ri = 0; for (const p of PASSES) ri = Math.max(ri, bump(t, p, .6)); ri *= 1 - clamp(C.g(t));
  const ang = 150 * t; [RIM, RIMG].forEach((e, k) => { vis(e, on && ri > .01); if (ri > .01) { geo(e, k ? 8 : 3); e.style.background = rimConic(ang); e.style.opacity = k ? ri * .9 : ri; } });
  for (const c of CONTENT) { const a = swapAlpha(t, c.tIn, c.tOut); c.el.style.display = on && a > 0 ? 'block' : 'none'; if (!(on && a > 0)) continue;
    c.el.style.left = ((w - c.w) / 2) + 'px'; c.el.style.top = ((h - c.h) / 2 + (1 - a) * 14) + 'px'; c.el.style.opacity = a; if (c.upd) c.upd(t); }
}

// ---------- card contents (each laid out at its own state size, centred in the card) ----------
function photoC(n, w, h, tIn, tOut, z0 = 1.08, z1 = 1.0) { let img; const el = content(w, h, tIn, tOut, `<img src="assets/photos/${n}.jpg" style="left:0;top:0;width:${w}px;height:${h}px;object-fit:cover;transform-origin:50% 50%">`,
  t => { img.style.transform = `scale(${lerp(z0, z1, clamp((t - tIn) / (tOut - tIn)))})`; }); img = el.firstChild; return el; }
photoC('nb-550', 560, 700, 2.35, 3.5);
// catalogue: one hero tile, the rest recede
content(1560, 880, 3.6, 5.0, `<div style="left:60px;top:44px;font:${LABEL};letter-spacing:.22em;color:rgba(18,18,20,.55)">DRIP VERSE · NEW IN</div>` +
  ['nb-550', 'adidas-niteball', 'axel-arigato', 'nike-zoom', 'nb-480', 'nike-af1', 'nb-550', 'axel-arigato'].map((n, i) => { const hero = i === 0, x = 60 + (i % 4) * 365, y = 110 + Math.floor(i / 4) * 375;
    return `<div style="left:${x}px;top:${y}px;width:345px;height:355px;border-radius:24px;background:${STONE};opacity:${hero ? 1 : .55};${hero ? 'box-shadow:0 0 0 3px #C9A15C,0 20px 40px rgba(60,48,30,.18);transform:scale(1.05)' : ''}"><div style="left:172px;top:160px">${shoeImg(n, 270)}</div><div style="left:24px;top:300px;font:600 22px/30px ${GEIST};color:${INK}">${n.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())}</div></div>`; }).join(''));
// delivery map: the route draws as a glowing line with a bright head
{ const R = 'M140 820 C 420 680, 560 760, 800 590 S 1180 420, 1380 470 S 1640 300, 1580 200';
  let rt, head, L; const el = content(1700, 940, 5.1, 6.95, `<svg width="1700" height="940" style="left:0;top:0">${Array.from({ length: 13 }, (_, i) => `<path d="M${-100 + i * 150} -40 L ${180 + i * 130} 1000" stroke="#E7E0D3" stroke-width="${i % 3 ? 3 : 10}"/>`).join('')}${Array.from({ length: 8 }, (_, i) => `<path d="M-40 ${60 + i * 125} L 1740 ${-30 + i * 140}" stroke="#E7E0D3" stroke-width="${i % 2 ? 3 : 9}"/>`).join('')}<path id="rt" d="${R}" fill="none" stroke="#C9A15C" stroke-width="10" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="filter:drop-shadow(0 0 8px rgba(220,170,80,.9))"/><circle cx="140" cy="820" r="16" fill="${INK}"/></svg><div class="hd" style="width:0;height:0"><div style="left:-60px;top:-60px;width:120px;height:120px;border-radius:60px;background:radial-gradient(closest-side,rgba(255,238,200,1),rgba(226,178,92,.6) 40%,rgba(226,178,92,0))"></div><div style="left:-18px;top:-18px;width:36px;height:36px;border-radius:18px;background:${GRAD};box-shadow:0 6px 14px rgba(0,0,0,.2)"></div></div><div class="ch" style="left:1580px;top:120px">${chipHTML('On its way', 'box')}</div>`,
    t => { const p = clamp(S(t, 5.2, 'heavy')); rt.style.strokeDashoffset = 1 - p; const pt = rt.getPointAtLength(L * p); put(head, { x: pt.x, y: pt.y }); const c = S(t, 6.0, 'snappy'); ch.style.transformOrigin = '0 0'; put(ch, { s: c }); vis(ch, c > .01); });
  rt = el.querySelector('#rt'); L = rt.getTotalLength(); head = el.querySelector('.hd'); var ch = el.querySelector('.ch'); }
// product page: the hero shoe flies into the image slot (SHOE2 below)
content(1520, 860, 8.1, 10.0, `<div style="left:40px;top:40px;width:760px;height:780px;border-radius:26px;background:${STONE}"></div>
  <div style="left:880px;top:90px;font:600 64px/1 ${GEIST};color:${INK};letter-spacing:-.02em">Niteball</div>
  <div style="left:882px;top:172px;font:400 30px/1 ${GEIST};color:rgba(18,18,20,.5)">adidas Originals</div>
  <div style="left:882px;top:290px;font:${LABEL};letter-spacing:.22em;color:rgba(18,18,20,.5)">SIZE (EU)</div>` +
  [40, 41, 42, 43, 44].map((n, i) => `<div style="left:${880 + i * 108}px;top:336px;width:92px;height:92px;border-radius:46px;background:${n === 42 ? GRAD : '#fff'};box-shadow:${n === 42 ? 'none' : 'inset 0 0 0 2px rgba(18,18,20,.12)'};font:600 30px/92px ${GEIST};color:${n === 42 ? '#FFF9EE' : INK};text-align:center">${n}</div>`).join('') +
  `<div style="left:880px;top:500px;width:540px;height:104px;border-radius:52px;background:${INK};font:600 32px/104px ${GEIST};color:#FFF9EE;text-align:center">Add to bag</div>`);
content(820, 440, 10.1, 12.0, `<div class="fx" style="left:0;top:110px;width:820px;height:160px"><div style="font:${DISPLAY};color:${INK};letter-spacing:-.02em">Size 42</div></div>
  <div class="fx" style="left:0;top:300px;width:820px;height:50px"><div style="font:${SUPPORT};color:rgba(18,18,20,.6)">Packed and ready to ship.</div></div>`);
content(700, 800, 12.1, 13.1, `<div style="left:50px;top:54px;font:600 36px/1 ${GEIST};color:${INK}">Order DV-0428</div>` +
  ['nb-550', 'adidas-niteball'].map((n, i) => `<div style="left:50px;top:${130 + i * 200}px;width:600px;height:176px;border-radius:24px;background:${STONE}"><div style="left:120px;top:88px">${shoeImg(n, 190)}</div><div style="left:250px;top:70px;font:600 30px/36px ${GEIST};color:${INK}">${n === 'nb-550' ? 'New Balance 550' : 'adidas Niteball'}</div></div>`).join('') +
  `<div style="left:50px;top:610px;width:600px;height:110px;border-radius:55px;background:${GRAD};font:600 34px/110px ${GEIST};color:#FFF9EE;text-align:center">Pay</div>`);
// dashboard plane: steps, the two pairs, sales bars (only the last bar is gold)
{ let bars; const el = content(1300, 720, 13.25, 20.45, `<div style="left:56px;top:46px;font:600 32px/1 ${GEIST};color:${INK}">Order DV-0428</div>` +
    ['Confirmed', 'Paid', 'Packed', 'Shipped'].map((s, i) => `<div style="left:${56 + i * 302}px;top:110px;width:282px;height:96px;border-radius:20px;background:${i === 0 ? '#F6EEDD' : STONE}"><div style="left:44px;top:48px;width:48px;height:48px;transform:translate(-50%,-50%);border-radius:24px;background:${i === 0 ? GRAD : '#CFC6B6'}"><svg width="48" height="48" viewBox="0 0 64 64" style="left:0;top:0">${ICON.check}</svg></div><div style="left:84px;top:34px;font:600 26px/30px ${GEIST};color:${INK}">${s}</div></div>`).join('') +
    ['nb-550', 'adidas-niteball'].map((n, i) => `<div style="left:${56 + i * 604}px;top:236px;width:584px;height:120px;border-radius:20px;background:#FAF7F2"><div style="left:90px;top:60px">${shoeImg(n, 140)}</div><div style="left:180px;top:42px;font:600 26px/36px ${GEIST};color:${INK}">${n === 'nb-550' ? 'New Balance 550' : 'adidas Niteball'}</div></div>`).join('') +
    [.35, .5, .42, .62, .55, .74, .68, .86, .8, .95].map((h, i) => `<div class="bar" style="left:${70 + i * 118}px;top:${680 - h * 280}px;width:76px;height:${h * 280}px;border-radius:14px;background:${i === 9 ? GRAD : '#E6DDCC'};transform-origin:50% 100%"></div>`).join(''),
    t => bars.forEach((b, i) => { const g = S(t, 16.7 + i * .07, 'snappy'); put(b, { sy: Math.max(.001, g) }); }));
  bars = [...el.querySelectorAll('.bar')]; }
content(170, 170, 20.6, 25.0, `<div style="left:85px;top:85px">${svgIcon('receipt', 110)}</div>`);
// stock chart: the line draws with a glowing head, Restock is the one gold thing
{ let sl, hd, L, lo; const el = content(1440, 760, 25.1, 28.0, `<div style="left:64px;top:56px;font:600 40px/1 ${GEIST};color:${INK}">Niteball · size 42</div>
  <div style="left:66px;top:118px;font:${LABEL};letter-spacing:.22em;color:rgba(18,18,20,.5)">STOCK</div>
  <svg width="1320" height="480" style="left:60px;top:200px">${[0, 1, 2, 3].map(i => `<path d="M0 ${60 + i * 120} H1320" stroke="#EFE9DF" stroke-width="2"/>`).join('')}<path id="sl" d="M0 50 C 220 80, 360 130, 560 200 S 880 330, 1060 390" fill="none" stroke="#C9A15C" stroke-width="8" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="filter:drop-shadow(0 0 8px rgba(220,170,80,.85))"/><path d="M1060 390 C 1150 410, 1240 425, 1310 440" fill="none" stroke="#C9A15C" stroke-width="5" stroke-dasharray="10 12" opacity=".5"/></svg>
  <div class="hd" style="left:60px;top:200px;width:0;height:0"><div style="left:-50px;top:-50px;width:100px;height:100px;border-radius:50px;background:radial-gradient(closest-side,rgba(255,238,200,1),rgba(226,178,92,.55) 40%,rgba(226,178,92,0))"></div></div>
  <div class="lo" style="left:1120px;top:520px">${chipHTML('Low stock', 'bag')}</div>
  <div style="left:1140px;top:46px;width:240px;height:84px;border-radius:42px;background:${GRAD};font:600 30px/84px ${GEIST};color:#FFF9EE;text-align:center" class="btn">Restock</div>`,
    t => { const p = clamp(S(t, 25.25, 'heavy')); sl.style.strokeDashoffset = 1 - p; const pt = sl.getPointAtLength(L * p); put(hd, { x: pt.x, y: pt.y }); const c = S(t, 26.0, 'snappy'); put(lo, { s: c }); vis(lo, c > .01);
      const b = el.querySelector('.btn'); b.style.transformOrigin = '50% 50%'; put(b, { s: 1 - .07 * (S(t, 26.9, 'snappy') - S(t, 27.02, 'snappy')) }); });
  sl = el.querySelector('#sl'); L = sl.getTotalLength(); hd = el.querySelector('.hd'); lo = el.querySelector('.lo'); }
photoC('nb-550', 560, 700, 28.1, 30.0, 1.0, 1.08);
content(680, 440, 30.1, 32.0, `<div style="left:340px;top:110px;width:110px;height:110px;transform:translate(-50%,-50%);border-radius:55px;background:${GRAD}"><svg width="110" height="110" viewBox="0 0 64 64" style="left:0;top:0">${ICON.check}</svg></div>
  <div class="fx" style="left:0;top:210px;width:680px;height:70px"><div style="font:600 50px/1 ${GEIST};color:${INK};letter-spacing:-.02em">Payment completed</div></div>
  <div class="fx" style="left:0;top:300px;width:680px;height:50px"><div style="font:400 30px/1 ${GEIST};color:rgba(18,18,20,.55)">Order DV-0428 · confirmed</div></div>`);
content(420, 300, 32.1, 35.45, `<div style="left:210px;top:150px">${shoeImg('adidas-niteball', 320)}</div>`);
content(130, 130, 35.6, 39.15, `<div style="left:65px;top:69px">${DROPW(.9)}</div>`);
content(1320, 760, 39.3, 42.0, `<div style="left:60px;top:46px;font:${LABEL};letter-spacing:.22em;color:rgba(18,18,20,.55)">ORDERS</div>` +
  ['nb-550', 'adidas-niteball', 'axel-arigato', 'nike-zoom'].map((n, i) => { const hero = i === 1; return `<div style="left:60px;top:${100 + i * 154}px;width:1200px;height:134px;border-radius:22px;background:${hero ? '#F6EEDD' : '#FAF7F2'}"><div style="left:100px;top:67px">${shoeImg(n, 150)}</div><div style="left:200px;top:47px;font:600 ${hero ? 32 : 28}px/40px ${GEIST};color:${hero ? INK : 'rgba(18,18,20,.6)'}">${['New Balance 550', 'adidas Niteball', 'Axel Arigato Area', 'Nike Zoom Vomero'][i]}</div><div style="left:940px;top:35px;width:220px;height:64px;border-radius:32px;background:${hero ? GRAD : STONE};font:600 24px/64px ${GEIST};color:${hero ? '#FFF9EE' : 'rgba(18,18,20,.6)'};text-align:center">${['Delivered', 'On its way', 'Packed', 'Confirmed'][i]}</div></div>`; }).join(''));
content(560, 400, 42.1, 49.0, `<div class="fx" style="left:0;top:34px;width:560px;height:30px"><div style="font:${LABEL};letter-spacing:.3em;padding-left:.3em;color:${INK}">DRIP VERSE</div></div><div style="left:280px;top:225px">${shoeImg('axel-arigato', 400)}</div>`);
content(340, 340, 49.1, 56.0, `<div style="left:170px;top:140px">${DROPB(1.3, 777).replace('style="left:0;top:0;', 'style="left:-39px;top:-56px;')}</div><div class="fx" style="left:0;top:228px;width:340px;height:30px"><div style="font:${LABEL};letter-spacing:.3em;padding-left:.3em;color:${INK}">DRIP VERSE</div></div>`);
photoC('jordan-4', 2080, 1180, 56.05, 58.5, 1.0, 1.06);
photoC('asics-kayano', 520, 680, 58.6, 62.45, 1.08, 1.0);
content(130, 130, 62.6, END + 1, `<div style="left:65px;top:69px">${DROPW(.9)}</div>`);

// ---------- world objects outside the card ----------
const SHOE1 = mk(WORLD, { width: 0, height: 0 }, shoeImg('axel-arigato', 440));
const SHOE2 = mk(WORLD, { width: 0, height: 0 }, shoeImg('adidas-niteball', 820));
function shoes(t) {
  const fall = u => lerp(-320, 540, S(u, .05, 'default')), y = fall(t), v = (fall(t + .004) - fall(t - .004)) / .008, k = clamp(Math.abs(v) / 5000, 0, .22);
  const land = S(t, .42, 'snappy') - S(t, .52, 'default'), out = S(t, 2.22, 'snappy');
  vis(SHOE1, out < .99); put(SHOE1, { x: gapX('open'), y: y + 8 * Math.sin(t * 2.6) * S(t, .6), rot: -7 + 3 * Math.sin(t * 1.7), sx: (1 - .55 * k + .05 * land) * (1 - out), sy: (1 + k - .07 * land) * (1 - out) });
  const rise = S(t, 7.0, 'default'), slot = S(t, 8.05, 'default'), off = S(t, 9.95, 'snappy');
  const x2 = lerp(960, 620, slot) + off * 1500, y2 = lerp(lerp(900, 560, rise), 540, slot) - off * 800;
  vis(SHOE2, t > 6.9 && off < .99); put(SHOE2, { x: x2, y: y2 + 6 * Math.sin(t * 3) * (1 - slot), rot: -5 - off * 20, s: (lerp(.3, 1, rise) * lerp(1, .8, slot)) * (1 + .3 * off) });
}
// reconciliation: a second gold icon slides out of the card; a glowing line draws between them with light travelling along it
const ICON2 = mk(WORLD, { width: 170, height: 170, borderRadius: 48, background: GRAD, boxShadow: '0 20px 40px rgba(120,90,40,.25)' }, `<div style="left:85px;top:85px">${svgIcon('card', 110)}</div>`);
const LINE = mk(WORLD, { width: W, height: H }, `<svg width="1920" height="1080" style="left:0;top:0"><path id="ln" d="M800 440 L1120 440" stroke="#C9A15C" stroke-width="7" stroke-linecap="round" fill="none" style="filter:drop-shadow(0 0 7px rgba(220,170,80,.9))"/></svg><div class="dot" style="width:0;height:0"><div style="left:-34px;top:-34px;width:68px;height:68px;border-radius:34px;background:radial-gradient(closest-side,rgba(255,240,205,1),rgba(226,178,92,.5) 45%,rgba(226,178,92,0))"></div></div>`);
const LN = LINE.querySelector('#ln'), LDOT = LINE.querySelector('.dot');
function recon(t) {
  const e = S(t, 20.75, 'default'), o = S(t, 24.85, 'snappy'); vis(ICON2, e > .01 && o < .99); ICON2.style.transformOrigin = '50% 50%';
  put(ICON2, { x: lerp(700, 1220, e) - 85 - o * 260, y: 440 - 85, s: e * (1 - o) });
  const d = clamp(S(t, 21.2, 'heavy')) * (1 - o); vis(LINE, d > .01); LN.setAttribute('d', `M800 440 L${800 + 320 * d} 440`);
  const lu = ((t - 21.4) % 1.1 + 1.1) % 1.1 / 1.1; put(LDOT, { x: 800 + 320 * d * lu, y: 440 }); LDOT.style.opacity = t > 21.4 ? Math.sin(Math.PI * lu) : 0;
}
// chips around the order card
function Chip(x, y, txt, icon, tIn, tOut, dim) { const el = mk(WORLD, { width: 0, height: 0 }, chipHTML(txt, icon, dim)); return { el, x, y, tIn, tOut }; }
const CHIPS = [Chip(1440, 330, 'Paid', 'card', 12.35, 13.0), Chip(480, 760, 'Packing', 'box', 12.6, 13.0)];
function chips(t, list) { list.forEach(c => { const s = S(t, c.tIn, 'snappy') * (1 - S(t, c.tOut, 'snappy')); vis(c.el, s > .01); put(c.el, { x: c.x, y: c.y, s }); }); }
// collage: six tiles come out of the card, then go back in
const COL = [[400, 270], [1520, 270], [330, 560], [1590, 560], [400, 850], [1520, 850]].map(([x, y], i) => ({ x, y, el: mk(WORLD, { width: 340, height: 240, borderRadius: 24, background: PAPER, boxShadow: '0 20px 50px rgba(60,48,30,.16)', overflow: 'hidden' }, `<div style="left:170px;top:120px">${shoeImg(['nb-550', 'axel-arigato', 'nike-zoom', 'nb-480', 'nike-af1', 'axel-arigato'][i], 250)}</div>`) }));
function collage(t) { COL.forEach((c, i) => { const e = S(t, 32.1 + i * .06, 'default'), b = S(t, 35.4 + i * .03, 'snappy'), k = e * (1 - b); vis(c.el, k > .01);
  c.el.style.transformOrigin = '50% 50%'; c.el.style.filter = `blur(${2 + 5 * S(t, 34.0, 'default')}px)`;
  put(c.el, { x: lerp(960, c.x, k) - 170, y: lerp(540, c.y, k) - 120 + 6 * Math.sin(t * 2 + i), s: .3 + .55 * k, rot: (i % 2 ? 3 : -3) * k }); }); }
// one store to a hundred: a ripple of shop tiles around the hero card, then all of them are pulled into the hub
const GRID = []; for (let gy = -3; gy <= 3; gy++) for (let gx = -4; gx <= 4; gx++) { if (!gx && !gy) continue; const d = Math.hypot(gx, gy * 1.2);
  GRID.push({ x: 960 + gx * 640, y: 650 + gy * 460, d, el: mk(WORLD, { width: 560, height: 400, borderRadius: 30, background: PAPER, boxShadow: '0 24px 60px rgba(60,48,30,.14)', overflow: 'hidden' }, `<div style="left:280px;top:215px">${shoeImg(Object.keys(SHOES)[(gx + 4 + (gy + 3) * 9) % 6], 380)}</div>`) }); }
function grid(t) { GRID.forEach(g => { const e = S(t, 44.75 + g.d * .14, 'default'), b = S(t, 48.95 + (6 - g.d) * .03, 'snappy'), k = e * (1 - b); vis(g.el, k > .01);
  g.el.style.transformOrigin = '50% 50%'; put(g.el, { x: lerp(960, g.x, 1 - b) - 280, y: lerp(540, g.y, 1 - b) - 200 + (1 - e) * 120, s: k * .72 }); g.el.style.opacity = .82; }); }
// the hub: an orbiting gold light ring and labelled chips (centred on their own width)
const RING = mk(WORLD, { left: 960 - 215, top: 540 - 215, width: 430, height: 430, borderRadius: '50%', transformOrigin: '50% 50%',
  WebkitMaskImage: 'radial-gradient(closest-side,transparent 88%,#000 90%,#000 100%)', maskImage: 'radial-gradient(closest-side,transparent 88%,#000 90%,#000 100%)', filter: 'drop-shadow(0 0 12px rgba(226,178,92,.8))' });
const HL = ['DMs', 'Orders', 'Payments', 'Delivery', 'Restock', 'Receipts', 'Sizes', 'Returns', 'Pickup', 'Tracking', 'New drops', 'Reorders'], HI = ['bag', 'check', 'card', 'box', 'box', 'receipt', 'check', 'bag', 'box', 'check', 'bag', 'receipt'];
const HCH = HL.map((s, i) => ({ i, el: mk(WORLD, { width: 0, height: 0 }, chipHTML(s, HI[i], i >= 6)) }));
function hub(t) { const on = S(t, 49.25, 'default') * (1 - S(t, 55.9, 'snappy')); vis(RING, on > .01); RING.style.background = rimConic(-120 * t); put(RING, { rot: 0, s: .8 + .2 * on }); RING.style.opacity = on;
  HCH.forEach(c => { const r2 = c.i >= 6, k = r2 ? c.i - 6 : c.i, a = k / 6 * Math.PI * 2 + (r2 ? Math.PI / 6 : 0) + (t - 49) * .1 * (r2 ? -1 : 1);
    const e = S(t, (r2 ? 51.0 : 49.5) + k * .1, 'default') * (1 - S(t, 55.6 + k * .02, 'snappy')); vis(c.el, e > .01);
    put(c.el, { x: 960 + Math.cos(a) * (r2 ? 700 : 430) * e, y: 540 + Math.sin(a) * (r2 ? 390 : 260) * e, s: e * (r2 ? .84 : 1) }); }); }
// cursor for the Restock click
const CUR = mk(WORLD, { width: 44, height: 62 }, `<svg width="44" height="62" viewBox="0 0 28 40" style="left:0;top:0;overflow:visible"><path d="M3 2 L3 30 L10 24 L15 36 L20 34 L15 22 L24 22 Z" fill="${INK}" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>`);
function cursor(t) { const k = S(t, 26.2, 'default'), o = S(t, 27.6, 'snappy'); vis(CUR, t > 26.1 && o < .99);
  put(CUR, { x: lerp(1760, 1530, k) + o * 300, y: lerp(1000, 250, k) + o * 400, s: 1 - .15 * (S(t, 26.9, 'snappy') - S(t, 27.02, 'snappy')) }); }

// ---------- type: centred flex lines, masked rises with overlap, upward exits ----------
const LINES = [], GAPS = {};
const gapX = id => { const g = GAPS[id]; return g ? g.offsetLeft + g.offsetWidth / 2 : 960; };   // layout only, no transforms: same answer every frame
function Line(o) {
  const scr = o.scrim ? mk(TYPE, { left: 160, top: o.y - o.h * .9, width: W - 320, height: o.h * 2.8, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(250,245,236,.96) 0%,rgba(250,245,236,.85) 55%,rgba(250,245,236,0) 100%)' }) : null;
  const box = mk(TYPE, { left: 0, top: o.y, width: W, height: o.h }); box.className = 'fx'; box.style.gap = (o.gap ?? 40) + 'px';
  const words = o.words.map(wd => { if (typeof wd === 'number') { const sp = mk(box, { width: wd, height: 1 }); sp.style.left = ''; sp.style.top = ''; if (o.id) GAPS[o.id] = sp; return null; }
    const m = mk(box, { height: o.h, overflow: 'hidden', padding: '0 8px' }), inn = mk(m, { font: o.font, color: o.color || INK, letterSpacing: o.ls || '-.02em', whiteSpace: 'nowrap', lineHeight: o.h + 'px', paddingLeft: o.ls && o.ls[0] !== '-' ? o.ls : '0' }, wd);
    m.style.left = ''; m.style.top = ''; inn.style.left = ''; inn.style.top = ''; return inn; }).filter(Boolean);
  box.style.left = '0px';
  LINES.push(t => { const on = t > o.tIn - .05 && t < o.tOut + .8;
    if (scr) { const k = S(t, o.tIn - .1, 'default') * (1 - S(t, o.tOut + .1, 'default')); vis(scr, k > .01); scr.style.opacity = k; scr.style.transformOrigin = '50% 50%'; put(scr, { sx: .7 + .3 * k, sy: .7 + .3 * k }); }
    if (!vis(box, on)) return;
    words.forEach((w, i) => { const u = S(t, o.tIn + i * .07, o.sp || 'heavy'), v = S(t, o.tOut + i * .05, 'snappy'); w.style.transform = `translateY(${((1 - u) - v) * o.h * 1.1}px)`; }); });
}
const D = (y, words, tIn, tOut, extra = {}) => Line({ y, h: 180, font: DISPLAY, words, tIn, tOut, ...extra });
const SUP = (y, text, tIn, tOut) => Line({ y, h: 60, font: SUPPORT, words: [text], tIn, tOut, color: 'rgba(18,18,20,.62)', ls: '0', sp: 'default' });
const LAB = (y, text, tIn, tOut) => Line({ y, h: 40, font: LABEL, words: [text], tIn, tOut, color: 'rgba(18,18,20,.6)', ls: '.24em', sp: 'default' });
D(450, ['One', 500, 'order.'], .45, 2.25, { gap: 0, id: 'open' });
LAB(950, 'IT STARTS WITH ONE PAIR', 2.6, 3.35);
SUP(900, 'In stock, ready to ship.', 7.3, 7.9);
D(110, ['Order', 'confirmed.'], 13.3, 16.2);
LAB(150, 'EVERY SALE, TRACKED', 16.7, 20.3);
D(600, ['Payments,', 'reconciled.'], 21.0, 24.75);
LAB(960, 'RESTOCK ORDER PLACED', 28.5, 29.85);
D(450, ['In', 'one', 'tap.'], 34.1, 35.35, { scrim: true });
Line({ y: 520, h: 150, font: `500 104px/1 ${GEIST}`, words: ['DRIP VERSE'], tIn: 36.0, tOut: 37.45, ls: '.3em' });
D(500, ['Not', 'just', 'a', 'shop.'], 37.7, 39.1);
D(120, ['One', 'store.'], 42.3, 44.4);
D(110, ['To', 'a', 'hundred.'], 44.9, 46.6, { scrim: true });
D(110, ['Grows', 'with', 'you.'], 46.9, 48.85, { scrim: true });
D(70, ['At', 'your', 'door.'], 58.8, 62.35);
Line({ y: 500, h: 150, font: `500 104px/1 ${GEIST}`, words: ['DRIP VERSE'], tIn: 63.3, tOut: 999, ls: '.3em' });
SUP(668, 'One order. Every step handled.', 63.9, 66.4);
SUP(668, 'Luxury footwear, delivered.', 66.7, 999);
LAB(925, 'POWERED BY CLIMAX STORE', 67.7, 999);
// notification (screen space) over the on-foot photo
const NOTE = mk(HUD, { left: 960 - 390, top: 90, width: 780, height: 150, borderRadius: 34, background: 'rgba(255,253,249,.94)', boxShadow: '0 24px 60px rgba(0,0,0,.25)' },
  `<div style="left:28px;top:25px;width:100px;height:100px;border-radius:26px;background:${GRAD}"><div style="left:50px;top:50px">${svgIcon('bag', 70)}</div></div><div style="left:156px;top:34px;font:${LABEL};letter-spacing:.22em;color:${INK}">DRIP VERSE</div><div style="left:156px;top:76px;font:400 34px/1.2 ${GEIST};color:${INK}">Your order is on its way.</div>`);
function note(t) { const e = S(t, 56.4, 'snappy'), o = S(t, 58.3, 'snappy'); vis(NOTE, e > .01 && o < .99); NOTE.style.transformOrigin = '50% 0%'; put(NOTE, { y: (1 - e) * -260 - o * 300, s: .92 + .08 * e }); }
// the CTA pill with its own travelling rim light
const CTA = mk(WORLD, { left: 960 - 240, top: 790 - 54, width: 480, height: 108, borderRadius: 54, transformOrigin: '50% 50%' },
  `<div class="rg" style="left:-10px;top:-10px;width:500px;height:128px;border-radius:64px;filter:blur(14px)"></div><div class="rm" style="left:-3px;top:-3px;width:486px;height:114px;border-radius:57px"></div><div style="left:0;top:0;width:480px;height:108px;border-radius:54px;background:${GRAD};box-shadow:0 24px 50px rgba(120,90,40,.28)"></div><div class="fx" style="left:0;top:0;width:480px;height:108px"><div style="font:600 36px/1 ${GEIST};color:#FFF9EE">Send us a DM</div></div>`);
const CRG = CTA.querySelector('.rg'), CRM = CTA.querySelector('.rm');
function cta(t) { const e = S(t, 67.1, 'snappy'); vis(CTA, e > .01); put(CTA, { s: e }); const ri = Math.max(bump(t, 67.5, .7), bump(t, 69.2, .7)) * .9 + .1 * e;
  CRG.style.background = CRM.style.background = rimConic(160 * t); CRG.style.opacity = ri; CRM.style.opacity = ri; }

window.TIMELINE = { SWEEPS, PASSES };
window.seek = function (t) {
  camera(t); bgWipe(t); bokeh(t); pool(t); card(t); shoes(t); recon(t); chips(t, CHIPS); collage(t); grid(t); hub(t); cursor(t); note(t); cta(t); sweep(t);
  LINES.forEach(f => f(t));
};
