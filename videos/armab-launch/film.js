// Armab Agency launch film. 30 s, 1920x1080, 120 BPM (beat = 0.5 s, bar = 2 s). Everything is a pure function of t.
// Real material: nav pill, service rows, proof rows, buttons, logos, project images and copy captured from armabagency.vercel.app.
// A strip of panels, a camera that pushes between them on a spring, the real nav pill persistent above.
// Panels: 0 hero | 1 who | 2 services | 3 work | 4 proof | 5 CTA | 6 hero again (so frame 30.0 == frame 0.0).
// Camera pushes land on bar lines: 4, 8, 14, 22, 26, and the return at 29.
const { spring, track, indicator, swapAlpha, loopT, clamp, lerp } = Motion;
const T = window.TOKENS, W = FORMAT.w, H = FORMAT.h, stage = document.getElementById('stage');
const DUR = 30;
const INK = '#14201F', CREAM = '#F3F3EF', FOREST = '#0F2318', IVORY = '#EDF1EB', SAGE = '#B9CBB5', GREEN = '#64816D';
const PP = "'PP Neue Montreal', system-ui, sans-serif", AIL = "'Aileron', 'Helvetica Neue', Helvetica, Arial, sans-serif";

// ---------- fonts and images (the site's own files) ----------
const fontCss = document.createElement('style');
fontCss.textContent = `
@font-face{font-family:'PP Neue Montreal';src:url(assets/fonts/pp-400.otf);font-weight:400}
@font-face{font-family:'PP Neue Montreal';src:url(assets/fonts/pp-500.otf);font-weight:500}
@font-face{font-family:'PP Neue Montreal';src:url(assets/fonts/pp-700.otf);font-weight:700}
@font-face{font-family:'Aileron';src:url(assets/fonts/aileron-400.otf);font-weight:400}
@font-face{font-family:'Aileron';src:url(assets/fonts/aileron-600.otf);font-weight:600}
@font-face{font-family:'Aileron';src:url(assets/fonts/aileron-700.otf);font-weight:700}
#stage *{position:absolute;margin:0;padding:0;box-sizing:border-box}`;
document.head.appendChild(fontCss);
const IMG = {
  nav: 'assets/prep/nav_pill.png', btnInk: 'assets/ui/btn-ink.png', btnIvory: 'assets/ui/btn-ivory.png',
  logoWood: 'assets/prep/logo-wood.png', logoIcon: 'assets/prep/logo-icon.png',
  fuhsi: 'assets/prep/fuhsi.jpg', billet: 'assets/prep/billet.jpg', kitty: 'assets/prep/kitty.jpg', opus: 'assets/prep/opus.jpg',
  ...Object.fromEntries([0, 1, 2, 3, 4].map(i => ['svc' + i, `assets/ui/service_${i}.png`])),
  ...Object.fromEntries([0, 2, 5].map(i => ['proof' + i, `assets/ui/proof_${i}.png`])),
};
window.__preload = [
  document.fonts.load("500 20px 'PP Neue Montreal'"), document.fonts.load("400 20px 'PP Neue Montreal'"),
  document.fonts.load("400 20px 'Aileron'"), document.fonts.load("600 20px 'Aileron'"),
  ...Object.values(IMG).map(src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; })),
];

// ---------- tiny DOM helpers (built once; seek() only changes style values) ----------
const PX = new Set(['left', 'top', 'width', 'height', 'borderRadius', 'fontSize']);
function mk(parent, o = {}, html) {
  const e = document.createElement('div'); e.style.left = '0px'; e.style.top = '0px';
  for (const k in o) e.style[k] = (PX.has(k) && typeof o[k] === 'number') ? o[k] + 'px' : o[k];
  if (o.right !== undefined && o.left === undefined) e.style.left = 'auto';
  if (html != null) e.innerHTML = html;
  parent.appendChild(e); return e;
}
function put(e, o) {
  const st = e.style;
  if (o.w !== undefined) st.width = o.w + 'px';
  if (o.h !== undefined) st.height = o.h + 'px';
  if (o.bg !== undefined) st.background = o.bg;
  if (o.op !== undefined) { st.opacity = o.op; st.visibility = o.op <= 0.003 ? 'hidden' : 'visible'; }
  st.transform = `translate(${o.x || 0}px,${o.y || 0}px) rotate(${o.rot || 0}deg) scale(${o.sx ?? o.s ?? 1},${o.sy ?? o.s ?? 1})`;
}
const text = (parent, str, o = {}) => mk(parent, {
  font: `${o.weight || 500} ${o.size || 32}px ${o.face || AIL}`, color: o.color || INK, whiteSpace: 'nowrap',
  letterSpacing: (o.track || 0) + 'em', lineHeight: o.lh || 1.1, fontVariantNumeric: 'tabular-nums', ...(o.css || {}) }, str);
const pic = (parent, src, o = {}) => mk(parent, { backgroundImage: `url(${src})`, backgroundSize: o.fit || 'cover', backgroundPosition: o.pos || 'center', backgroundRepeat: 'no-repeat', ...o });
const pulse = (t, a, d = 0.16) => spring(t - a, 'snappy') * (1 - spring(t - (a + d), 'snappy'));
const enterT = (t, t0, p = 'default') => spring(t - t0, p);
// masked rising text: starts below its box, leaves upward. y01 in box heights.
function rise(parent, str, o) {
  const h = o.size * 1.18;
  const box = mk(parent, { left: o.x, top: o.y, width: o.w || 1700, height: h, overflow: 'hidden' });
  const inner = text(box, str, { size: o.size, weight: o.weight || 500, face: o.face || PP, color: o.color || INK, track: o.track ?? -0.04, lh: 1.18, css: o.css });
  return { box, inner, h, set(y01) { put(inner, { y: y01 * h }); } };
}
const riseY = (t, a, b, p = 'heavy') => (1 - spring(t - a, p)) - spring(t - b, p);
function lines(panel, color, op) {   // the faint vertical column lines the real site draws
  const g = mk(panel, { width: W, height: H });
  for (let k = 1; k < 8; k++) mk(g, { left: k * 240, top: 0, width: 2, height: H, background: color, opacity: op });
  return g;
}

// ---------- panels ----------
const world = mk(stage, { width: W * 7, height: H });
const BG = [CREAM, CREAM, FOREST, CREAM, CREAM, FOREST, CREAM];
const panels = BG.map((bg, i) => mk(world, { left: i * W, width: W, height: H, background: bg }));
const PUSH = [4, 8, 14, 22, 26, 29];
const CAM = PUSH.map((t, i) => ({ t, v: (i + 1) * W, spring: 'default' })); CAM.unshift({ t: 0, v: 0 });

// ======================= hero (panel 0) and the same hero again (panel 6) =======================
function buildHero(panel, withHook) {
  lines(panel, INK, 0.07);
  const armab = rise(panel, 'Armab', { x: 92, y: 118, size: 300, weight: 500, track: -0.055, color: INK });
  const agency = rise(panel, 'Agency', { x: 312, y: 380, size: 300, weight: 500, track: -0.055, color: GREEN });
  const logo = pic(panel, IMG.logoWood, { left: 1250, top: 140, width: 560, height: 560, fit: 'contain' });
  const HOOK = ['Roadblocks, removed.', 'Strategic brands.', 'Digital experiences.'];
  const hooks = withHook ? HOOK.map(h => rise(panel, h, { x: 96, y: 722, size: 124, weight: 500, track: -0.045 })) : [];
  text(panel, 'Strategic brand & digital studio', { size: 34, weight: 400, css: { left: '100px', top: '918px' } });
  text(panel, 'armabagency.vercel.app', { size: 30, weight: 600, color: GREEN, css: { left: '100px', top: '968px' } });
  const btn = pic(panel, IMG.btnInk, { left: 650, top: 905, width: 255, height: 70, fit: 'contain' });
  return t => {
    armab.set(0); agency.set(0);
    const lt = loopT(t, DUR);             // periodic in the loop length: frame 30 == frame 0
    put(logo, { y: Math.sin(2 * Math.PI * (lt / DUR * 3)) * 9, rot: Math.sin(2 * Math.PI * (lt / DUR * 2 + 0.2)) * 1.2 });
    // three beats of the site's own copy: 0.5-1.9, 1.9-2.7, 2.7-3.45
    const HT = [[0.5, 1.9], [1.9, 2.7], [2.7, 3.45]];
    hooks.forEach((h, i) => h.set(riseY(t, HT[i][0], HT[i][1])));
  };
}

// ======================= who (panel 1): New Agency. Not new to this. =======================
function buildWho(panel, t0) {
  lines(panel, INK, 0.07);
  const mkPair = (a, b, size, ya) => [rise(panel, a, { x: 96, y: ya, size, weight: 500, track: -0.045 }), rise(panel, b, { x: 96, y: ya + size * 1.02, size, weight: 500, track: -0.045, color: GREEN })];
  const A = mkPair('New Agency.', 'Not new to this.', 190, 230), B = mkPair('Led by two', 'strategic partners.', 170, 235);
  const subA = rise(panel, 'A founder-led strategic digital agency.', { x: 100, y: 680, size: 54, weight: 400, face: AIL, track: 0, color: INK });
  const subB = rise(panel, 'No corporate layers, no junior handoff.', { x: 100, y: 680, size: 54, weight: 400, face: AIL, track: 0, color: INK });
  const hex = pic(panel, IMG.logoIcon, { left: 1290, top: 250, width: 480, height: 480, fit: 'contain' });
  return t => {
    A.forEach((l, i) => l.set(riseY(t, t0 + 0.1 + 0.09 * i, 5.85 + 0.07 * i)));
    B.forEach((l, i) => l.set(riseY(t, 6.0 + 0.09 * i, 99)));
    subA.set(riseY(t, t0 + 0.4, 5.8)); subB.set(riseY(t, 6.3, 99));
    const e = enterT(t, t0 + 0.2, 'heavy'), nudge = pulse(t, 6.0, 0.3);
    put(hex, { y: (1 - e) * 120 - 18 * nudge, s: (0.7 + 0.3 * e) * (1 + 0.04 * nudge), op: Math.min(1, e * 3) });
  };
}

// ======================= services (panel 2): the real rows, lit on the beat =======================
function buildServices(panel, t0) {
  lines(panel, IVORY, 0.07);
  const RW = 1400, RH = RW * 438 / 3714, GAP = 8, Y0 = 190, X0 = (W - RW) / 2;
  const KW = [['EXPRESSION', 'GROWTH'], ['CONSISTENCY', 'STORY'], ['HIERARCHY', 'FEEDBACK'], ['SPEED', 'SCALABILITY'], ['REALISM', 'MOVEMENT']];
  const rows = KW.map((kw, i) => {
    const g = mk(panel, { left: X0, top: Y0 + i * (RH + GAP), width: RW, height: RH });
    const img = pic(g, IMG['svc' + i], { left: 0, top: 0, width: RW, height: RH, fit: 'contain' });
    const mkw = w => text(g, w, { size: 20, weight: 600, color: SAGE, track: 0.12, css: { right: '-70px', top: RH / 2 - 11 + 'px' } });
    return { g, img, k1: mkw(kw[0]), k2: mkw(kw[1]), cy: Y0 + i * (RH + GAP) + RH / 2 };
  });
  return t => {
    rows.forEach((r, i) => {
      const e = enterT(t, t0 + 0.2 + 0.07 * i);
      const w1 = [9.0 + 0.5 * i, 9.5 + 0.5 * i], w2 = [11.6 + 0.4 * i, 12.0 + 0.4 * i];
      const a1 = spring(t - w1[0], 'snappy') * (1 - spring(t - w1[1], 'snappy')), a2 = spring(t - w2[0], 'snappy') * (1 - spring(t - w2[1], 'snappy'));
      const a = Math.max(a1, a2), settle = spring(t - 13.7, 'default');
      put(r.g, { y: (1 - e) * 160, x: 22 * a, s: 1 + 0.012 * a, op: Math.min(1, e * 3) * (0.36 + 0.64 * Math.max(a, settle * 0.0)) });
      put(r.k1, { op: swapAlpha(t, w1[0] + 0.06, w2[0] - 0.05), y: (1 - spring(t - w1[0], 'snappy')) * 14 });
      put(r.k2, { op: swapAlpha(t, w2[0] + 0.06, 99), y: (1 - spring(t - w2[0], 'snappy')) * 14 });
    });
  };
}

// ======================= work (panel 3): a rail of the four real projects =======================
function buildWork(panel, t0) {
  const bgl = lines(panel, INK, 0.07);
  const P = [
    { n: 'Fuhsi Market', d: 'A campus marketplace built to make student trading safer and simpler.', img: IMG.fuhsi, w: 430 },
    { n: 'Billet Design', d: 'Machined mechanical keyboards built for people who do serious work at their desks.', img: IMG.billet, w: 800 },
    { n: 'Kitty', d: 'A digital pot for shared experiences.', img: IMG.kitty, w: 480 },
    { n: 'Opus', d: 'Bringing everything that defines a brand into one intelligent platform.', img: IMG.opus, w: 1000 }];
  const CH = 600, GAPX = 200, Y = 210; let x = 0;
  P.forEach(p => { p.x = x; p.c = x + p.w / 2; x += p.w + GAPX; });
  const rail = mk(panel, { width: x, height: H });
  P.forEach((p, i) => {
    p.g = mk(rail, { left: p.x, top: Y, width: p.w, height: CH + 220 });
    p.frame = mk(p.g, { left: 0, top: 0, width: p.w, height: CH, overflow: 'hidden', borderRadius: 4 });
    p.im = pic(p.frame, p.img, { left: 0, top: 0, width: p.w, height: CH });
    p.title = rise(p.g, p.n, { x: 0, y: CH + 22, size: 76, weight: 500, track: -0.04, w: Math.max(p.w, 900) });
    p.desc = rise(p.g, p.d, { x: 4, y: CH + 118, size: 28, weight: 400, face: AIL, track: 0, w: 1300, color: INK });
  });
  const FOCUS = [14.0, 16.0, 18.0, 20.0];
  const railKeys = P.map((p, i) => ({ t: i === 0 ? 0 : FOCUS[i], v: 960 - p.c, spring: 'default' }));
  return t => {
    const rx = track(t, railKeys);
    put(rail, { x: rx });
    // column lines drift at a third of the rail speed (parallax); modulo keeps them periodic
    bgl.style.transform = `translateX(${((rx * 0.33) % 240)}px)`;
    P.forEach((p, i) => {
      const f = i === 0 ? 1 - spring(t - 16.0, 'default') : (i === 3 ? spring(t - 20.0, 'default') : spring(t - FOCUS[i], 'default') * (1 - spring(t - FOCUS[i + 1], 'default')));
      const e0 = enterT(t, t0 + 0.05 + 0.08 * i);
      put(p.g, { s: 0.82 + 0.18 * f, op: (0.45 + 0.55 * f) * Math.min(1, e0 * 3), y: (1 - e0) * 60 });
      put(p.im, { s: 1.1 - 0.1 * f });
      const a = FOCUS[i] + 0.06, b = i < 3 ? FOCUS[i + 1] - 0.05 : 99;
      p.title.set(riseY(t, a, b)); p.desc.set(riseY(t, a + 0.12, b));
    });
  };
}

// ======================= proof (panel 4): the real proof rows =======================
function buildProof(panel, t0) {
  lines(panel, INK, 0.07);
  const head = rise(panel, 'Trusted by teams who needed it done right.', { x: 100, y: 138, size: 72, weight: 500, track: -0.04, w: 1700 });
  const RW = 1500, X0 = (W - RW) / 2 + 60, SRC = [[0, 615], [2, 537], [5, 534]];
  let y = 250; const rows = SRC.map(([k, hpx], i) => {
    const h = RW * hpx / 3714, g = mk(panel, { left: X0, top: y, width: RW, height: h });
    pic(g, IMG['proof' + k], { left: 0, top: 0, width: RW, height: h, fit: 'contain' });
    const r = { g, y, h }; y += h + 26; return r;
  });
  const bar = mk(panel, { left: X0 - 40, top: 0, width: 9, height: 100, background: GREEN, borderRadius: 4 });
  const AT = [23.0, 24.0, 25.0];
  return t => {
    head.set(riseY(t, t0 + 0.1, 99));
    rows.forEach((r, i) => {
      const e = enterT(t, t0 + 0.2 + 0.14 * i);
      const a = spring(t - AT[i], 'snappy') * (1 - (i < 2 ? spring(t - AT[i + 1], 'snappy') : 0));
      put(r.g, { y: (1 - e) * 90, x: 16 * a, op: Math.min(1, e * 3) * (0.5 + 0.5 * a) });
    });
    const ind = indicator(t, rows.map((r, i) => ({ t: i === 0 ? 0 : AT[i], x: r.y, w: r.h })));
    put(bar, { y: ind.x, h: ind.w, op: spring(t - AT[0] + 0.15, 'snappy') });
    bar.style.height = ind.w + 'px';
  };
}

// ======================= CTA (panel 5) =======================
function buildCta(panel, t0) {
  lines(panel, IVORY, 0.07);
  const mkPair = (a, b, y) => [rise(panel, a, { x: 96, y, size: 134, weight: 500, track: -0.045, color: IVORY }), rise(panel, b, { x: 96, y: y + 150, size: 134, weight: 500, track: -0.045, color: SAGE })];
  const A = mkPair('Have a roadblock', 'holding you back?', 170), B = mkPair('Let’s remove it', 'properly.', 170);
  const logo = pic(panel, IMG.logoWood, { left: 1230, top: 170, width: 600, height: 600, fit: 'contain' });
  const btn = pic(panel, IMG.btnIvory, { left: 100, top: 680, width: 380, height: 105, fit: 'contain', transformOrigin: '50% 50%' });
  const url = rise(panel, 'armabagency.vercel.app', { x: 104, y: 828, size: 56, weight: 500, face: AIL, track: 0, color: IVORY, w: 900 });
  return t => {
    A.forEach((l, i) => l.set(riseY(t, t0 + 0.1 + 0.09 * i, 27.45 + 0.07 * i)));
    B.forEach((l, i) => l.set(riseY(t, 27.6 + 0.09 * i, 99)));
    const e = enterT(t, t0 + 0.15, 'heavy'), be = enterT(t, t0 + 0.6);
    put(logo, { y: (1 - e) * 140, s: 0.84 + 0.16 * e, op: Math.min(1, e * 3) });
    put(btn, { y: (1 - be) * 60, s: (0.9 + 0.1 * be) * (1 - 0.07 * pulse(t, 28.0, 0.2)), op: Math.min(1, be * 3) });
    url.set(riseY(t, 28.2, 99));
  };
}

const scenes = [buildHero(panels[0], true), buildWho(panels[1], 3.88), buildServices(panels[2], 7.88), buildWork(panels[3], 13.88), buildProof(panels[4], 21.88), buildCta(panels[5], 25.88), buildHero(panels[6], false)];

// ---------- persistent: the real nav pill (the site's own fixed header), with an underline that follows the section ----------
const NW = 900, NH = NW * 150 / 1620, NX = (W - NW) / 2, NY = 28, K = NW / 1620;
const navEl = pic(stage, IMG.nav, { left: NX, top: NY, width: NW, height: NH, fit: 'contain', zIndex: 20, boxShadow: '0 10px 30px rgba(20,32,31,.10)', borderRadius: NH / 2 });
const under = mk(stage, { left: 0, top: NY + NH * 0.74, width: 10, height: 3, background: GREEN, zIndex: 21, transformOrigin: '0 50%' });
const NAVX = { about: [61, 184], work: [250, 356], services: [1140, 1313], contact: [1381, 1555] };
const stop = (t, k) => ({ t, x: NX + NAVX[k][0] * K, w: (NAVX[k][1] - NAVX[k][0]) * K });
const STOPS = [stop(0, 'about'), stop(8.0, 'services'), stop(14.0, 'work'), stop(22.0, 'about'), stop(26.0, 'contact')];

window.seek = function (t) {
  const cam = track(t, CAM);
  put(world, { x: -cam });
  panels.forEach((p, i) => { const vis = Math.abs(cam - i * W) < W * 1.02; p.style.display = vis ? 'block' : 'none'; if (vis) scenes[i](t); });
  const ind = indicator(t, STOPS);
  const op = spring(t - 3.95, 'snappy') * (1 - spring(t - 28.9, 'snappy'));
  put(under, { x: ind.x, sx: ind.w / 10, op });
};
