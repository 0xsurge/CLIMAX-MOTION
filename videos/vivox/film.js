// Vivox, "Carrier" style. 60 beats at 112.01 BPM (32.14 s), 16:9. One tall canvas and one camera that glides down it; a glowing
// blue orb (the carrier) travels through every scene on top and finally splits into the two loops of the infinity mark.
// Every frame is a pure function of t. Every event sits on a beat: t = b * BEAT.
const { spring, track, swapAlpha, clamp, lerp } = Motion;
const W = 1920, H = 1080, BEAT = 0.5356526, b = n => n * BEAT, DUR = b(60);
const BLUE = '#0051FF', NAVY = '#04152A', G600 = '#535862', INTER = "'Inter', system-ui, sans-serif";
const STAGE = document.getElementById('stage');
const sp = (t, t0, p = 'default') => spring(t - t0, p);

// ---------- TIMELINE (beats) ----------
const B = { orbLand: 1, w1: 0.5, c1: 1.5, w2: 2, w3: 3, c2: 3.5, w4: 4, w5: 5, chip1: 6, c3: 6.5, pile: 8, lift: 12, cam1: 14.6,
  drop: 15, chipR: 15.25, rachel: 15.5, sub: 15.75, frame: 16.5, list: 19, act: [20, 21.5, 23, 24.5, 26], grow: 27, f1: 29, f2: 31,
  cam2: 33.5, ring: 34, expl: 34.5, aud: 36.5, ringOut: 39.5, field: 40, fw1: 40.5, fchip: 41.5, cam3: 46.5, sup: 47, rachel2: 47.3,
  cam4: 51.5, split: 52.25, logo: 53, word: 53.5, cta: 54.5, curIn: 55, click: 57 };
const T = Object.fromEntries(Object.entries(B).map(([k, v]) => [k, Array.isArray(v) ? v.map(b) : b(v)]));
window.TIMELINE = { BEAT, beats: B, seconds: T };

const css = document.createElement('style');
css.textContent = `@font-face{font-family:'Inter';src:url(assets/fonts/inter.woff2) format('woff2');font-weight:300 800}
#stage *{position:absolute;box-sizing:border-box;margin:0;padding:0}`;
document.head.appendChild(css);
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = src; });
window.__preload = [document.fonts.load("600 100px 'Inter'"), document.fonts.load("500 40px 'Inter'"),
  ...['product_ui.webp', 'rachel_blue.webp', 'rachel_laptop.webp', 'logo.svg'].map(n => loadImg('assets/' + n))];

// ---------- helpers ----------
const PXK = new Set(['left', 'top', 'width', 'height', 'borderRadius']);
function mk(parent, o = {}, html) {
  const e = document.createElement('div'); e.style.left = '0px'; e.style.top = '0px';
  for (const k in o) e.style[k] = (PXK.has(k) && typeof o[k] === 'number') ? o[k] + 'px' : o[k];
  if (html != null) e.innerHTML = html; parent.appendChild(e); return e;
}
const put = (e, o) => { e.style.transform = `translate(${o.x || 0}px,${o.y || 0}px) rotate(${o.rot || 0}deg) scale(${o.sx ?? o.s ?? 1},${o.sy ?? o.s ?? 1})`; };
const show = (e, on) => { e.style.display = on ? 'block' : 'none'; return on; };
const rect = (e, x, y, w, h) => Object.assign(e.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
function Rise(parent, o) {                // text rises through a mask, leaves upward through it
  const bx = mk(parent, { left: o.x, top: o.y, width: o.w, height: o.h, overflow: 'hidden' });
  const inner = mk(bx, { width: o.w, height: o.h, font: o.font, color: o.color || NAVY, letterSpacing: o.ls || '-.035em', whiteSpace: 'nowrap' }, o.html);
  return (t, tin, tout = 99, p = o.sp || 'heavy') => { const u = sp(t, tin, p), v = sp(t, tout, 'snappy'); inner.style.transform = `translateY(${((1 - u) - v) * o.h * 1.15}px)`; bx.style.visibility = t < tin - 0.02 || v > 0.995 ? 'hidden' : 'visible'; };
}
function Chip(parent, x, y, txt, fs) {   // blue pill that pops from its left edge
  const e = mk(parent, { left: x, top: y, height: fs * 1.32, padding: `0 ${fs * 0.38}px`, borderRadius: fs, background: BLUE, color: '#fff', font: `600 ${fs}px/${fs * 1.32}px ${INTER}`, letterSpacing: '-.02em', whiteSpace: 'nowrap', boxShadow: '0 18px 40px rgba(0,81,255,.28)', transformOrigin: '0 50%' }, txt);
  return (t, tin, tout = 99) => { const s = sp(t, tin, 'snappy') * (1 - sp(t, tout, 'snappy')); put(e, { s }); e.style.visibility = s < 0.01 ? 'hidden' : 'visible'; };
}
function Crop(parent, x, y, cx, cy, cw, ch, k, rot) {   // a real crop of the dashboard as a floating card
  const e = mk(parent, { left: x, top: y, width: cw * k, height: ch * k, borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 24px 60px rgba(4,21,42,.16),0 0 0 1px rgba(4,21,42,.06)', transformOrigin: '50% 50%' }, `<img src="assets/product_ui.webp" style="left:${-cx * k}px;top:${-cy * k}px;width:${1898 * k}px">`);
  return t0 => t => { const s = sp(t, t0, 'snappy'); put(e, { x: 5 * Math.sin(t * 0.9 + rot), y: (1 - sp(t, t0, 'default')) * 60 + 7 * Math.sin(t * 1.15 + x * 0.01), rot: rot + 0.6 * Math.sin(t * 0.7 + y), s: 0.6 + 0.4 * s }); e.style.visibility = s < 0.01 ? 'hidden' : 'visible'; };
}
function Handles(parent) {               // design-tool selection frame with four corner squares
  const f = mk(parent, { border: `2px solid ${BLUE}`, display: 'none' });
  const c = [0, 1, 2, 3].map(() => mk(parent, { width: 14, height: 14, background: '#fff', border: `2px solid ${BLUE}`, display: 'none' }));
  return (on, x, y, w, h, s = 1) => {
    show(f, on); c.forEach(e => show(e, on)); if (!on) return;
    const cx = x + w / 2, cy = y + h / 2, ww = w * s, hh = h * s; rect(f, cx - ww / 2, cy - hh / 2, ww, hh);
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([i, j], k) => rect(c[k], cx - ww / 2 + i * ww - 7, cy - hh / 2 + j * hh - 7, 14, 14));
  };
}
const label = (parent, txt) => mk(parent, { height: 30, padding: '0 10px', background: BLUE, color: '#fff', font: `600 18px/30px ${INTER}`, whiteSpace: 'nowrap', display: 'none', transformOrigin: '0 100%' }, txt);
const ORB_BG = 'radial-gradient(circle at 35% 30%,#BFD3FF 0%,#4D86FF 28%,#0051FF 62%,#0035B8 100%)';
const orbEl = parent => mk(parent, { borderRadius: '50%', background: ORB_BG });
const placeOrb = (e, x, y, r) => Object.assign(e.style, { left: x - r + 'px', top: y - r + 'px', width: 2 * r + 'px', height: 2 * r + 'px', boxShadow: `0 0 ${Math.min(r * 2.6, 120)}px ${Math.min(r * 0.5, 30)}px rgba(0,81,255,.33),0 0 ${Math.min(r * 7, 220)}px rgba(0,81,255,.18)` });

// ---------- the canvas: scenes stacked vertically, the camera glides down ----------
STAGE.style.background = '#fff';
const VIEW = mk(STAGE, { width: W, height: H, transformOrigin: '960px 540px' });   // the always-moving camera: slow push + drift
const CAM = mk(VIEW, { width: W, height: H * 5 });
const Y = [0, H, 2 * H, 3 * H, 4 * H];                  // problem, rachel+product, ring+field, promise, end
const camY = t => track(t, [{ t: 0, v: 0 }, { t: T.cam1, v: Y[1], spring: 'heavy' }, { t: T.cam2, v: Y[2], spring: 'heavy' }, { t: T.cam3, v: Y[3], spring: 'heavy' }, { t: T.cam4, v: Y[4], spring: 'heavy' }]);
// Never hold still: every scene has a slow push-in and a drift whose direction alternates scene to scene. At each camera glide the
// next scene's motion takes over through a heavy spring, so velocity never drops to zero and nothing jumps.
const SC = () => [0, T.cam1, T.cam2, T.cam3, T.cam4];
const DRIFT = [[1, -1, .0075], [-1, 1, .0065], [1, -1, .0075], [-1, 1, .007], [1, 0, .004]];   // x dir, y dir, zoom per second
const sceneMove = (t, i) => { const dt = Math.max(0, t - SC()[i]), [dx, dy, dz] = DRIFT[i]; return [dx * 7 * dt, dy * 3.5 * dt, 1 + dz * dt]; };
function view(t) {
  let v = sceneMove(t, 0);
  for (let i = 1; i < 5; i++) { const w = sp(t, SC()[i], 'heavy'); if (w <= 0) break; const n = sceneMove(t, i); v = v.map((a, k) => lerp(a, n[k], w)); }
  return { dx: v[0], dy: v[1], z: v[2] };
}
let V = { dx: 0, dy: 0, z: 1 };
const toScreen = (x, y) => [(x - 960) * V.z + 960 + V.dx, (y - 540) * V.z + 540 + V.dy];
const camX = t => -60 * (sp(t, T.pile, 'heavy') - sp(t, T.cam1, 'default'));      // the slow drift while the cards pile up

// S1 problem (y = 0) ------------------------------------------------------------------------------------------------------------
const S1 = mk(CAM, { width: W, height: H });
const wd = (x, y, txt) => Rise(S1, { x, y, w: 700, h: 130, html: txt, font: `600 110px/130px ${INTER}` });
const W1 = [[wd(150, 160, 'Every'), T.w1], [wd(1060, 160, 'alert.'), T.w2], [wd(260, 410, 'Every'), T.w3], [wd(1150, 410, 'entity.'), T.w4], [wd(150, 680, 'Every'), T.w5]];
const chip1 = Chip(S1, 530, 664, 'check.', 104);
const cards = [Crop(S1, 520, 120, 560, 180, 520, 170, .95, -3)(T.c1), Crop(S1, 640, 380, 560, 420, 520, 190, .9, 2)(T.c2), Crop(S1, 1260, 600, 1300, 330, 520, 330, .95, -2)(T.c3),
  Crop(S1, 1420, 120, 1240, 120, 560, 150, .8, 4)(b(B.pile)), Crop(S1, 860, 820, 300, 600, 600, 200, .75, -3)(b(B.pile + 1)), Crop(S1, 1500, 380, 560, 600, 440, 230, .7, 3)(b(B.pile + 2))];

// S2 rachel + product (y = H) ---------------------------------------------------------------------------------------------------
const S2 = mk(CAM, { top: Y[1], width: W, height: H });
const meet = Rise(S2, { x: 150, y: 140, w: 400, h: 140, html: 'Meet', font: `600 120px/140px ${INTER}` });
const chipR = Chip(S2, 500, 128, 'Rachel*', 112);
const sub = Rise(S2, { x: 150, y: 300, w: 900, h: 70, html: 'Your AI compliance analyst.', font: `500 54px/70px ${INTER}`, color: G600, ls: '-.02em', sp: 'snappy' });
const rachel = mk(S2, { left: 1060, top: 230, width: 800, height: 507, overflow: 'hidden' }, `<img src="assets/rachel_blue.webp" style="left:0;top:0;width:800px">`);
const SKILLS = ['Adverse media monitoring', 'Sanctions and PEP alert reviews', 'Corporate registry analysis', 'UBO documents analysis', 'Narrative report writing'];
const LIST = mk(S2, { left: 0, top: 0, width: 1100, height: H });
const lines = SKILLS.map((s, i) => Rise(LIST, { x: 150, y: 548 + i * 86, w: 900, h: 70, html: s, font: `500 46px/70px ${INTER}`, ls: '-.02em', sp: 'snappy' }));
const lineInner = [...LIST.children].map(bx => bx.firstChild);
const arrow = mk(LIST, { width: 34, height: 30, display: 'none' }, `<svg width="34" height="30" viewBox="0 0 34 30" style="left:0;top:0"><path d="M2 15 H30 M18 3 L31 15 L18 27" fill="none" stroke="${BLUE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
const win = mk(S2, { overflow: 'hidden', background: '#fff', display: 'none', borderRadius: 0 }, `<img src="assets/product_ui.webp" style="left:0;top:0;width:2100px">`);
const winImg = win.firstChild;
const hR = Handles(S2), labR = label(S2, 'Rachel · AI analyst'), hP = Handles(S2), labP1 = label(S2, 'Business activity risk'), labP2 = label(S2, 'Address analysis');

// S3 ring + field (y = 2H) ------------------------------------------------------------------------------------------------------
const S3 = mk(CAM, { top: Y[2], width: W, height: H, overflow: 'hidden' });
const fieldBlob = mk(S3, { left: -200, top: 520, width: 2400, height: 700, borderRadius: '50%', background: 'radial-gradient(60% 55% at 40% 45%,#7FA8FF,#0051FF 45%,#04152A 100%)' });
const fieldScreen = mk(S3, { width: W, height: H, background: 'radial-gradient(circle,transparent 3.2px,#fff 3.9px)', backgroundSize: '13px 13px' });
mk(S3, { width: W, height: H, background: 'linear-gradient(#fff 0%,rgba(255,255,255,0) 55%)' });
const RR = 250;
const ring = mk(S3, { left: 1100 - 350, top: 540 - 350, width: 700, height: 700, display: 'none', transformOrigin: '50% 50%' }, `<svg width="700" height="700" viewBox="0 0 700 700" style="left:0;top:0;overflow:visible"><defs><path id="rg" d="M350 350 m-${RR} 0 a${RR} ${RR} 0 1 1 ${2 * RR} 0 a${RR} ${RR} 0 1 1 -${2 * RR} 0"/></defs><text font-family="Inter" font-weight="600" font-size="34" letter-spacing="4" fill="${NAVY}"><textPath href="#rg">AML · KYB · KYC · SANCTIONS · ADVERSE MEDIA · UBO · REGISTRY ·</textPath></text><circle cx="350" cy="350" r="${RR + 40}" fill="none" stroke="rgba(0,81,255,.18)" stroke-width="2"/></svg>`);
const expl = Rise(S3, { x: 150, y: 330, w: 700, h: 120, html: 'Explainable.', font: `600 96px/120px ${INTER}` });
const aud = Chip(S3, 150, 470, 'Audited.', 84);
const fw = Rise(S3, { x: 150, y: 170, w: 1100, h: 130, html: 'Every decision,', font: `600 110px/130px ${INTER}` });
const fchip = Chip(S3, 150, 330, 'explained.', 96);

// S4 promise (y = 3H) -----------------------------------------------------------------------------------------------------------
const S4 = mk(CAM, { top: Y[3], width: W, height: H, overflow: 'hidden' });
const supA = Rise(S4, { x: 150, y: 330, w: 900, h: 160, html: 'Superpower', font: `600 136px/160px ${INTER}` });
const supB = Rise(S4, { x: 156, y: 500, w: 900, h: 70, html: 'for compliance teams.', font: `500 56px/70px ${INTER}`, color: G600, ls: '-.02em', sp: 'snappy' });
const rach2 = mk(S4, { left: 860, top: 150, width: 1100, height: 651 }, `<img src="assets/rachel_laptop.webp" style="left:0;top:0;width:1100px">`);

// S5 end (y = 4H) ---------------------------------------------------------------------------------------------------------------
const S5 = mk(CAM, { top: Y[4], width: W, height: H });
const LOGO = { x: 560, y: 420, w: 800, h: 113, k: 800 / 170 };
const logoMark = mk(S5, { left: LOGO.x, top: LOGO.y, width: 46 * LOGO.k, height: LOGO.h, overflow: 'hidden', transformOrigin: '50% 50%' }, `<img src="assets/logo.svg" style="left:0;top:0;width:${LOGO.w}px;height:${LOGO.h}px">`);
const logoWord = mk(S5, { left: LOGO.x + 46 * LOGO.k, top: LOGO.y, width: LOGO.w - 46 * LOGO.k, height: LOGO.h, overflow: 'hidden' }, `<img src="assets/logo.svg" style="left:${-46 * LOGO.k}px;top:0;width:${LOGO.w}px;height:${LOGO.h}px">`);
const cta = mk(S5, { left: 760, top: 600, height: 96, padding: '0 44px', borderRadius: 14, background: BLUE, color: '#fff', font: `600 34px/96px ${INTER}`, whiteSpace: 'nowrap', boxShadow: '0 18px 40px rgba(0,81,255,.28)', transformOrigin: '50% 50%' }, 'Book a Demo &nbsp;→');
const tag = Rise(S5, { x: 600, y: 750, w: 720, h: 50, html: '<div style="width:720px;text-align:center">Superpower for compliance teams.</div>', font: `500 30px/50px ${INTER}`, color: G600, ls: '-.01em', sp: 'snappy' });
// loop centres of the infinity mark (logo viewBox units -> screen)
const LOOPS = [[LOGO.x + 10.5 * LOGO.k, LOGO.y + 12 * LOGO.k / (LOGO.w / LOGO.h) * (LOGO.w / LOGO.h) / 1], [LOGO.x + 31.5 * LOGO.k, LOGO.y + 12 * (LOGO.h / 24)]];
LOOPS[0][1] = LOGO.y + 12 * (LOGO.h / 24);

// top layer: the orb(s), cursor, click ring ---------------------------------------------------------------------------------------
const TOP = mk(STAGE, { width: W, height: H });
const orb = orbEl(TOP), orb2 = orbEl(TOP);
const cursor = mk(TOP, { width: 42, height: 60, display: 'none', transformOrigin: '6px 4px' }, `<svg width="42" height="60" viewBox="0 0 28 40" style="left:0;top:0;overflow:visible;filter:drop-shadow(0 4px 6px rgba(0,0,0,.25))"><path d="M3 2 L3 30 L10 24 L15 36 L20 34 L15 22 L24 22 Z" fill="${NAVY}" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>`);
const clickRing = mk(TOP, { borderRadius: '50%', border: `2.5px solid ${BLUE}`, display: 'none' });

// ---------- orb path (screen space) ----------
const ACT = T.act, actIdx = t => track(t, [{ t: 0, v: 0 }, ...ACT.map((a, i) => ({ t: a, v: i }))]);
const listShift = t => -Math.max(0, actIdx(t) - 1) * 86;            // the camera rides down the list
const ORBK = [
  { t: 0, v: [1010, 330, 22] }, { t: 0.001, v: [1010, 430, 22] }, { t: T.orbLand, v: [1010, 742, 22] }, { t: T.lift, v: [960, 540, 22] },
  { t: T.drop + b(2), v: [940, 0, 22] },                       // y filled per frame from the active line
  { t: T.grow + b(1), v: [1422, 470, 18] }, { t: T.f2, v: [1180, 640, 18] },
  { t: T.cam2 + b(0.5), v: [1100, 540, 120] }, { t: T.ringOut, v: [1620, 560, 120] },
  { t: T.cam3 + b(0.5), v: [960, 410, 26] }, { t: T.cam4 + b(0.5), v: [960, 470, 40] }];
function orbAt(t) {
  const k = ORBK.map(o => ({ t: o.t, v: o.v.slice() }));
  const ly = 548 + 35 + listShift(t) + actIdx(t) * 86;                // centre of the active line
  k[3].v[1] = ly;
  return [0, 1, 2].map(i => track(t, k.map(o => ({ t: o.t, v: o.v[i], spring: o.t === T.orbLand ? 'snappy' : 'default' }))));
}

// =====================================================================================================================
window.seek = function (t) {
  V = view(t); put(VIEW, { x: V.dx, y: V.dy, s: V.z });
  const cy = camY(t); put(CAM, { x: camX(t), y: -cy });
  show(S1, cy < H); show(S2, cy > 1 && cy < 2 * H - 1); show(S3, cy > H + 1 && cy < 3 * H - 1); show(S4, cy > 2 * H + 1 && cy < 4 * H - 1); show(S5, cy > 3 * H + 1);

  // S1
  W1.forEach(([f, t0]) => f(t, t0)); chip1(t, T.chip1); cards.forEach(f => f(t));

  // S2: Meet Rachel, frame, list
  meet(t, T.drop, T.grow); chipR(t, T.chipR, T.grow); sub(t, T.sub, T.grow);
  const ru = sp(t, T.rachel, 'heavy'), rout = sp(t, T.grow, 'default');
  put(rachel, { y: (1 - ru) * 600 + 8 * Math.sin(t * 1.1), x: rout * 900, s: 1 - 0.2 * rout }); rachel.style.visibility = ru < 0.005 || rout > 0.995 ? 'hidden' : 'visible';
  const g = sp(t, T.grow, 'default'), FR = [1440, 210, 400, 540], DB = [110, 120, 1700, 771];
  const fr = FR.map((v, i) => lerp(v, DB[i], g)), hs = sp(t, T.frame, 'snappy');
  hR(t >= T.frame && t < T.grow + b(1.5) && hs > 0.01, fr[0], fr[1], fr[2], fr[3], 0.85 + 0.15 * hs);
  if (show(labR, t >= T.frame + b(0.25) && t < T.grow)) { labR.style.left = FR[0] + 2 + 'px'; labR.style.top = FR[1] - 40 + 'px'; put(labR, { s: sp(t, T.frame + b(0.25), 'snappy') }); }
  if (show(win, t >= T.grow && t < T.cam2 + b(1))) { rect(win, fr[0], fr[1], fr[2], fr[3]); win.style.borderRadius = 26 * g + 'px'; win.style.boxShadow = `0 50px 120px rgba(4,21,42,${0.16 * g}),0 0 0 1px rgba(4,21,42,.06)`; put(winImg, { x: DB[0] - 20 - fr[0] - 40 * sp(t, T.f1, 'heavy'), y: DB[1] - 60 - fr[1] }); }
  const pan = -40 * sp(t, T.f1, 'heavy');
  const F1 = [490 + pan, 300, 920, 170], F2 = [450 + pan, 600, 760, 320], fsel = track(t, [{ t: 0, v: 0 }, { t: T.f2, v: 1 }]);
  const P = F1.map((v, i) => lerp(v, F2[i], fsel)), ps = sp(t, T.f1, 'snappy') * (1 - sp(t, T.cam2, 'snappy'));
  hP(t >= T.f1 && ps > 0.01, P[0], P[1], P[2], P[3], 0.9 + 0.1 * ps);
  [[labP1, T.f1, T.f2], [labP2, T.f2, T.cam2]].forEach(([l, a, z]) => { if (show(l, t >= a && t < z)) { l.style.left = P[0] + 2 + 'px'; l.style.top = P[1] - 40 + 'px'; put(l, { s: sp(t, a, 'snappy') }); } });
  lines.forEach((f, i) => f(t, T.list + b(0.25 * i), T.grow));
  const ai = actIdx(t); put(LIST, { y: listShift(t) * (1 - 0) });
  lineInner.forEach((e, i) => { if (e === arrow) return; const on = clamp(1 - Math.abs(ai - i)); e.style.color = `rgba(${Math.round(lerp(4, 0, on))},${Math.round(lerp(21, 81, on))},${Math.round(lerp(42, 255, on))},${lerp(0.22, 1, on)})`; e.style.fontWeight = on > 0.5 ? 600 : 500; e.style.transform += ` translateX(${46 * on}px)`; });
  if (show(arrow, t >= T.act[0] && t < T.grow)) { arrow.style.left = '150px'; arrow.style.top = 548 + 20 + ai * 86 + 'px'; put(arrow, { s: sp(t, T.act[0], 'snappy') }); }

  // S3: ring, then field
  const rs = sp(t, T.ring, 'snappy') * (1 - sp(t, T.ringOut, 'snappy'));
  if (show(ring, rs > 0.01)) put(ring, { rot: 20 * (t - T.ring), s: rs });
  expl(t, T.expl, T.ringOut); aud(t, T.aud, T.ringOut);
  const fu = sp(t, T.field, 'default'); put(fieldBlob, { y: (1 - fu) * 700 }); put(fieldScreen, {});
  fw(t, T.fw1); fchip(t, T.fchip);

  // S4
  supA(t, T.sup); supB(t, T.sup + b(0.5));
  const r2 = sp(t, T.rachel2, 'default'); put(rach2, { x: (1 - r2) * 700, y: 8 * Math.sin(t * 1.1) });

  // S5: logo from the two orbs, CTA, cursor
  const lg = sp(t, T.logo, 'snappy'); put(logoMark, { s: lg }); logoMark.style.visibility = lg < 0.01 ? 'hidden' : 'visible';
  const wu = sp(t, T.word, 'heavy'); logoWord.style.clipPath = `inset(0 ${(1 - wu) * 100}% 0 0)`;
  const cs = sp(t, T.cta, 'snappy') * (1 - 0.05 * (sp(t, T.click, 'snappy') - sp(t, T.click + 0.12, 'snappy'))); put(cta, { s: cs }); cta.style.visibility = cs < 0.01 ? 'hidden' : 'visible';
  tag(t, T.cta + b(0.5));

  // orb(s)
  let [ox, oy, orr] = orbAt(t);
  const sp2 = sp(t, T.split, 'default'), into = sp(t, T.logo, 'snappy');
  const L0 = [LOOPS[0][0], LOOPS[0][1]], L1 = [LOOPS[1][0], LOOPS[1][1]];
  if (t >= T.split) {
    const a = [lerp(ox, L0[0], sp2), lerp(oy, L0[1], sp2)], c = [lerp(ox, L1[0], sp2), lerp(oy, L1[1], sp2)], r = lerp(orr, 22, sp2) * (1 - into);
    show(orb, r > 0.5); show(orb2, r > 0.5); placeOrb(orb, ...toScreen(a[0], a[1]), r * V.z); placeOrb(orb2, ...toScreen(c[0], c[1]), r * V.z);
  } else { show(orb2, false); show(orb, true); placeOrb(orb, ...toScreen(ox, oy), orr * V.z); }

  const curOn = t >= T.curIn && t < DUR + 1;
  if (show(cursor, curOn)) { const cx = track(t, [{ t: 0, v: 1400 }, { t: T.curIn, v: 980 }]), cyy = track(t, [{ t: 0, v: 960 }, { t: T.curIn, v: 660 }]); const [scx, scy] = toScreen(cx, cyy); put(cursor, { x: scx, y: scy, s: sp(t, T.curIn, 'snappy') * (1 - 0.15 * (sp(t, T.click, 'snappy') - sp(t, T.click + 0.12, 'snappy'))) }); }
  const cr = sp(t, T.click, { k: 14, c: 8.5 });
  if (show(clickRing, t >= T.click && cr < 0.98)) { const r = 20 + 240 * cr, [rx0, ry0] = toScreen(960, 648); Object.assign(clickRing.style, { left: rx0 - r + 'px', top: ry0 - r * 0.4 + 'px', width: 2 * r + 'px', height: 0.8 * r + 'px', opacity: 0.6 * (1 - cr) }); }
};
