// Apple-style UI motion portfolio. 30 s, 1920x1080, 120 BPM (beat = 0.5 s). Everything is a pure function of t.
// A black Dynamic Island persists above six scenes on a camera strip. Frame 30.0 == frame 0.0 (loop).
// Scene starts land on bar lines: 0, 4, 10, 16, 22, 26 s.
const { spring, track, indicator, swapAlpha, loopT, clamp, lerp } = Motion;
const T = window.TOKENS, W = FORMAT.w, H = FORMAT.h, stage = document.getElementById('stage');
const DUR = 30;
const MUTED = '#86868B', GREY = '#E9E9ED', SHADOW = '0 1px 2px rgba(0,0,0,.06), 0 18px 40px rgba(0,0,0,.08)';

// ---------- fonts (Inter is the open stand-in for SF Pro) ----------
const fontCss = document.createElement('style');
fontCss.textContent = `
@font-face{font-family:'Inter';src:url(assets/fonts/inter.woff2) format('woff2');font-weight:100 900}
@font-face{font-family:'Inter Tight';src:url(assets/fonts/inter-tight.woff2) format('woff2');font-weight:100 900}
#stage *{position:absolute;margin:0;padding:0;box-sizing:border-box}
#stage svg{overflow:visible}`;
document.head.appendChild(fontCss);
window.__preload = [document.fonts.load("500 20px 'Inter'"), document.fonts.load("800 20px 'Inter Tight'")];

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
  if (o.r !== undefined) st.borderRadius = o.r + 'px';
  if (o.bg !== undefined) st.background = o.bg;
  if (o.op !== undefined) { st.opacity = o.op; st.visibility = o.op <= 0.003 ? 'hidden' : 'visible'; }
  st.transform = `translate(${o.x || 0}px,${o.y || 0}px) rotate(${o.rot || 0}deg) scale(${o.sx ?? o.s ?? 1},${o.sy ?? o.s ?? 1})`;
}
const text = (parent, str, o = {}) => mk(parent, {
  font: `${o.weight || 600} ${o.size || 32}px ${o.face || T.uiFont}`, color: o.color || T.ink, whiteSpace: 'nowrap',
  letterSpacing: (o.track || 0) + 'em', lineHeight: o.lh || 1.1, fontVariantNumeric: 'tabular-nums', ...(o.css || {}) }, str);
// (mk clears `left` when only `right` is given; text() passes css through as style props)
const hexv = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixc = (a, b, u) => { u = clamp(u); const A = hexv(a), B = hexv(b); return 'rgb(' + A.map((x, i) => Math.round(x + (B[i] - x) * u)).join(',') + ')'; };
const fmtMoney = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const hold = (t, a, b) => spring(t - a, 'snappy') * (1 - spring(t - b, 'snappy'));   // a press: down at a, up at b
const pulse = (t, a, d = 0.16) => hold(t, a, a + d);

const ICON = {
  wifi: c => `<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.8 16a5 5 0 0 1 6.4 0" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="19.4" r="1.7" fill="${c}"/>`,
  cell: c => [4, 9, 14, 19].map((x, i) => `<rect x="${x - 1.6}" y="${17 - i * 4.2}" width="3.2" height="${4 + i * 4.2}" rx="1.4" fill="${c}"/>`).join(''),
  plane: c => `<path d="M21 15v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5.5z" fill="${c}"/>`,
  ring: c => `<g fill="none" stroke="${c}" stroke-width="2.1" stroke-linecap="round"><circle cx="12" cy="12" r="2.4" fill="${c}"/><path d="M7.2 7.2a6.8 6.8 0 0 0 0 9.6M16.8 7.2a6.8 6.8 0 0 1 0 9.6M4.4 4.4a10.8 10.8 0 0 0 0 15.2M19.6 4.4a10.8 10.8 0 0 1 0 15.2"/></g>`,
  sun: c => `<circle cx="12" cy="12" r="4.2" fill="${c}"/>` + Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<path d="M${12 + Math.cos(a) * 7.4} ${12 + Math.sin(a) * 7.4}L${12 + Math.cos(a) * 9.8} ${12 + Math.sin(a) * 9.8}" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`; }).join(''),
  speaker: c => `<path d="M3.5 9.5v5h3.8l5 4V5.5l-5 4z" fill="${c}"/><path d="M15.8 9.2a4.3 4.3 0 0 1 0 5.6M18.4 6.6a8 8 0 0 1 0 10.8" fill="none" stroke="${c}" stroke-width="2.1" stroke-linecap="round"/>`,
  moon: c => `<path d="M20 14.6A8.6 8.6 0 0 1 9.4 4a8.6 8.6 0 1 0 10.6 10.6z" fill="${c}"/>`,
  pause: c => `<rect x="6" y="4.5" width="4" height="15" rx="1.6" fill="${c}"/><rect x="14" y="4.5" width="4" height="15" rx="1.6" fill="${c}"/>`,
  bolt: c => `<path d="M13.2 2L5.5 13.6h5.6L10 22l8-12h-5.6z" fill="${c}"/>`,
  calc: c => `<rect x="4" y="2.5" width="16" height="19" rx="3.4" fill="none" stroke="${c}" stroke-width="2.1"/><rect x="7" y="5.5" width="10" height="3.6" rx="1" fill="${c}"/>` + [[8.2, 13], [12, 13], [15.8, 13], [8.2, 17], [12, 17], [15.8, 17]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="${c}"/>`).join(''),
  lens: c => `<circle cx="12" cy="12" r="9" fill="none" stroke="${c}" stroke-width="2.1"/><circle cx="12" cy="12" r="4.4" fill="${c}"/>`,
  timer: c => `<circle cx="12" cy="13.4" r="8" fill="none" stroke="${c}" stroke-width="2.1"/><path d="M12 13.4V8.6M9.6 2.8h4.8" stroke="${c}" stroke-width="2.1" stroke-linecap="round"/>`,
  bars: c => [0, 1, 2, 3].map(i => `<rect x="${3.5 + i * 4.8}" y="${10 - [3, 6, 4, 2][i]}" width="3" height="${4 + [6, 12, 8, 4][i]}" rx="1.5" fill="${c}"/>`).join(''),
};
const svg = (name, size, color) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24">${ICON[name](color)}</svg>`;

// ---------- stage, world strip, island ----------
stage.style.background = T.canvas;
const world = mk(stage, { width: W * 6, height: H });
const panels = Array.from({ length: 6 }, (_, i) => mk(world, { left: i * W, width: W, height: H }));
const CAM = [0, 4, 10, 16, 22, 26].map((s, i) => ({ t: s, v: i * W, spring: 'default' }));

// rising masked text: y offset in em units of box height; enters from below, exits upward
function rise(parent, str, o) {
  const size = o.size, h = size * (o.lh || 1.18);
  const box = mk(parent, { left: o.x, top: o.y, width: o.w || 1300, height: h, overflow: 'hidden' });
  const inner = text(box, str, { size, weight: o.weight || 700, face: o.face || T.displayFont, color: o.color || T.ink, track: o.track ?? -0.035, lh: 1.18, css: o.css });
  return { box, inner, h, set(y01) { put(inner, { y: y01 * h }); } };
}
function caption(panel, lines, sub, t0) {
  const L = lines.map((s, i) => rise(panel, s, { x: 150, y: 296 + i * 118, size: 104, weight: 760 }));
  const S = rise(panel, sub, { x: 154, y: 296 + lines.length * 118 + 18, size: 34, weight: 500, face: T.uiFont, color: MUTED, track: 0, lh: 1.3 });
  return t => { L.forEach((l, i) => l.set(1 - spring(t - (t0 + 0.08 * i), 'heavy'))); S.set(1 - spring(t - (t0 + 0.08 * lines.length + 0.04), 'heavy')); };
}
const card = (parent, o) => mk(parent, { left: o.x, top: o.y, width: o.w, height: o.h, borderRadius: o.r ?? 44, background: o.bg || T.surface, boxShadow: o.shadow === false ? 'none' : SHADOW, overflow: o.clip ? 'hidden' : 'visible' });
// widget group: every right-hand widget lives in one scaled wrapper per scene (bigger = readable at phone size)
const widgetGroup = panel => mk(panel, { width: W, height: H, transformOrigin: '1790px 570px', transform: 'scale(1.15)' });
const enterT = (t, t0, p = 'default') => spring(t - t0, p);
const pop = (e, el, dy = 60) => put(el, { y: (1 - e) * dy, s: 0.88 + 0.12 * e, op: Math.min(1, e * 3) });

// ======================= SCENE 1 / 6: intro (and the loop-closing finale) =======================
// cfg.enter(k, t) -> 0..1 per element; cfg.cycle = banners rotate (intro only)
function buildIntro(panel, cfg) {
  const WG = widgetGroup(panel);
  const head = ['Made', 'in code.'].map((s, i) => rise(panel, s, { x: 140, y: 262 + i * 196, size: 212, weight: 820, track: -0.045 }));
  const sub = rise(panel, 'A 30-second portfolio of UI motion.', { x: 150, y: 700, size: 38, weight: 500, face: T.uiFont, color: MUTED, track: 0, lh: 1.3 });
  const BAN = [
    ['Springs, not curves', 'Closed-form. Zero easing.', 'bars'], ['Every frame is f(t)', 'Seek anywhere. Same pixels.', 'timer'],
    ['Locked to the beat', 'Hits land within 45 ms.', 'wifi'], ['Real UI, built in DOM', 'Nothing faked. Nothing pasted.', 'calc'],
    ['One accent', 'Blue. That is all.', 'lens']];
  const banners = BAN.map(([a, b, ic], j) => {
    const el = card(WG, { x: 1030, y: 0, w: 700, h: 132, r: 38 });
    const icn = mk(el, { left: 28, top: 28, width: 76, height: 76, borderRadius: 22, background: j % 2 ? T.ink : T.accent }, `<div style="left:19px;top:19px">${svg(ic, 38, '#fff')}</div>`);
    text(el, a, { x: 0, size: 32, css: { left: '128px', top: '26px' } });
    text(el, b, { size: 27, weight: 500, color: MUTED, css: { left: '128px', top: '72px' } });
    text(el, 'now', { size: 24, weight: 500, color: MUTED, css: { right: '30px', top: '28px' } });
    return el;
  });
  return t => {
    head.forEach((h, i) => h.set(1 - cfg.enter(i, t, 'heavy')));
    sub.set(1 - cfg.enter(2, t, 'heavy'));
    banners.forEach((el, j) => {
      const keys = cfg.cycle ? [{ t: 0, v: j }, { t: 1.9, v: j - 1 }, { t: 3.1, v: j - 2 }] : [{ t: 0, v: j }];
      const s = track(t, keys, 'default'), e = cfg.enter(3 + j, t);
      const y = 296 + s * 160, out = clamp(-s, 0, 1.4);
      const op = (s < 0 ? 1 - clamp(-s * 1.15) : 1 - clamp((s - 2) / 0.9)) * Math.min(1, e * 3);
      put(el, { x: 880 * out, y: y + (1 - e) * 70, s: (s > 2 ? 1 - 0.06 * (s - 2) : 1) * (0.9 + 0.1 * e), op });
    });
  };
}

// ======================= SCENE 2: controls =======================
function buildControls(panel, t0) {
  const WG = widgetGroup(panel);
  const cap = caption(panel, ['Controls', 'that feel alive.'], 'Springs on every toggle, slider and tile.', t0 + 0.05);
  const CX = 1010, CY = 200, U = 170, G = 22;
  let idx = 0; const tiles = [];
  const tile = (c, r, cw, ch, o = {}) => {
    const x = CX + c * (U + G), y = CY + r * (U + G), w = cw * U + (cw - 1) * G, h = ch * U + (ch - 1) * G;
    const el = card(WG, { x, y, w, h, r: o.r ?? 48, bg: o.bg, clip: true }); tiles.push({ el, i: idx++ }); return { el, x, y, w, h };
  };
  // connectivity block
  const conn = tile(0, 0, 2, 2, { r: 56 });
  const btn = [['wifi', 36, 36, 5.5], ['cell', 186, 36, -1], ['plane', 36, 186, 1e9], ['ring', 186, 186, 1e9]].map(([ic, x, y, tOn]) => {
    const b = mk(conn.el, { left: x, top: y, width: 140, height: 140, borderRadius: 70, background: GREY });
    const off = mk(b, { left: 38, top: 38 }, svg(ic, 64, T.ink)), on = mk(b, { left: 38, top: 38 }, svg(ic, 64, '#fff'));
    return { b, off, on, tOn };
  });
  // music
  const music = tile(2, 0, 2, 1);
  text(music.el, 'Springs', { size: 34, css: { left: '34px', top: '30px' } });
  text(music.el, 'Motion Portfolio', { size: 25, weight: 500, color: MUTED, css: { left: '34px', top: '78px' } });
  const mTrack = mk(music.el, { left: 34, top: 130, width: 294, height: 8, borderRadius: 4, background: GREY });
  const mFill = mk(mTrack, { width: 120, height: 8, borderRadius: 4, background: T.ink });
  mk(music.el, { left: 262, top: 28, width: 64, height: 64 }, svg('pause', 64, T.ink));
  // sliders
  const mkSlider = (c, ic) => {
    const s = tile(c, 1, 1, 2, { r: 56, bg: GREY });
    const fill = mk(s.el, { left: 0, top: 0, width: s.w, height: s.h, background: T.accent });
    mk(s.el, { left: 50, top: s.h - 90 }, svg(ic, 70, T.ink)); const icoW = mk(fill, { left: 50, top: s.h - 90 }, svg(ic, 70, '#fff'));
    return { ...s, fill, icoW };
  };
  const bright = mkSlider(2, 'sun'), vol = mkSlider(3, 'speaker');
  // focus
  const focus = tile(0, 2, 2, 1);
  const fIc = mk(focus.el, { left: 34, top: 41, width: 88, height: 88, borderRadius: 44, background: GREY });
  mk(fIc, { left: 20, top: 20 }, svg('moon', 48, T.ink)); const fOn = mk(fIc, { left: 20, top: 20 }, svg('moon', 48, '#fff'));
  text(focus.el, 'Focus', { size: 34, css: { left: '146px', top: '38px' } });
  const fOff = text(focus.el, 'Off', { size: 27, weight: 500, color: MUTED, css: { left: '146px', top: '88px' } });
  const fOnT = text(focus.el, 'Do Not Disturb', { size: 27, weight: 500, color: T.accent, css: { left: '146px', top: '88px' } });
  // small tiles
  [['bolt', 2, 3], ['calc', 3, 3], ['lens', 0, 3], ['timer', 1, 3]].forEach(([ic, c, r]) => { const s = tile(c, r, 1, 1, { r: 48 }); mk(s.el, { left: 57, top: 57 }, svg(ic, 56, T.ink)); });
  // finger
  const finger = mk(WG, { left: -36, top: -36, width: 72, height: 72, borderRadius: 36, background: 'rgba(29,29,31,.16)', border: '3px solid rgba(255,255,255,.9)' });
  const yAt = (s, f) => s.y + s.h * (1 - f);
  const FX = [{ t: 0, v: 1760 }, { t: 5.0, v: conn.x + 36 + 70, spring: 'default' }, { t: 6.15, v: bright.x + 85 }, { t: 7.6, v: vol.x + 85 }, { t: 8.45, v: focus.x + 181 }, { t: 9.15, v: 1790 }];
  const FY = [{ t: 0, v: 1040 }, { t: 5.0, v: conn.y + 36 + 70 }, { t: 6.15, v: yAt(bright, 0.3) }, { t: 6.5, v: yAt(bright, 0.88) }, { t: 7.6, v: yAt(vol, 0.62) }, { t: 7.82, v: yAt(vol, 0.3) }, { t: 8.45, v: focus.y + 85 }, { t: 9.15, v: 1100 }];
  return t => {
    cap(t);
    tiles.forEach(({ el, i }) => pop(enterT(t, t0 + 0.04 * i), el, 70));
    btn.forEach(({ b, off, on, tOn }, k) => {
      const u = k === 1 ? 1 : spring(t - tOn, 'snappy');
      put(b, { bg: mixc(GREY, T.accent, u), s: 1 - 0.09 * pulse(t, tOn - 0.04, 0.2) }); put(off, { op: 1 - u }); put(on, { op: u });
    });
    put(mFill, { w: 294 * (0.18 + 0.045 * (t - t0)) });
    const bf = track(t, [{ t: 0, v: 0.3 }, { t: 6.5, v: 0.88 }], 'default'), vf = track(t, [{ t: 0, v: 0.62 }, { t: 7.82, v: 0.3 }], 'default');
    put(bright.fill, { y: bright.h * (1 - bf) }); put(bright.icoW, { y: -bright.h * (1 - bf) });
    put(vol.fill, { y: vol.h * (1 - vf) }); put(vol.icoW, { y: -vol.h * (1 - vf) });
    const fu = spring(t - 8.6, 'snappy');
    put(fIc, { bg: mixc(GREY, T.accent, fu), s: 1 - 0.09 * pulse(t, 8.56, 0.2) }); put(fOn, { op: fu });
    put(fOff, { op: swapAlpha(t, -1, 8.6), y: (1 - swapAlpha(t, -1, 8.6)) * -10 });
    put(fOnT, { op: swapAlpha(t, 8.72, 99), y: (1 - spring(t - 8.72, 'snappy')) * 14 });
    const press = Math.max(pulse(t, 5.45, 0.18), hold(t, 6.3, 6.95), hold(t, 7.7, 8.2), pulse(t, 8.55, 0.16));
    put(finger, { x: track(t, FX), y: track(t, FY), s: 1 - 0.22 * press, op: spring(t - 4.95, 'default') * (1 - spring(t - 9.1, 'default')) });
  };
}

// ======================= SCENE 3: wallet =======================
function buildWallet(panel, t0) {
  const WG = widgetGroup(panel);
  const cap = caption(panel, ['Depth,', 'in layers.'], 'Cards that stack, fan out and morph.', t0 + 0.05);
  const CW = 640, CH = 400, CXc = 1330;
  const FACE = [['#1D1D1F', '#fff', 'Motion Black'], [T.accent, '#fff', 'Motion Blue'], ['#FFFFFF', T.ink, 'Motion White'], ['#D2D2D7', T.ink, 'Motion Silver']];
  const cards = FACE.map(([bg, fg, name], j) => {
    const el = card(WG, { x: CXc - CW / 2, y: 0, w: CW, h: CH, r: 46, bg, clip: true });
    text(el, name, { size: 30, color: fg, css: { left: '40px', top: '34px' } });
    mk(el, { left: CW - 40 - 78, top: 34, width: 78, height: 56, borderRadius: 14, background: fg, opacity: 0.22 });
    text(el, '•••• 4242', { size: 30, weight: 500, color: fg, css: { left: '40px', top: CH - 70 + 'px', opacity: 0.8 } });
    return { el, j, fg };
  });
  const sel = cards[1];
  const detail = mk(sel.el, { left: 0, top: 0, width: 760, height: 560 });
  text(detail, 'Balance', { size: 28, weight: 500, color: 'rgba(255,255,255,.78)', css: { left: '40px', top: '150px' } });
  const bal = text(detail, '$0.00', { size: 104, weight: 740, face: T.displayFont, color: '#fff', track: -0.035, css: { left: '36px', top: '190px' } });
  const payBtn = mk(detail, { left: 40, top: 420, width: 320, height: 92, borderRadius: 46, background: '#fff' });
  const payT = text(payBtn, 'Pay $48.20', { size: 32, color: T.accent, css: { left: '0px', top: '28px', width: '320px', textAlign: 'center' } });
  const paidT = text(payBtn, 'Paid', { size: 32, color: T.accent, css: { left: '0px', top: '28px', width: '320px', textAlign: 'center' } });
  const chk = mk(payBtn, { left: 196, top: 26 }, `<svg width="40" height="40" viewBox="0 0 24 24"><path id="chk" d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="${T.accent}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`);
  const chkPath = chk.querySelector('#chk');
  const ghost = mk(detail, { left: 384, top: 420, width: 240, height: 92, borderRadius: 46, background: 'rgba(255,255,255,.2)' });
  text(ghost, 'Details', { size: 32, color: '#fff', css: { left: '0px', top: '28px', width: '240px', textAlign: 'center' } });
  return t => {
    cap(t);
    cards.forEach(({ el, j }) => {
      const e = enterT(t, t0 + 0.0 + 0.07 * j), collapsed = 250 + j * 58, fan = 180 + j * 152;
      const isSel = j === 1;
      const y = track(t, [{ t: 0, v: collapsed }, { t: 11.15 + 0.05 * j, v: fan }, { t: 12.5 + (isSel ? 0 : 0.04 * j), v: isSel ? 270 : 1180, spring: 'default' }], 'default');
      const w = isSel ? track(t, [{ t: 0, v: CW }, { t: 12.5, v: 760 }]) : CW, h = isSel ? track(t, [{ t: 0, v: CH }, { t: 12.5, v: 560 }]) : CH;
      const r = isSel ? track(t, [{ t: 0, v: 46 }, { t: 12.5, v: 56 }]) : 46;
      put(el, { x: -(w - CW) / 2, y: y + (1 - e) * 700, w, h, r, op: Math.min(1, e * 4) });
    });
    put(detail, { op: swapAlpha(t, 12.66, 99, 0.18) });
    const bv = track(t, [{ t: 0, v: 0 }, { t: 12.7, v: 2480.5 }, { t: 14.5, v: 2432.3 }], 'heavy');
    bal.textContent = '$' + fmtMoney(bv);
    const pu = 1 - 0.06 * pulse(t, 14.38, 0.2), paid = spring(t - 14.5, 'snappy');
    put(payBtn, { s: pu }); put(payT, { op: 1 - paid, y: -paid * 14 }); put(paidT, { op: paid, y: (1 - paid) * 14, x: -26 * paid });
    chkPath.style.strokeDashoffset = 1 - clamp((t - 14.55) / 0.3);
  };
}

// ======================= SCENE 4: type =======================
function buildType(panel, t0) {
  const WG = widgetGroup(panel);
  const WORDS = [{ s: 'Weight.', a: 16.0, b: 17.95 }, { s: 'Space.', a: 17.95, b: 19.85 }, { s: 'Rhythm.', a: 19.85, b: 21.8 }];
  const SZ = 250;
  const mkWord = (s) => { const box = mk(panel, { left: 140, top: 360, width: 1100, height: SZ * 1.2, overflow: 'hidden' }); return box; };
  const w0 = mkWord(), w1 = mkWord(), w2 = mkWord();
  const t0e = text(w0, 'Weight.', { size: SZ, weight: 100, face: T.displayFont, track: -0.04, lh: 1.18 });
  const t1e = text(w1, 'Space.', { size: SZ, weight: 800, face: T.displayFont, track: -0.04, lh: 1.18 });
  const letters = [...'Rhythm.'].map(ch => { const l = document.createElement('span'); l.textContent = ch; l.style.cssText = 'position:static;display:inline-block'; return l; });
  const t2e = text(w2, '', { size: SZ, weight: 300, face: T.displayFont, track: -0.04, lh: 1.18, css: { display: 'block' } });
  letters.forEach(l => t2e.appendChild(l));
  const riseY = (t, a, b) => (1 - spring(t - a, 'heavy')) + (-spring(t - b, 'heavy'));
  // readout card
  const RC = card(WG, { x: 1290, y: 330, w: 500, h: 470, r: 52 });
  text(RC, 'Variable type', { size: 34, css: { left: '44px', top: '38px' } });
  text(RC, 'Live values, straight from seek(t)', { size: 24, weight: 500, color: MUTED, css: { left: '44px', top: '84px' } });
  const hi = mk(RC, { left: 24, top: 150, width: 452, height: 84, borderRadius: 26, background: T.accent });
  const rows = [['wght', 160], ['tracking', 250], ['stagger', 340]].map(([k, y]) => {
    const a = text(RC, k, { size: 32, css: { left: '52px', top: y + 24 + 'px' } }), b = text(RC, '', { size: 32, css: { right: '52px', top: y + 24 + 'px' } }); return { a, b };
  });
  const wTrack = [{ t: 0, v: 100 }, { t: 16.4, v: 900 }, { t: 17.35, v: 420 }];
  const sTrack = [{ t: 0, v: -0.06 }, { t: 18.35, v: 0.07 }, { t: 19.15, v: -0.03 }];
  return t => {
    const wg = track(t, wTrack, 'heavy'), sp = track(t, sTrack, 'heavy');
    put(t0e, { y: riseY(t, WORDS[0].a, WORDS[0].b) * SZ * 1.18 }); t0e.style.fontWeight = wg;
    put(t1e, { y: riseY(t, WORDS[1].a, WORDS[1].b) * SZ * 1.18 }); t1e.style.letterSpacing = sp * SZ + 'px';
    put(t2e, { y: riseY(t, WORDS[2].a, WORDS[2].b) * SZ * 1.18 });
    letters.forEach((l, i) => {
      const a = WORDS[2].a + 0.07 * i;
      l.style.fontWeight = track(t, [{ t: 0, v: 200 }, { t: a + 0.05, v: 900 }, { t: a + 0.7, v: 300 }], 'heavy');
      l.style.transform = `translateY(${(1 - spring(t - a, 'heavy')) * SZ * 0.5}px)`;
    });
    const act = t < WORDS[1].a ? 0 : t < WORDS[2].a ? 1 : 2;
    const ind = indicator(t, [{ t: 0, x: 150, w: 84 }, { t: WORDS[1].a, x: 240, w: 84 }, { t: WORDS[2].a, x: 330, w: 84 }]);
    put(hi, { y: ind.x - 150, h: ind.w, op: spring(t - t0, 'default') });
    rows[0].b.textContent = Math.round(wg); rows[1].b.textContent = (sp >= 0 ? '+' : '−') + Math.abs(sp).toFixed(2) + ' em'; rows[2].b.textContent = '0.07 s';
    rows.forEach((r, i) => { const on = clamp(1 - Math.abs(act - i)); const c = mixc(T.ink, '#FFFFFF', on); r.a.style.color = c; r.b.style.color = c; });
    put(RC, { y: (1 - spring(t - t0 - 0.05, 'default')) * 90, s: 0.9 + 0.1 * spring(t - t0 - 0.05, 'default'), op: Math.min(1, spring(t - t0 - 0.05, 'default') * 3) });
  };
}

// ======================= SCENE 5: data =======================
function buildData(panel, t0) {
  const WG = widgetGroup(panel);
  const cap = caption(panel, ['Data', 'that breathes.'], 'Rings, counters and charts.', t0 + 0.05);
  const C = card(WG, { x: 1000, y: 215, w: 780, h: 700, r: 60 });
  const cx = 390, cy = 240, R = [150, 114, 78], SW = 28, FR = [0.87, 0.64, 0.92];
  const ringSvg = mk(C, { left: cx - 170, top: cy - 170, width: 340, height: 340 },
    `<svg width="340" height="340" viewBox="0 0 340 340" style="left:0;top:0;position:absolute;transform:rotate(-90deg)">` +
    R.map((r, i) => `<circle cx="170" cy="170" r="${r}" fill="none" stroke="${GREY}" stroke-width="${SW}"/><circle id="rg${i}" cx="170" cy="170" r="${r}" fill="none" stroke="${T.accent}" stroke-opacity="${[1, 0.62, 0.34][i]}" stroke-width="${SW}" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join('') + `</svg>`);
  const rg = [0, 1, 2].map(i => ringSvg.querySelector('#rg' + i));
  const num = text(C, '0%', { size: 76, weight: 740, face: T.displayFont, track: -0.03, css: { left: cx - 100 + 'px', top: cy - 44 + 'px', width: '200px', textAlign: 'center' } });
  const bars = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
    const hmax = [56, 80, 48, 104, 84, 40, 64][i];
    const b = mk(C, { left: 90 + i * 90, top: 600 - hmax, width: 54, height: hmax, borderRadius: 16, background: '#D2D2D7', transformOrigin: '50% 100%' });
    text(C, d, { size: 24, weight: 600, color: MUTED, css: { left: 90 + i * 90 + 'px', top: 622 + 'px', width: '54px', textAlign: 'center' } });
    return { b, hmax, i };
  });
  const stats = [['Move', '87%'], ['Exercise', '64%'], ['Stand', '92%']].map(([k, v], i) => {
    const g = mk(C, { left: 54 + i * 232, top: 430 }); text(g, k, { size: 24, weight: 500, color: MUTED }); text(g, v, { size: 40, weight: 720, face: T.displayFont, css: { top: '34px' } }); return g;
  });
  return t => {
    cap(t);
    const e = enterT(t, t0 + 0.05); pop(e, C, 80);
    rg.forEach((c, i) => { const p = FR[i] * track(t, [{ t: 0, v: 0 }, { t: t0 + 0.55 + 0.12 * i, v: 1 }], 'heavy'); c.style.strokeDashoffset = 1 - p; });
    num.textContent = Math.round(FR[0] * 100 * track(t, [{ t: 0, v: 0 }, { t: t0 + 0.55, v: 1 }], 'heavy')) + '%';
    bars.forEach(({ b, hmax, i }) => {
      const e2 = enterT(t, t0 + 1.0 + 0.07 * i, 'default'), hl = i === 4 ? spring(t - (t0 + 2.2), 'snappy') : 0;
      put(b, { sy: Math.max(0.001, e2), bg: mixc('#D2D2D7', T.accent, hl) });
    });
    stats.forEach((g, i) => { const e3 = enterT(t, t0 + 0.8 + 0.1 * i, 'heavy'); put(g, { y: (1 - e3) * 30, op: Math.min(1, e3 * 3) }); });
  };
}

// ---------- scenes ----------
const intro = buildIntro(panels[0], { cycle: true, enter: () => 1 });
const FIN0 = 25.9;
const finale = buildIntro(panels[5], { cycle: false, enter: (k, t) => spring(t - (FIN0 + 0.09 * k), k < 3 ? 'heavy' : 'default') });
const scenes = [intro, buildControls(panels[1], 3.88), buildWallet(panels[2], 9.88), buildType(panels[3], 15.88), buildData(panels[4], 21.88), finale];

// ---------- the Dynamic Island: persists above every scene ----------
const ISL = [   // t, w, h, r, content
  { t: 0, w: 260, h: 76, r: 38, k: 'idle' }, { t: 1.0, w: 760, h: 200, r: 60, k: 'player' }, { t: 3.0, w: 330, h: 76, r: 38, k: 'timer' },
  { t: 5.5, w: 420, h: 76, r: 38, k: 'wifi' }, { t: 7.2, w: 260, h: 76, r: 38, k: 'idle' }, { t: 13.55, w: 470, h: 76, r: 38, k: 'paid' },
  { t: 15.4, w: 260, h: 76, r: 38, k: 'idle' }, { t: 22.55, w: 420, h: 76, r: 38, k: 'move' }, { t: 24.6, w: 260, h: 76, r: 38, k: 'idle' },
  { t: 28.0, w: 760, h: 92, r: 46, k: 'finale' }, { t: 29.3, w: 260, h: 76, r: 38, k: 'idle' }];
const island = mk(stage, { left: 0, top: 40, width: 260, height: 76, borderRadius: 38, background: '#000', overflow: 'hidden', zIndex: 10, boxShadow: '0 12px 28px rgba(0,0,0,.16)' });
const CWI = 760, grp = {};
['idle', 'player', 'timer', 'wifi', 'paid', 'move', 'finale'].forEach(k => { grp[k] = mk(island, { left: '50%', top: 0, width: CWI, height: 230, marginLeft: -CWI / 2 + 'px' }); });
const ring = (g, x, y, id, c) => mk(g, { left: x, top: y, width: 44, height: 44 }, `<svg width="44" height="44" viewBox="0 0 44 44" style="position:absolute;left:0;top:0;transform:rotate(-90deg)"><circle cx="22" cy="22" r="16" fill="none" stroke="#3A3A3C" stroke-width="6"/><circle id="${id}" cx="22" cy="22" r="16" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`);
// idle: album thumb + waveform
mk(grp.idle, { left: 262, top: 16, width: 44, height: 44, borderRadius: 13, background: T.accent }, `<div style="left:7px;top:7px">${svg('bars', 30, '#fff')}</div>`);
const idleBars = [0, 1, 2, 3, 4].map(i => mk(grp.idle, { left: 438 + i * 12, top: 0, width: 7, height: 10, borderRadius: 4, background: '#fff' }));
// player
mk(grp.player, { left: 38, top: 26, width: 96, height: 96, borderRadius: 24, background: T.accent }, `<div style="left:16px;top:16px">${svg('bars', 64, '#fff')}</div>`);
text(grp.player, 'Springs, not curves', { size: 36, color: '#fff', css: { left: '160px', top: '34px' } });
text(grp.player, 'Motion Portfolio', { size: 27, weight: 500, color: '#8E8E93', css: { left: '160px', top: '80px' } });
const plBars = [0, 1, 2, 3, 4].map(i => mk(grp.player, { left: 640 + i * 16, top: 0, width: 8, height: 10, borderRadius: 4, background: T.accent }));
mk(grp.player, { left: 38, top: 146, width: 684, height: 8, borderRadius: 4, background: '#3A3A3C' });
const plFill = mk(grp.player, { left: 38, top: 146, width: 100, height: 8, borderRadius: 4, background: '#fff' });
const plA = text(grp.player, '0:42', { size: 22, weight: 500, color: '#8E8E93', css: { left: '38px', top: '162px' } });
text(grp.player, '−1:18', { size: 22, weight: 500, color: '#8E8E93', css: { right: '38px', top: '162px' } });
// timer
const tmRing = ring(grp.timer, 255, 16, 'tmr', T.accent), tmPath = tmRing.querySelector('#tmr');
const tmText = text(grp.timer, '0:30', { size: 34, color: '#fff', css: { left: '318px', top: '17px' } });
// wifi
mk(grp.wifi, { left: 192, top: 16 }, svg('wifi', 44, T.accent));
text(grp.wifi, 'Wi-Fi', { size: 31, color: '#fff', css: { left: '252px', top: '19px' } });
text(grp.wifi, 'Connected', { size: 27, weight: 500, color: '#8E8E93', css: { left: '344px', top: '22px' } });
// paid
mk(grp.paid, { left: 168, top: 16, width: 44, height: 44, borderRadius: 22, background: T.accent },
  `<svg width="44" height="44" viewBox="0 0 24 24" style="position:absolute;left:0;top:0"><path id="pchk" d="M6.6 12.4l3.6 3.6 7-7.4" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`);
const pchk = grp.paid.querySelector('#pchk');
text(grp.paid, 'Paid', { size: 31, color: '#fff', css: { left: '230px', top: '19px' } });
text(grp.paid, '$48.20', { size: 27, weight: 500, color: '#8E8E93', css: { left: '310px', top: '22px' } });
// move
const mvRing = ring(grp.move, 192, 16, 'mvr', T.accent), mvPath = mvRing.querySelector('#mvr');
text(grp.move, 'Move', { size: 31, color: '#fff', css: { left: '252px', top: '19px' } });
const mvPct = text(grp.move, '0%', { size: 31, color: T.accent, css: { left: '344px', top: '19px' } });
// finale
text(grp.finale, '0 keyframes. Every frame, f(t).', { size: 38, color: '#fff', css: { left: '0px', top: '24px', width: '760px', textAlign: 'center' } });

function updateIsland(t) {
  const w = track(t, ISL.map(s => ({ t: s.t, v: s.w, spring: 'snappy' }))), h = track(t, ISL.map(s => ({ t: s.t, v: s.h, spring: 'default' }))),
    r = track(t, ISL.map(s => ({ t: s.t, v: s.r, spring: 'default' })));
  island.style.width = w + 'px'; island.style.height = h + 'px'; island.style.borderRadius = r + 'px';
  island.style.transform = `translate(${(W - w) / 2}px, 0px)`;
  const alpha = {};
  ISL.forEach((s, i) => { const a = swapAlpha(t, i === 0 ? -1 : s.t + 0.12, ISL[i + 1] ? ISL[i + 1].t - 0.1 : 99); alpha[s.k] = (alpha[s.k] || 0) + a; });
  for (const k in grp) { const a = clamp(alpha[k] || 0); grp[k].style.opacity = a; grp[k].style.visibility = a < 0.003 ? 'hidden' : 'visible'; }
  const lt = loopT(t, DUR), vis = k => ISL.some(s => s.k === k);
  // waveforms are periodic in the loop length (integer cycles per 30 s) so frame 30 == frame 0
  const wave = (i, cyc) => 0.5 + 0.5 * Math.sin(2 * Math.PI * (lt / DUR * cyc[i] + i * 0.37));
  const C1 = [47, 61, 53, 71, 59], C2 = [41, 67, 49, 73, 57];
  idleBars.forEach((b, i) => { const hh = 8 + 34 * wave(i, C1); put(b, { y: 38 - hh / 2, sy: hh / 10 }); });
  plBars.forEach((b, i) => { const hh = 10 + 46 * wave(i, C2); put(b, { y: 60 - hh / 2, sy: hh / 10 }); });
  put(plFill, { sx: Math.max(0.001, (0.3 + 0.07 * (t - 1.0)) * 684 / 100), x: 0 }); plFill.style.transformOrigin = '0 50%';
  const mm = 42 + Math.floor(Math.max(0, t - 1)); plA.textContent = '0:' + String(Math.min(59, mm)).padStart(2, '0');
  const tl = Math.max(0, t - 3.0); tmText.textContent = '0:' + String(30 - Math.floor(tl)).padStart(2, '0'); tmPath.style.strokeDashoffset = 1 - (1 - tl / 30);
  pchk.style.strokeDashoffset = 1 - clamp((t - 13.75) / 0.3);
  const mp = track(t, [{ t: 0, v: 0 }, { t: 22.7, v: 0.87 }], 'heavy'); mvPath.style.strokeDashoffset = 1 - mp; mvPct.textContent = Math.round(mp * 100) + '%';
}

window.seek = function (t) {
  const cam = track(t, CAM);
  put(world, { x: -cam });
  panels.forEach((p, i) => { const vis = Math.abs(cam - i * W) < W * 1.02; p.style.display = vis ? 'block' : 'none'; if (vis) scenes[i](t); });
  updateIsland(t);
};
