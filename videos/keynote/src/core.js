// core.js: shared helpers for the Armab keynote film. 1440x1440, 120 BPM (beat = 0.5 s). Everything is a pure function of t.
const { spring, track, indicator, swapAlpha, loopT, clamp, lerp, mulberry32 } = Motion;
const W = 1440, C = 720, BEAT = 0.5, tb = n => n * BEAT;
const INK = '#0A0A0A', CANVAS = '#F4F0EA', STAGE = document.getElementById('stage');
const SNAP = { k: 520, c: 40 }, SOFT = { k: 150, c: 20 };   // two extra spring presets (tiny overshoot / soft)

// ---------- fonts, images ----------
const fontCss = document.createElement('style');
fontCss.textContent = `
@font-face{font-family:'Archivo';src:url(assets/fonts/archivo-wdth.woff2) format('woff2');font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:'Geist';src:url(assets/fonts/geist.woff2) format('woff2');font-weight:100 900}
#stage *{position:absolute;box-sizing:border-box;margin:0;padding:0}
#stage svg{overflow:visible}`;
document.head.appendChild(fontCss);
const IMGS = { corridor: 'assets/img/corridor.png', towers: 'assets/img/towers.jpg', sketch: 'assets/img/sketch.jpg', keyboard: 'assets/img/keyboard.jpg',
  fuhsi: 'assets/img/fuhsi.jpg', hero: 'assets/img/site_hero.png', nav: 'assets/img/nav_pill.png', wood: 'assets/img/logo_wood.png' };
const IMGEL = {};
window.__preload = [document.fonts.load("800 100px 'Archivo'"), document.fonts.load("600 40px 'Geist'"), document.fonts.load("400 40px 'Geist'"), document.fonts.load("300 40px 'Geist'"),
  ...Object.entries(IMGS).map(([k, src]) => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => { IMGEL[k] = i; r(); }; i.src = src; }))];

// ---------- DOM helpers (built once; seek only changes style values) ----------
const PXK = new Set(['left', 'top', 'width', 'height', 'borderRadius', 'fontSize']);
function mk(parent, o = {}, html) {
  const e = document.createElement('div'); e.style.left = '0px'; e.style.top = '0px';
  for (const k in o) e.style[k] = (PXK.has(k) && typeof o[k] === 'number') ? o[k] + 'px' : o[k];
  if (o.right !== undefined && o.left === undefined) e.style.left = 'auto';
  if (html != null) e.innerHTML = html;
  parent.appendChild(e); return e;
}
function put(e, o) {   // geometry + transform in one call; 2D transforms only
  const st = e.style;
  if (o.w !== undefined) st.width = o.w + 'px';
  if (o.h !== undefined) st.height = o.h + 'px';
  if (o.r !== undefined) st.borderRadius = o.r + 'px';
  if (o.bg !== undefined) st.background = o.bg;
  if (o.op !== undefined) { st.opacity = o.op; st.visibility = o.op <= 0.003 ? 'hidden' : 'visible'; }
  st.transform = `translate(${o.x || 0}px,${o.y || 0}px) rotate(${o.rot || 0}deg) scale(${o.sx ?? o.s ?? 1},${o.sy ?? o.s ?? 1})`;
}
const show = (e, on) => { e.style.display = on ? 'block' : 'none'; return on; };
const GEIST = "'Geist', system-ui, sans-serif", ARCH = "'Archivo', 'Arial Black', sans-serif";
const sp = (t, a, p = 'default') => spring(t - a, p);
const hold = (t, a, b) => spring(t - a, 'snappy') * (1 - spring(t - b, 'snappy'));
const sstep = x => x * x * (3 - 2 * x);
const mixc = (a, b, u) => { u = clamp(u); const A = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return 'rgb(' + A.map((x, i) => Math.round(x + (B[i] - x) * u)).join(',') + ')'; };
const PHOTO = (key, o = {}) => ({ backgroundImage: `url(${IMGS[key]})`, backgroundSize: o.size || 'cover', backgroundPosition: o.pos || 'center', backgroundRepeat: 'no-repeat' });

// ---------- layers (bottom to top) ----------
const L = {};
L.canvas = mk(STAGE, { width: W, height: W, background: CANVAS });
L.wall = mk(STAGE, { width: W, height: W, overflow: 'hidden' });
L.world = mk(STAGE, { width: W, height: W });          // camera layer: the off-white world (tiles, wordmark, windows)
L.scr = mk(STAGE, { width: W, height: W, overflow: 'hidden' });   // glass + lock-screen layer (screen space, can shrink into a phone)
L.top = mk(STAGE, { width: W, height: W });             // floods, iris, cursor
const camEl = mk(L.world, { left: 0, top: 0, width: W, height: W, transformOrigin: '0 0' });

// ---------- camera: screen = (world - c) * s + 720 ----------
const CAMK = { x: [{ t: 0, v: C }], y: [{ t: 0, v: C }], s: [{ t: 0, v: 1 }] };
function camera(t) { return { cx: track(t, CAMK.x), cy: track(t, CAMK.y), s: track(t, CAMK.s) }; }
const toScreen = (x, y, cam) => [(x - cam.cx) * cam.s + C, (y - cam.cy) * cam.s + C];
function applyCamera(cam) { camEl.style.transform = `translate(${C - cam.cx * cam.s}px,${C - cam.cy * cam.s}px) scale(${cam.s})`; }

// ---------- cursor: segments of waypoints; a segment is in world space (scales with the camera) or screen space ----------
// seg = { a, b, space: 'world'|'screen', x: [{t,v,spring}], y: [...], press: [[t0,t1]] }  (the cursor shows while a <= t < b)
const CURSEGS = [];
const cursorEl = mk(L.top, { left: 0, top: 0, width: 60, height: 60, transformOrigin: '9px 6px', zIndex: 50 },
  `<svg width="60" height="60" viewBox="0 0 24 24" style="position:absolute;left:0;top:0;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))"><path d="M5 3l14 8.5-6.2 1.3 3.7 6.9-2.9 1.5-3.7-6.9L5 19.2z" fill="#0A0A0A" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`);
function updateCursor(t, cam) {
  const sg = CURSEGS.find(g => t >= g.a && t < g.b);
  if (!sg) { cursorEl.style.display = 'none'; return; }
  cursorEl.style.display = 'block';
  const wx = track(t, sg.x, 'default'), wy = track(t, sg.y, 'default');
  const pr = (sg.press || []).reduce((m, [a, b]) => Math.max(m, hold(t, a, b)), 0);
  const [sx, sy] = sg.space === 'world' ? toScreen(wx, wy, cam) : [wx, wy];
  const sc = (sg.space === 'world' ? cam.s : 1) * (1 - 0.16 * pr);
  cursorEl.style.transform = `translate(${sx - 9}px,${sy - 6}px) scale(${sc})`;
}

// ---------- flood: a black circle that fills the frame (overscaled past the corners) ----------
const floodEl = mk(L.top, { left: 0, top: 0, width: 100, height: 100, borderRadius: 50, background: INK, display: 'none', zIndex: 40 });
function setFlood(x, y, r) { if (r < 0.5) { floodEl.style.display = 'none'; return; } floodEl.style.display = 'block'; Object.assign(floodEl.style, { left: x - r + 'px', top: y - r + 'px', width: 2 * r + 'px', height: 2 * r + 'px', borderRadius: r + 'px' }); }
const FLOOD_R = 1100;   // > half the diagonal (1018) so the corners are covered

// ---------- iris: six blades around a hexagonal aperture; the hole is the intersection of six half-planes ----------
const irisSvg = mk(L.top, { left: 0, top: 0, width: W, height: W, display: 'none', zIndex: 45 },
  `<svg width="${W}" height="${W}" viewBox="0 0 ${W} ${W}" style="position:absolute;left:0;top:0">
    <defs><mask id="irisM" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${W}"><circle id="irisC" cx="720" cy="720" r="330" fill="#fff"/><polygon id="irisH" points="" fill="#000"/></mask></defs>
    <rect width="${W}" height="${W}" fill="#0A0A0A" mask="url(#irisM)"/>
    <g mask="url(#irisM)" id="irisL" stroke="rgba(255,255,255,.17)" stroke-width="2.4"></g></svg>`);
const irisC = irisSvg.querySelector('#irisC'), irisH = irisSvg.querySelector('#irisH'), irisL = irisSvg.querySelector('#irisL');
irisL.innerHTML = Array.from({ length: 6 }, () => '<line x1="0" y1="0" x2="0" y2="0"/>').join('');
const irisLines = [...irisL.querySelectorAll('line')];
function setIris(cx, cy, R, a, rot) {   // R: housing radius, a: aperture circumradius (>= R*1.3 means fully open), rot in degrees
  if (a >= R * 1.35) { irisSvg.style.display = 'none'; return; }
  irisSvg.style.display = 'block'; irisC.setAttribute('cx', cx); irisC.setAttribute('cy', cy); irisC.setAttribute('r', R);
  const V = Array.from({ length: 6 }, (_, k) => { const th = (k * 60 + rot) * Math.PI / 180; return [cx + a * Math.cos(th), cy + a * Math.sin(th)]; });
  irisH.setAttribute('points', V.map(p => p.join(',')).join(' '));
  V.forEach((p, k) => { const n = V[(k + 1) % 6], dx = n[0] - p[0], dy = n[1] - p[1], len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, E = R * 2.2;
    const ln = irisLines[k]; ln.setAttribute('x1', p[0] - ux * E); ln.setAttribute('y1', p[1] - uy * E); ln.setAttribute('x2', n[0] + ux * E); ln.setAttribute('y2', n[1] + uy * E); });
}

// ---------- goo: blur + alpha threshold, source composited back on top so detail stays sharp ----------
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute"><filter id="goo" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="11" result="b"/><feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 34 -14" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter></svg>`);

// ---------- audio-independent frame-pop guard: every layer is rebuilt from t each frame (no state) ----------
