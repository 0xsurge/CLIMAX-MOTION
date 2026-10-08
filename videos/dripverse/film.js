// DRIP VERSE, "Drip Time": 30 s, 16:9, 120 BPM (beat = 0.5 s). Every frame is a pure function of t.
// Water is the only effect: a drop, rings, and a rippling circular reveal. Shoes are cutouts floating at different depths.
const { spring, track, swapAlpha, clamp, lerp } = Motion;
const W = 1920, H = 1080, BEAT = 0.5;
const INK = '#121214', BONE = '#F3EFE8', BRASS = '#B08A4E';
const STAGE = document.getElementById('stage');
const SOFT = { k: 14, c: 8.5 };                        // slow overdamped spring: how a ring widens and fades
const sp = (t, t0, p = 'default') => spring(t - t0, p);

const css = document.createElement('style');
css.textContent = `
@font-face{font-family:'Bodoni';src:url(assets/fonts/bodoni-normal.woff2) format('woff2');font-weight:400 600;font-style:normal}
@font-face{font-family:'Bodoni';src:url(assets/fonts/bodoni-italic.woff2) format('woff2');font-weight:400 600;font-style:italic}
@font-face{font-family:'Geist';src:url(assets/fonts/geist.woff2) format('woff2');font-weight:100 900}
#stage *{position:absolute;box-sizing:border-box;margin:0;padding:0}
#stage .t{position:static;display:inline-block}
#stage i{position:static}`;
document.head.appendChild(css);

const SHOES = { 'adidas-niteball': [579, 365], 'axel-arigato': [688, 394], 'nb-550': [390, 304], 'nb-480': [577, 470], 'nike-af1': [707, 607], 'nike-zoom': [405, 307] };
const CARDS = { 'jordan-4': [640, 635], 'asics-kayano': [736, 1308], 'balenciaga-runner': [474, 592] };
const IMGEL = {};
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = src; IMGEL[src] = i; });
window.__preload = [document.fonts.load("400 100px 'Bodoni'"), document.fonts.load("italic 400 100px 'Bodoni'"), document.fonts.load("500 30px 'Geist'"), document.fonts.load("600 30px 'Geist'"),
  ...Object.keys(SHOES).map(n => loadImg(`assets/cut/${n}_c.png`)), ...Object.keys(CARDS).map(n => loadImg(`assets/photos/${n}.jpg`))];

// ---------- helpers (DOM is built once; seek only changes style values) ----------
const PXK = new Set(['left', 'top', 'width', 'height', 'borderRadius']);
function mk(parent, o = {}, html) {
  const e = document.createElement('div'); e.style.left = '0px'; e.style.top = '0px';
  for (const k in o) e.style[k] = (PXK.has(k) && typeof o[k] === 'number') ? o[k] + 'px' : o[k];
  if (html != null) e.innerHTML = html;
  parent.appendChild(e); return e;
}
const put = (e, o) => {
  const st = e.style;
  if (o.op !== undefined) { st.opacity = o.op; st.visibility = o.op <= 0.003 ? 'hidden' : 'visible'; }
  st.transform = `translate(${o.x || 0}px,${o.y || 0}px) rotate(${o.rot || 0}deg) scale(${o.sx ?? o.s ?? 1},${o.sy ?? o.s ?? 1})`;
};
const show = (e, on) => { e.style.display = on ? 'block' : 'none'; return on; };
const layer = bg => mk(STAGE, { width: W, height: H, overflow: 'hidden', background: bg, display: 'none' });
const GEIST = "'Geist', system-ui, sans-serif", BODONI = "'Bodoni', 'Times New Roman', serif";

// text that rises out of a mask (never a fade)
function Rise(parent, o) {
  const box = mk(parent, { left: o.x, top: o.y, width: o.w, height: o.h, overflow: 'hidden' });
  const inner = mk(box, { width: o.w, height: o.h, font: o.font, color: o.color, letterSpacing: o.ls || '0', whiteSpace: 'nowrap', textAlign: o.al || 'left' }, o.html);
  const fn = (t, t0, p = o.sp || 'heavy') => { inner.style.transform = `translateY(${(1 - sp(t, t0, p)) * o.h * 1.15}px)`; };
  fn.box = box; return fn;
}
// elliptical (floor) or circular ring that widens and thins out
function Ring(parent, col = INK) { return mk(parent, { borderRadius: 9999, border: `2px solid ${col}`, display: 'none' }); }
function ringAt(el, t, ts, cx, cy, rx0, rx1, ratio, a0) {
  const p = sp(t, ts, SOFT), on = t >= ts && p < 0.985;
  if (!show(el, on)) return;
  const rx = rx0 + (rx1 - rx0) * p, ry = rx * ratio;
  Object.assign(el.style, { left: cx - rx + 'px', top: cy - ry + 'px', width: rx * 2 + 'px', height: ry * 2 + 'px', opacity: a0 * Math.pow(1 - p, 1.15), borderWidth: Math.max(0.8, 2.4 * (1 - p)) + 'px' });
}
// shoe cutout with soft shadow and a water reflection
function Shoe(parent, name, w, o = {}) {
  const [iw, ih] = SHOES[name], hh = w * ih / iw, src = `assets/cut/${name}_c.png`;
  const root = mk(parent, { left: -w / 2, top: -hh / 2, width: w, height: hh, filter: o.blur ? `blur(${o.blur}px)` : 'none' });
  root.innerHTML = `<img src="${src}" style="left:0;top:0;width:${w}px;height:${hh}px;filter:drop-shadow(0 26px 30px rgba(40,32,20,.22))">` +
    `<img src="${src}" style="left:0;top:${hh + 14}px;width:${w}px;height:${hh}px;transform:scaleY(-1);opacity:${o.refl ?? 0.15};filter:blur(2.5px);-webkit-mask-image:linear-gradient(to top,rgba(0,0,0,.9),rgba(0,0,0,0) 62%);mask-image:linear-gradient(to top,rgba(0,0,0,.9),rgba(0,0,0,0) 62%)">`;
  root.dataset.h = hh; return root;
}
const bob = (t, ph, amp = 8, per = 2.4) => amp * Math.sin(2 * Math.PI * t / per + ph);
// a falling drop (teardrop), gravity from the top of the frame to the contact point
const dropSvg = (s = 1) => `<svg width="${60 * s}" height="${90 * s}" viewBox="0 0 60 90" style="left:0;top:0;overflow:visible"><defs><radialGradient id="dg" cx=".35" cy=".62" r=".7"><stop offset="0" stop-color="#6b6a68"/><stop offset=".55" stop-color="#1a1a1c"/><stop offset="1" stop-color="#0b0b0c"/></radialGradient></defs><path d="M30 2 C 24 26 6 44 6 62 a24 24 0 0 0 48 0 C 54 44 36 26 30 2z" fill="url(#dg)"/><ellipse cx="21" cy="60" rx="5" ry="9" fill="#fff" opacity=".55" transform="rotate(14 21 60)"/></svg>`;
function Drop(parent, s) { const e = mk(parent, { display: 'none' }, dropSvg(s)); e.dataset.h = 90 * s; e.dataset.w = 60 * s; return e; }
function dropFall(e, t, tc, x, yc, dur = 0.34) {          // contact at tc: bottom of the drop touches y = yc
  const tau = tc - t, h = +e.dataset.h, w = +e.dataset.w, g = 2 * (yc + 120) / (dur * dur);
  if (!show(e, tau > 0 && tau <= dur)) return;
  const bottom = yc - 0.5 * g * tau * tau;
  put(e, { x: x - w / 2, y: bottom - h, sy: 1 + Math.min(0.25, g * tau / 9000) });   // stretches a little as it speeds up
}
// circular ripple reveal of a scene layer from (cx, cy), with a refracting edge and two rings
const FILTER = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
FILTER.setAttribute('width', 0); FILTER.setAttribute('height', 0); FILTER.style.position = 'absolute';
FILTER.innerHTML = `<filter id="wl" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".006 .009" numOctaves="2" seed="4"/><feDisplacementMap id="wlmap" in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`;
STAGE.appendChild(FILTER);
const WLMAP = FILTER.querySelector('#wlmap');
function reveal(lay, rings, t, t0, cx, cy) {
  const u = sp(t, t0, 'default'), R = u * 2400, on = t >= t0;
  show(lay, on);
  if (!on) { rings.forEach(r => show(r, false)); return; }
  lay.style.clipPath = R >= 2390 ? 'none' : `circle(${R}px at ${cx}px ${cy}px)`;
  const sc = 38 * Math.exp(-(t - t0) * 4.5);
  if (sc > 0.8) { lay.style.filter = 'url(#wl)'; WLMAP.setAttribute('scale', sc.toFixed(2)); } else lay.style.filter = 'none';
  [[0, 0.5], [0.1, 0.3]].forEach(([lag, a], i) => {
    const r = sp(t, t0 + lag, 'default') * 2400, el = rings[i];
    if (!show(el, r > 4 && r < 2200)) return;
    Object.assign(el.style, { left: cx - r + 'px', top: cy - r + 'px', width: r * 2 + 'px', height: r * 2 + 'px', opacity: a * (1 - r / 2200), borderWidth: '2.5px' });
  });
}

// ---------- layers (DOM order = stacking order) ----------
const FLOOR_BG = f => `linear-gradient(#F6F3EC 0%,#EFEBE3 ${f}%,#E1DCD2 ${f}%,#E9E5DD 100%)`;
const L0 = layer(FLOOR_BG(62));
const L1 = layer('linear-gradient(100deg,#F5F2EB 0%,#E4DFD6 100%)');
const BSC = [   // build scenes: shoe, width, centre, ghost word, drop x (reveal origin)
  { name: 'adidas-niteball', w: 900, c: [960, 450], word: 'Drip', x: 1500, bg: 'linear-gradient(100deg,#F5F2EB,#E4DFD6)', t: 8.0 },
  { name: 'nb-550', w: 860, c: [900, 470], word: 'Verse', x: 420, bg: 'linear-gradient(100deg,#EFEAE1,#DFD9CE)', t: 9.0 },
  { name: 'nike-zoom', w: 780, c: [1020, 490], word: 'Time', x: 1380, bg: 'linear-gradient(100deg,#F2EEE7,#E3DED4)', t: 10.0 },
  { name: 'nb-480', w: 780, c: [940, 480], word: 'Wear', x: 560, bg: 'linear-gradient(100deg,#EDE8DF,#DDD7CB)', t: 11.0 }];
const LB = BSC.map(b => layer(b.bg));
const LM = layer('linear-gradient(#F5F2EB,#E6E1D8)');
const LO = layer('linear-gradient(100deg,#F5F2EB 0%,#E4DFD6 100%)');
const LE = layer(FLOOR_BG(74));
const LT = mk(STAGE, { width: W, height: H, overflow: 'hidden', pointerEvents: 'none' });   // top: drops, reveal rings, cursor
const revRings = Array.from({ length: 8 }, () => [Ring(LT), Ring(LT)]);

// =====================================================================================================================
// S0 hook (0-4.5): "Drip" rises, a dark drop forms under the p, falls on beat 6 (3.0 s), rings spread, "Time" arrives
// =====================================================================================================================
function buildHook() {
  const word = mk(L0, { left: 130, top: 110, width: 900, height: 560, overflow: 'hidden' });
  const row = mk(word, { left: 0, top: 0, width: 900, height: 560, font: `400 430px/1 ${BODONI}`, color: INK, letterSpacing: '-12px', whiteSpace: 'nowrap' });
  const letters = 'Drip'.split('').map(ch => { const s = document.createElement('span'); s.className = 't'; s.textContent = ch; row.appendChild(s); return s; });
  const pr = letters[3].getBoundingClientRect();
  const px = pr.left + pr.width * 0.25, top = pr.top + pr.height * 0.9, FLOOR = 840;
  const time = Rise(L0, { x: 1010, y: 300, w: 900, h: 400, html: 'Time', font: `italic 400 300px/1 ${BODONI}`, color: BRASS, ls: '-6px' });
  const label = Rise(L0, { x: 1016, y: 610, w: 500, h: 40, html: 'DRIP VERSE', font: `500 24px/40px ${GEIST}`, color: 'rgba(18,18,20,.6)', ls: '.34em', sp: 'snappy' });
  const neck = mk(L0, { left: px - 8, top: top, width: 16, height: 10, background: 'linear-gradient(90deg,#2b2b2e,#78787a 45%,#151517)', borderRadius: '0 0 8px 8px' });
  const drop = Drop(L0, 0.8); const rings = Array.from({ length: 7 }, () => Ring(L0)); const glow = mk(L0, { borderRadius: 9999, background: 'radial-gradient(closest-side,rgba(18,18,20,.35),rgba(18,18,20,0))', display: 'none' });
  const splash = [0, 1].map(() => Drop(L0, 0.3));
  const T_DET = 2.55, T_HIT = 3.0, y0 = top + 190 - 30, g = 2 * (FLOOR - 72 - y0) / ((T_HIT - T_DET) ** 2);
  window.HOOK_PX = px; window.HOOK_FLOOR = FLOOR;
  return t => {
    letters.forEach((s, i) => { s.style.transform = `translateY(${(1 - sp(t, 0.35 + 0.09 * i, 'heavy')) * 560}px)`; });
    time(t, 3.1); label(t, 3.5);
    const N = 190 * sp(t, 1.6, 'heavy') * (1 - sp(t, T_DET, 'snappy'));
    show(neck, N > 1.5); Object.assign(neck.style, { height: N + 'px' });
    const dy = t < T_DET ? top + 190 * sp(t, 1.6, 'heavy') - 30 : y0 + 0.5 * g * (t - T_DET) ** 2;
    if (show(drop, t >= 1.7 && t < T_HIT)) put(drop, { x: px - 24 * 0.8 * 1.0 - 0, y: dy, sy: 1 + (t >= T_DET ? Math.min(0.2, g * (t - T_DET) / 9000) : 0) });
    glow.style.display = 'none';
    rings.forEach((r, k) => ringAt(r, t, T_HIT + 0.13 * k, px, FLOOR, 26, 780, 0.2, 0.62));
    splash.forEach((s, k) => {                                         // two tiny droplets thrown up by the impact
      const dt = t - T_HIT, vx = k ? 150 : -170, vy = k ? -560 : -480, G = 3200, y = FLOOR - 40 + vy * dt + 0.5 * G * dt * dt;
      if (!show(s, dt > 0 && y < FLOOR - 28)) return; put(s, { x: px + vx * dt - 9, y: y - 30, s: 1 });
    });
  };
}

// =====================================================================================================================
// S1 hero (3.55-8.8): the ring from the drop turns the world to stone; "New arrivals" with the shoe floating between
// =====================================================================================================================
function buildHero() {
  const nu = Rise(L1, { x: 110, y: 40, w: 760, h: 440, html: 'New', font: `400 420px/1 ${BODONI}`, color: INK, ls: '-12px' });
  const arr = Rise(L1, { x: 620, y: 540, w: 1300, h: 380, html: 'arrivals', font: `italic 400 340px/1 ${BODONI}`, color: BRASS, ls: '-10px' });
  const rings = Array.from({ length: 5 }, () => Ring(L1));
  const shoe = Shoe(L1, 'axel-arigato', 1060, { refl: 0.15 });
  const copy = Rise(L1, { x: 130, y: 730, w: 560, h: 100, html: 'Luxury footwear, ordered in a tap<br>and brought to your door.', font: `400 32px/1.4 ${GEIST}`, color: 'rgba(18,18,20,.78)', sp: 'snappy' });
  const btn = mk(L1, { left: 130, top: 880, width: 300, height: 84, borderRadius: 42, background: INK, overflow: 'hidden' });
  const btxt = Rise(btn, { x: 0, y: 0, w: 300, h: 84, html: 'Shop the drop', font: `600 28px/84px ${GEIST}`, color: BONE, al: 'center', ls: '.02em', sp: 'snappy' });
  return t => {
    nu(t, 4.1); arr(t, 4.45); copy(t, 5.6); btxt(t, 6.1);
    nu.box.style.transform = `translateX(${12 * Math.max(0, t - 4.1)}px)`; arr.box.style.transform = `translateX(${-26 * Math.max(0, t - 4.45)}px)`;
    put(btn, { x: 0, y: (1 - sp(t, 6.0, 'snappy')) * 320, op: 1 });
    const e = sp(t, 4.35, 'default');
    put(shoe, { x: 1050, y: 420 + (1 - e) * 460 + bob(t, 0.4), rot: -5 + (1 - e) * 6 + bob(t, 1.0, 0.8, 3.1) });
    rings.forEach((r, k) => ringAt(r, t, 4.5 + 1.0 * k, 1060, 770, 140, 640, 0.2, 0.5));
  };
}

// =====================================================================================================================
// S2 build (8-12): a drop lands every beat pair, each one ripples in the next shoe
// =====================================================================================================================
function buildBuild() {
  const ups = BSC.map((b, i) => {
    const ghost = mk(LB[i], { left: 0, top: 120, width: W, height: 760, font: `400 760px/1 ${BODONI}`, color: 'rgba(18,18,20,.07)', textAlign: 'center', whiteSpace: 'nowrap', letterSpacing: '-18px' }, b.word);
    const rings = Array.from({ length: 3 }, () => Ring(LB[i])), shoe = Shoe(LB[i], b.name, b.w, { refl: 0.15 });
    return t => {
      const e = sp(t, b.t + 0.12, 'default');
      put(shoe, { x: b.c[0], y: b.c[1] + (1 - e) * 360 + bob(t, i * 1.3), rot: (i % 2 ? 4 : -4) * (1 - 0.5 * e) + bob(t, i, 0.7, 2.9), s: 0.94 + 0.06 * e });
      rings.forEach((r, k) => ringAt(r, t, b.t + 0.15 + 0.5 * k, b.c[0] + 20, 790, 100, 560, 0.2, 0.45));
    };
  });
  const drops = BSC.map(() => Drop(LT, 0.9));
  const big = Drop(LT, 1.8);
  return t => {
    BSC.forEach((b, i) => { ups[i](t); dropFall(drops[i], t, b.t, b.x, 790); });
    dropFall(big, t, 12.0, 960, 800, 0.5);
  };
}

// =====================================================================================================================
// S3 montage (12-21): the drop, a parade of floating shoes at depth, photo cards, a water lens, the button
// =====================================================================================================================
const PARADE = [   // name, width, centre, blur, enter delay, drift amplitude, phase
  { n: 'adidas-niteball', w: 900, c: [960, 430], blur: 0, d: 0.0, a: 14 },
  { n: 'nb-550', w: 740, c: [640, 560], blur: 0, d: 0.12, a: 10 },
  { n: 'nike-af1', w: 820, c: [1250, 540], blur: 0, d: 0.22, a: 10 },
  { n: 'nb-480', w: 470, c: [270, 470], blur: 2.5, d: 0.36, a: 5 },
  { n: 'nike-zoom', w: 520, c: [1660, 470], blur: 2.5, d: 0.44, a: 5 }];
const FOCUS = [['nb-550', 13.0, 14.0], ['nike-af1', 14.0, 15.0], ['adidas-niteball', 15.0, 16.0]];
const CARD_LAY = [['jordan-4', 645, 640], ['asics-kayano', 360, 640], ['balenciaga-runner', 512, 640]];
const CARD_X = (() => { let x = (W - (645 + 360 + 512 + 88)) / 2; return CARD_LAY.map(c => { const r = x; x += c[1] + 44; return r; }); })();
function buildMontage() {
  mk(LM, { left: 90, top: 40, width: 1800, height: 560, font: `400 480px/1 ${BODONI}`, color: 'rgba(18,18,20,.075)', whiteSpace: 'nowrap', letterSpacing: '-14px' }, 'Drip <i>Time</i>');
  mk(LM, { left: 0, top: 800, width: W, height: 280, background: 'linear-gradient(rgba(214,208,196,0),rgba(214,208,196,.65))' });
  const rings = Array.from({ length: 6 }, () => Ring(LM)), focusRings = FOCUS.map(() => Ring(LM));
  const shoes = PARADE.map(p => Shoe(LM, p.n, p.w, { blur: p.blur, refl: 0.15 }));
  const mkCards = parent => CARD_LAY.map(([n, w, h], i) => {
    const c = mk(parent, { left: CARD_X[i], top: 330, width: w, height: h, borderRadius: 26, overflow: 'hidden', filter: 'saturate(.84) contrast(1.02) sepia(.06)', boxShadow: '0 18px 50px rgba(40,34,24,.18)' });
    c.innerHTML = `<img src="assets/photos/${n}.jpg" style="left:0;top:0;width:${w}px;height:${h}px;object-fit:cover">`; return c;
  });
  const cards = mkCards(LM);
  const LD = 520, lens = mk(LM, { width: LD, height: LD, borderRadius: LD / 2, overflow: 'hidden', boxShadow: '0 0 0 4px rgba(255,255,255,.85),0 0 0 6px rgba(18,18,20,.4),0 40px 100px rgba(40,34,24,.35)', display: 'none' });
  const lensIn = mk(lens, { left: 0, top: 0, width: W, height: H, filter: 'url(#wl) brightness(1.07) saturate(1.12)', background: '#EDE8DF' });
  const lcards = mkCards(lensIn), lring = Ring(LM);
  const pill = mk(LM, { left: -260, top: -50, width: 520, height: 100, borderRadius: 50, background: INK, overflow: 'hidden', display: 'none' });
  const ptxt = mk(pill, { left: 0, top: 0, width: 520, height: 100, font: `600 32px/100px ${GEIST}`, color: BONE, textAlign: 'center', letterSpacing: '.02em' }, 'Shop the drop');
  const clickRing = Ring(LM), cursor = mk(LT, { width: 40, height: 56, display: 'none' }, `<svg width="40" height="56" viewBox="0 0 28 40" style="left:0;top:0;overflow:visible"><path d="M3 2 L3 30 L10 24 L15 36 L20 34 L15 22 L24 22 Z" fill="#121214" stroke="#F3EFE8" stroke-width="2.4" stroke-linejoin="round"/></svg>`);
  const LX = track(0, [{ t: 0, v: 0 }]);   // (keeps track() in the import path)
  const lensX = t => track(t, [{ t: 0, v: CARD_X[0] + 322 }, { t: 18.0, v: CARD_X[1] + 180 }, { t: 19.0, v: CARD_X[2] + 256 }, { t: 19.55, v: 960 }]);
  const lensY = t => track(t, [{ t: 0, v: 650 }, { t: 19.55, v: 540 }]);
  const curX = t => track(t, [{ t: 0, v: 1560 }, { t: 20.35, v: 1004 }, { t: 21.15, v: 1120 }]), curY = t => track(t, [{ t: 0, v: 930 }, { t: 20.35, v: 574 }, { t: 21.15, v: 700 }]);
  const cap = Rise(LM, { x: 130, y: 960, w: 900, h: 40, html: 'NEW ARRIVALS', font: `500 24px/40px ${GEIST}`, color: 'rgba(18,18,20,.7)', ls: '.34em', sp: 'snappy' });
  return t => {
    PARADE.forEach((p, i) => {
      const e = sp(t, 12.02 + p.d, 'default'), out = sp(t, 16.0 + 0.05 * i, 'default'), f = FOCUS.find(f => f[0] === p.n);
      const fs = f ? sp(t, f[1]) - sp(t, f[2]) : 0;
      put(shoes[i], { x: p.c[0] + p.a * Math.sin(2 * Math.PI * (t - 12) / 9 + i), y: p.c[1] + (1 - e) * 620 + out * 1150 + bob(t, i * 0.9, 8) - 26 * fs, rot: (i % 2 ? 5 : -3) + bob(t, i, 0.8, 3.3), s: (0.9 + 0.1 * e) * (1 + 0.1 * fs) });
    });
    PARADE.forEach((p, i) => ringAt(rings[i], t, 12.1 + p.d, p.c[0], 800, 80, 560, 0.2, 0.4));
    ringAt(rings[5], t, 12.0, 960, 800, 60, 1500, 0.16, 0.6);
    FOCUS.forEach((f, i) => ringAt(focusRings[i], t, f[1], PARADE.find(p => p.n === f[0]).c[0], 800, 60, 460, 0.2, 0.55));
    cap(t, 12.5);
    const cardY = i => (1 - sp(t, 16.15 + 0.12 * i, 'default')) * 780 + sp(t, 19.85 + 0.06 * i, 'default') * 780;
    [cards, lcards].forEach(row => row.forEach((c, i) => { c.style.transform = `translate(${(i - 1) * -22 * Math.max(0, t - 16.15)}px,${cardY(i)}px)`; c.style.visibility = cardY(i) > 760 ? 'hidden' : 'visible'; }));
    const ls = sp(t, 16.8, 'snappy') * (1 - 0.82 * sp(t, 19.55, 'default')), lx = lensX(t), ly = lensY(t);
    if (show(lens, ls > 0.005 && t < 19.9)) {
      put(lens, { x: lx - LD / 2, y: ly - LD / 2, s: ls });
      const z = 1.2; put(lensIn, { x: -(lx - LD / 2) + lx - z * lx, y: -(ly - LD / 2) + ly - z * ly, s: z });
      lensIn.style.transformOrigin = '0 0'; lensIn.style.transform = `translate(${-(lx - LD / 2) + lx - z * lx}px,${-(ly - LD / 2) + ly - z * ly}px) scale(${z})`;
      WLMAP.setAttribute('scale', '26');
    }
    ringAt(lring, t, 16.85, lx, ly, 20, 340, 1, 0.5); [17.0, 18.0, 19.0].forEach(() => {});
    const pr = sp(t, 19.85, 'default');
    if (show(pill, t >= 19.85 && t < 21.6)) { const pw = 100 + 420 * pr; Object.assign(pill.style, { width: pw + 'px', height: '100px', left: 960 - pw / 2 + 'px', top: '490px', background: `rgba(18,18,20,${sp(t, 19.8, 'snappy')})` }); put(pill, { s: 1 - 0.05 * (sp(t, 21.0, 'snappy') - sp(t, 21.12, 'snappy')) }); ptxt.style.left = (pw - 520) / 2 + 'px'; ptxt.style.opacity = swapAlpha(t, 19.98, 99, 0.16, 0.09); }
    ringAt(clickRing, t, 21.0, 960, 540, 40, 300, 1, 0.55);
    const ca = t >= 20.25 && t < 21.7;
    if (show(cursor, ca)) put(cursor, { x: curX(t) - 4, y: curY(t) - 3, s: (1 - 0.15 * (sp(t, 21.0, 'snappy') - sp(t, 21.12, 'snappy'))) * (1 - sp(t, 21.45, 'snappy')) });
  };
}

// =====================================================================================================================
// S4 order (21.1-26.5): ripple from the button; "Ordered." / shoe / "On its way." and a stand-in order card
// =====================================================================================================================
const ROUTE = 'M70 230 C 180 90, 290 270, 390 140 S 500 90, 540 70';
function buildOrder() {
  const ord = Rise(LO, { x: 120, y: 50, w: 1100, h: 270, html: 'Ordered.', font: `400 230px/1 ${BODONI}`, color: INK, ls: '-6px' });
  const rings = Array.from({ length: 5 }, () => Ring(LO)), shoe = Shoe(LO, 'adidas-niteball', 880, { refl: 0.12 });
  const way = Rise(LO, { x: 120, y: 690, w: 1180, h: 280, html: 'On its way.', font: `italic 400 230px/1 ${BODONI}`, color: BRASS, ls: '-6px' });
  const card = mk(LO, { left: 1230, top: 150, width: 600, height: 780, borderRadius: 44, background: 'rgba(255,255,255,.76)', boxShadow: '0 40px 100px rgba(60,50,34,.22),inset 0 0 0 1.5px rgba(255,255,255,.9)', overflow: 'hidden' });
  mk(card, { left: 60, top: 64, width: 500, height: 44, font: `600 34px/44px ${GEIST}`, color: INK }, 'Order confirmed');
  const sub1 = mk(card, { left: 60, top: 116, width: 500, height: 34, font: `400 26px/34px ${GEIST}`, color: 'rgba(18,18,20,.5)' }, 'Arriving today');
  const sub2 = mk(card, { left: 60, top: 116, width: 500, height: 34, font: `500 26px/34px ${GEIST}`, color: BRASS }, 'Delivered');
  const svg = mk(card, { left: 0, top: 180, width: 600, height: 300 }, `<svg width="600" height="300" viewBox="0 0 600 300" style="left:0;top:0;overflow:visible"><path id="route" d="${ROUTE}" fill="none" stroke="rgba(18,18,20,.25)" stroke-width="4" stroke-dasharray="3 14" stroke-linecap="round"/><circle cx="70" cy="230" r="10" fill="#121214"/><path id="pin" d="M540 50a20 20 0 1 1 .01 0z" fill="#121214"/><circle id="dot" cx="70" cy="230" r="15" fill="#B08A4E"/><circle id="halo" cx="70" cy="230" r="30" fill="none" stroke="#B08A4E" stroke-opacity=".4" stroke-width="3"/><path id="ck" d="M530 50l8 8 14-16" fill="none" stroke="#F3EFE8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`);
  const route = svg.querySelector('#route'), dot = svg.querySelector('#dot'), halo = svg.querySelector('#halo'), pin = svg.querySelector('#pin'), ck = svg.querySelector('#ck'), RL = route.getTotalLength();
  const NX = [110, 300, 490], NT = [22.6, 23.6, 25.0], NL = ['Confirmed', 'On its way', 'At your door'];
  mk(card, { left: NX[0], top: 610, width: 380, height: 3, background: 'rgba(18,18,20,.18)' });
  const bar = mk(card, { left: NX[0], top: 610, width: 0, height: 3, background: BRASS });
  const nodes = NX.map((x, i) => { const n = mk(card, { left: x - 15, top: 596, width: 30, height: 30, borderRadius: 15, background: '#F3EFE8', boxShadow: 'inset 0 0 0 3px rgba(18,18,20,.28)' }); const fill = mk(n, { left: 0, top: 0, width: 30, height: 30, borderRadius: 15, background: BRASS }); mk(card, { left: x - 100, top: 646, width: 200, height: 30, font: `500 24px/30px ${GEIST}`, color: INK, textAlign: 'center', opacity: 1 }, NL[i]).dataset.i = i; return fill; });
  const labels = [...card.querySelectorAll('[data-i]')];
  return t => {
    ord(t, 21.55); way(t, 22.1);
    const e = sp(t, 21.5, 'default'), pulse = sp(t, 25.0, 'heavy') - sp(t, 25.25, 'heavy');
    put(shoe, { x: 620, y: 430 + (1 - e) * 520 + bob(t, 2.1) - 10 * pulse, rot: -3 + bob(t, 0.5, 0.8, 3.1), s: 1 + 0.03 * pulse });
    rings.forEach((r, k) => ringAt(r, t, 21.75 + 1.0 * k, 600, 700, 120, 700, 0.2, 0.45));
    ringAt(rings[4], t, 25.0, 600, 700, 60, 900, 0.2, 0.6);
    const c = sp(t, 22.4, 'default'); put(card, { x: (1 - c) * 760, op: 1 });
    sub1.style.opacity = swapAlpha(t, 22.5, 24.95, 0.16, 0.09); sub2.style.opacity = swapAlpha(t, 25.05, 99, 0.16, 0.09);
    const prog = track(t, [{ t: 0, v: 0 }, { t: 22.95, v: 0.5, spring: 'heavy' }, { t: 24.1, v: 1, spring: 'heavy' }]);
    const pt = route.getPointAtLength(RL * clamp(prog)); dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); halo.setAttribute('cx', pt.x); halo.setAttribute('cy', pt.y);
    halo.setAttribute('r', 30 + 10 * Math.sin(2 * Math.PI * t / 0.9)); dot.style.opacity = t > 25.0 ? 0 : 1; halo.style.opacity = t > 25.0 ? 0 : 1;
    pin.setAttribute('fill', t >= 25.0 ? BRASS : INK); ck.style.strokeDashoffset = 1 - clamp((t - 25.05) / 0.3);
    bar.style.width = track(t, [{ t: 0, v: 0 }, { t: 23.6, v: 190, spring: 'default' }, { t: 25.0, v: 380, spring: 'default' }]) + 'px';
    nodes.forEach((n, i) => { const s = sp(t, NT[i], 'snappy'); n.style.transform = `scale(${s})`; n.style.visibility = s < 0.01 ? 'hidden' : 'visible'; });
  };
}

// =====================================================================================================================
// S5 end (25.7-30): ripple from the pin, "Drip Time" lockup, the shoe on its rings, one last drop, Powered by Climax Store
// =====================================================================================================================
function buildEnd() {
  const dr = Rise(LE, { x: 130, y: 70, w: 900, h: 470, html: 'Drip', font: `400 430px/1 ${BODONI}`, color: INK, ls: '-12px' });
  const ti = Rise(LE, { x: 130, y: 470, w: 1000, h: 400, html: 'Time', font: `italic 400 300px/1 ${BODONI}`, color: BRASS, ls: '-6px' });
  const lab = Rise(LE, { x: 136, y: 800, w: 600, h: 40, html: 'DRIP VERSE', font: `500 24px/40px ${GEIST}`, color: 'rgba(18,18,20,.6)', ls: '.34em', sp: 'snappy' });
  const pow = Rise(LE, { x: 136, y: 846, w: 700, h: 40, html: 'Powered by Climax Store', font: `400 26px/40px ${GEIST}`, color: 'rgba(18,18,20,.55)', sp: 'snappy' });
  const rings = Array.from({ length: 6 }, () => Ring(LE)), shoe = Shoe(LE, 'axel-arigato', 900, { refl: 0.15 }), drop = Drop(LE, 0.8);
  return t => {
    dr(t, 26.5); ti(t, 26.8); lab(t, 27.5); pow(t, 27.75);
    const e = sp(t, 26.55, 'default');
    put(shoe, { x: 1390, y: 560 + (1 - e) * 500 + bob(t, 0.3), rot: -4 + bob(t, 1.0, 0.8, 3.1) });
    [0, 1, 2].forEach(k => ringAt(rings[k], t, 26.8 + 1.0 * k, 1400, 850, 120, 620, 0.2, 0.45));
    [0, 1, 2].forEach(k => ringAt(rings[3 + k], t, 28.0 + 0.16 * k, 760, 860, 26, 700, 0.2, 0.6));
    dropFall(drop, t, 28.0, 760, 860, 0.5);
  };
}

// ---------- build once, then seek ----------
let BUILT = false, U = {};
window.seek = function (t) {
  if (!BUILT) {
    L0.style.display = 'block';
    U.hook = buildHook(); U.hero = buildHero(); U.build = buildBuild(); U.m = buildMontage(); U.o = buildOrder(); U.e = buildEnd(); BUILT = true;
  }
  show(L0, t < 4.7);
  reveal(L1, revRings[0], t, 3.55, window.HOOK_PX, window.HOOK_FLOOR);
  BSC.forEach((b, i) => reveal(LB[i], revRings[1 + i], t, b.t, b.x, 790));
  reveal(LM, revRings[5], t, 12.0, 960, 800);
  reveal(LO, revRings[6], t, 21.1, 960, 540);
  reveal(LE, revRings[7], t, 25.7, 1770, 380);
  show(L1, t >= 3.55 && t < 8.9); show(LM, t >= 12.0 && t < 21.7); show(LO, t >= 21.1 && t < 26.9);
  BSC.forEach((b, i) => { if (t >= b.t + 1.0 + 0.7) LB[i].style.display = 'none'; });
  U.hook(t); U.hero(t); U.build(t); U.m(t); U.o(t); U.e(t);
};
