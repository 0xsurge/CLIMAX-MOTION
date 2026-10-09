// Nyangu: fast, loud, always moving. 64 beats at 124 BPM (beat 0.4839 s) + a short hold, 16:9, drop on beat 16 (7.74 s).
// The carrier is the Nyangu badge (deep green circle, lime N). It lands, opens into the house, collapses, bursts into the six
// step cards on the drop, floods the frame green, and comes back for the lockup. Every move is a pure function of t.
// The 12 principles, in code: squash and stretch (velocity stretch + landing squash), anticipation (pre-move dips), staging (one
// focal action per beat), pose to pose (track keys), straight ahead (letters thrown on their own arcs), follow through and
// overlapping action (staggered letters and cards), slow in/out (springs), arcs (every flight is a bezier arc), secondary action
// (camera kicks, rings, counters), timing (snaps of 4-8 frames, holds of 3-6), exaggeration (punch scales), solid drawing (one
// light, one shadow), appeal (the real brand).
const { spring, track, swapAlpha, clamp, lerp } = Motion;
const W = 1920, H = 1080, BEAT = 60 / 124, b = n => n * BEAT, END = b(64.5);
const GREEN = '#003E30', LIME = '#DFE123', OFF = '#F7F7F7', INK = '#04130E', GREY = '#4A5550', JAK = "'Jakarta', system-ui, sans-serif";
const STAGE = document.getElementById('stage');
const sp = (t, t0, p = 'default') => spring(t - t0, p);
const FAST = { k: 900, c: 48 }, WHIP = { k: 520, c: 38 };   // very fast springs for mad pace (still critically-ish damped)

// ---------- TIMELINE (beats) ----------
const B = { tile: 0, land: 1, find: 1.25, perfect: 2.5, space: 3.5, lagos: 4.5, ant1: 6, open: 6.25, photoH: 8, toCard: 10, just: 10.5,
  count: 11.5, roll: 12, suck: 13.5, wind: 15, drop: 16, focus: [18, 20, 22, 24, 26, 28], panel: 30, nextH: 31, cur: 31.5, click: 33,
  strips: 33.5, rent: 36, deal: 36.5, whip: 40, rows: 40.5, pill: 44, mask: 46, built: 47, proof: 48.5, suck2: 54, wind2: 56.5,
  lock: 57, word: 57.5, cta: 59, url: 60 };
const T = Object.fromEntries(Object.entries(B).map(([k, v]) => [k, Array.isArray(v) ? v.map(b) : b(v)]));
window.TIMELINE = { BEAT, beats: B };

const css = document.createElement('style');
css.textContent = `@font-face{font-family:'Jakarta';src:url(assets/jakarta-var.woff2) format('woff2');font-weight:400 800}
#stage *{position:absolute;box-sizing:border-box;margin:0;padding:0}
#stage .t{position:static;display:inline-block;white-space:pre}`;
document.head.appendChild(css);
const IMGS = ['n_glyph.png', 'hero.jpg', 'family.jpg', 'wordmark.svg', ...[0, 1, 2, 3, 4, 5].map(i => `ui/step_${i}.png`), ...[0, 1, 2].map(i => `ui/trust_${i}.png`), ...[0, 1, 2].map(i => `ui/verify_${i}.png`), 'ui/pill_0.png', 'ui/search_0.png', 'ui/cta_1.png'];
const loadImg = s => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = 'assets/' + s; });
window.__preload = [document.fonts.load("800 100px 'Jakarta'"), document.fonts.load("600 40px 'Jakarta'"), ...IMGS.map(loadImg)];

// ---------- helpers ----------
const PXK = new Set(['left', 'top', 'width', 'height', 'borderRadius']);
function mk(parent, o = {}, html) {
  const e = document.createElement('div'); e.style.left = '0px'; e.style.top = '0px';
  for (const k in o) e.style[k] = (PXK.has(k) && typeof o[k] === 'number') ? o[k] + 'px' : o[k];
  if (html != null) e.innerHTML = html; parent.appendChild(e); return e;
}
const show = (e, on) => { e.style.display = on ? 'block' : 'none'; return on; };
const rect = (e, cx, cy, w, h, r) => Object.assign(e.style, { left: cx - w / 2 + 'px', top: cy - h / 2 + 'px', width: w + 'px', height: h + 'px', borderRadius: (r ?? Math.min(w, h) / 2) + 'px' });
// arc between two points: the control point sits off the straight line by `bend` x distance (principle: arcs)
function arc(p0, p1, u, bend = 0.25) {
  const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1];
  const cx = mx - dy * bend, cy = my + dx * bend, v = 1 - u;
  return [v * v * p0[0] + 2 * v * u * cx + u * u * p1[0], v * v * p0[1] + 2 * v * u * cy + u * u * p1[1]];
}
// place an element at a moving point with velocity stretch (principle: squash and stretch); pf(t) -> [x, y]
function fly(e, pf, t, o = {}) {
  const h = 1 / 240, [x, y] = pf(t), [xa, ya] = pf(t - h), [xb, yb] = pf(t + h);
  const vx = (xb - xa) / (2 * h), vy = (yb - ya) / (2 * h), v = Math.hypot(vx, vy), a = Math.atan2(vy, vx) * 180 / Math.PI;
  const k = clamp(v / 7000, 0, o.maxStretch ?? 0.38), s = o.s ?? 1, sq = o.sq || 0;
  e.style.transform = `translate(${x}px,${y}px) rotate(${a}deg) scale(${1 + k},${1 - k * 0.55}) rotate(${-a}deg) rotate(${o.rot || 0}deg) scale(${s * (1 + sq)},${s * (1 - sq)})`;
}
// landing squash: a closed-form damped spring that starts when the object arrives (principle: squash)
const squash = (t, tl, A = 0.22) => t < tl ? 0 : A * Math.exp(-(t - tl) * 11) * Math.cos((t - tl) * 26);
// anticipation: a dip before the main move begins at t0 (principle: anticipation)
const ant = (t, t0, A = 0.14, lead = 0.16) => A * (sp(t, t0 - lead, FAST) - sp(t, t0, FAST));
const kick = (t, t0, A) => A * (sp(t, t0, FAST) - sp(t, t0 + 0.1, 'default'));      // camera punch on hits (secondary action)
const img = (parent, src, w, h, o = {}) => mk(parent, { left: -w / 2, top: -h / 2, width: w, height: h, ...o }, `<img src="assets/${src}" style="left:0;top:0;width:${w}px;height:${h}px">`);
const DIMS = { step: [700, 674], trust: [822, 522], verify: [1216, 176], pill: [478, 92], search: [2560, 742], cta: [372, 96] };
// words built as separate letters measured once, so each letter can fly on its own arc (straight ahead + overlapping action)
function Letters(parent, text, x, y, size, color, weight = 800, ls = '-0.035em') {
  const row = mk(parent, { left: x, top: y, font: `${weight} ${size}px/1.1 ${JAK}`, color, letterSpacing: ls, whiteSpace: 'nowrap' });
  const spans = [...text].map(ch => { const s = document.createElement('span'); s.className = 't'; s.textContent = ch; row.appendChild(s); return s; });
  const pr = row.getBoundingClientRect();
  const L = spans.map(s => { const r = s.getBoundingClientRect(); return { x: r.left - pr.left, y: 0, w: r.width, ch: s.textContent }; });
  row.innerHTML = ''; Object.assign(row.style, { width: '1px', height: '1px' });
  return L.map(l => { const e = mk(row, { left: 0, top: 0, font: `${weight} ${size}px/1.1 ${JAK}`, color, letterSpacing: ls, whiteSpace: 'pre', transformOrigin: '50% 60%' }, l.ch === ' ' ? '&nbsp;' : l.ch); return { e, x: x + l.x, y, w: l.w, row }; });
}
// fly a set of letters in from `from` (or from below) and out to `to`; stagger per letter
function flyLetters(Ls, t, tin, tout, o = {}) {
  Ls.forEach((L, i) => {
    const t0 = tin + i * (o.st ?? 0.025), t1 = tout + i * (o.st ?? 0.025) * 0.6;
    const u = sp(t, t0, o.p || WHIP), v = sp(t, t1, o.pOut || FAST);
    const home = [L.x, L.y], src = o.from ? o.from : [L.x, L.y + (o.dy ?? 220)], dst = o.to ? (typeof o.to === 'function' ? o.to(L, i) : o.to) : [L.x - 1500, L.y - 260];
    const vis = t >= t0 && v < 0.995; L.e.style.visibility = vis ? 'visible' : 'hidden';
    if (!vis) return;
    const pf = tt => { const uu = sp(tt, t0, o.p || WHIP), vv = sp(tt, t1, o.pOut || FAST); const p = arc(src, home, uu, o.bend ?? 0.18); return vv > 0 ? arc(p, dst, vv, -(o.bend ?? 0.18)) : p; };
    const s = (o.from ? lerp(0.2, 1, u) : 1) * (o.to && typeof o.to !== 'function' ? lerp(1, 0.1, v) : 1);
    L.e.style.left = '0px'; L.e.style.top = '0px'; L.row.style.left = '0px'; L.row.style.top = '0px';
    fly(L.e, pf, t, { s, rot: (o.spin ?? 0) * (1 - u), sq: squash(t, t0 + 0.12, 0.12) });
  });
}

// ---------- world ----------
STAGE.style.background = OFF;
const VIEW = mk(STAGE, { width: W, height: H, transformOrigin: '960px 540px' });
const BG = mk(VIEW, { width: W, height: H, background: OFF });
const L1 = mk(VIEW, { width: W, height: H });            // act A/C type
const PH = mk(VIEW, { overflow: 'hidden', display: 'none', background: 'linear-gradient(#DDE4E1,#F4F6F5 70%)' });   // the hero PNG has a transparent sky   // the photo window (born from the tile)
const phImg = mk(PH, { width: 3200, height: 1513, left: 0, top: 0 }, `<img src="assets/hero.jpg" style="left:0;top:0;width:3200px;height:1513px">`);
const phShade = mk(PH, { width: 3200, height: 1513, background: 'linear-gradient(90deg,rgba(0,30,22,.62),rgba(0,30,22,.05) 60%)' });
const phWipe = mk(PH, { background: GREEN, borderRadius: '50%' });   // circle wipe back to the badge
const L2 = mk(VIEW, { width: W, height: H });            // over-photo type
const FLOOD = mk(VIEW, { background: GREEN, display: 'none' });                    // the green field from the drop
const BIGNUM = mk(VIEW, { left: 0, top: 0, width: W, height: H, overflow: 'hidden', display: 'none' });
const bigCol = mk(BIGNUM, { left: 0, top: 0, width: W, height: 6 * 760 });
['01', '02', '03', '04', '05', '06'].forEach((n, i) => mk(bigCol, { left: 0, top: i * 760, width: W, height: 760, font: `800 720px/760px ${JAK}`, color: 'transparent', WebkitTextStroke: `3px ${LIME}`, textAlign: 'center', letterSpacing: '-0.04em' }, n));
const CARDS = mk(VIEW, { width: W, height: H, zIndex: 2 });   // own stacking context: focused cards never rise above the white stage
const steps = [0, 1, 2, 3, 4, 5].map(i => img(CARDS, `ui/step_${i}.png`, 420, 420 * 674 / 700, { display: 'none', filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.28))' }));
const WHITE = mk(VIEW, { background: OFF, display: 'none', zIndex: 3 });
const L3 = mk(VIEW, { width: W, height: H, zIndex: 4 });            // search / trust / verify / family
const panel = img(L3, 'ui/search_0.png', 1600, 1600 * 742 / 2560, { display: 'none', filter: 'drop-shadow(0 30px 60px rgba(0,30,22,.14))' });
const strips = [0, 1, 2].map(i => mk(L3, { overflow: 'hidden', display: 'none', borderRadius: 28, background: 'linear-gradient(#DDE4E1,#F4F6F5 70%)' }, `<img src="assets/hero.jpg" style="left:0;top:0;width:3200px;height:1513px">`));
const trust = [0, 1, 2].map(i => img(L3, `ui/trust_${i}.png`, 520, 520 * 522 / 822, { display: 'none', filter: 'drop-shadow(0 26px 40px rgba(0,30,22,.18))' }));
const verify = [0, 1, 2].map(i => img(L3, `ui/verify_${i}.png`, 900, 900 * 176 / 1216, { display: 'none', background: '#fff', borderRadius: 30, filter: 'drop-shadow(0 18px 30px rgba(0,30,22,.12))' }));
const pings = [0, 1, 2].map(() => mk(L3, { borderRadius: '50%', border: `4px solid ${LIME}`, display: 'none' }));
const pill = img(L3, 'ui/pill_0.png', 520, 520 * 92 / 478, { display: 'none', background: '#fff', borderRadius: 60 });
const FAM = mk(L3, { overflow: 'hidden', display: 'none', background: GREEN });
const famImg = mk(FAM, { width: 1200, height: 1114 }, `<img src="assets/family.jpg" style="left:0;top:0;width:1200px;height:1114px">`);
const L4 = mk(VIEW, { width: W, height: H, zIndex: 5 });            // end lockup
const word = mk(L4, { width: 620, height: 164, overflow: 'hidden', display: 'none' }, `<img src="assets/wordmark.svg" style="left:-${620 * 46 / 159}px;top:0;width:620px;height:164px">`);
const wordIn = word.firstChild;
const cta = img(L4, 'ui/cta_1.png', 560, 560 * 96 / 372, { display: 'none', filter: 'drop-shadow(0 20px 30px rgba(0,62,48,.3))' });
const url = mk(L4, { width: 600, height: 50, overflow: 'hidden', display: 'none' }, `<div style="left:0;top:0;width:600px;height:50px;font:600 34px/50px ${JAK};color:${GREY};text-align:center;letter-spacing:.02em">nyangu.com</div>`);
// the carrier badge
const TILE = mk(VIEW, { background: GREEN, overflow: 'hidden', display: 'none', boxShadow: '0 24px 40px rgba(0,30,22,.3)' });
const glyph = img(TILE, 'n_glyph.png', 100, 100 * 556 / 431, {});
const CUR = mk(VIEW, { width: 40, height: 40, display: 'none' }, `<div style="left:0;top:0;width:40px;height:40px;border-radius:20px;background:${LIME};box-shadow:0 0 0 6px rgba(223,225,35,.35),0 8px 16px rgba(0,0,0,.25)"></div>`);
const curRing = mk(VIEW, { borderRadius: '50%', border: `4px solid ${LIME}`, display: 'none' });

// ---------- text ----------
const A1 = Letters(L1, 'Find your', 560, 300, 140, INK);
const A2 = Letters(L1, 'perfect space', 560, 460, 140, GREEN);
const LAG = mk(L1, { left: 566, top: 650, height: 92, padding: '0 34px', borderRadius: 46, background: LIME, font: `800 56px/92px ${JAK}`, color: GREEN, display: 'none', transformOrigin: '0 50%', whiteSpace: 'nowrap' }, 'in Lagos.');
const P1 = Letters(L2, 'Find trusted', 130, 640, 110, '#fff');
const P2 = Letters(L2, 'properties.', 130, 770, 110, LIME);
const C1 = Letters(L1, 'Just 6 steps.', 130, 250, 130, INK);
const C2 = Letters(L1, 'But who’s counting?', 136, 420, 64, GREY, 700, '-0.02em');
const CNT = mk(L1, { left: 130, top: 520, width: 520, height: 380, overflow: 'hidden', display: 'none' });
const cntCol = mk(CNT, { left: 0, top: 0, width: 520, height: 6 * 380 });
['01', '02', '03', '04', '05', '06'].forEach((n, i) => mk(cntCol, { left: 0, top: i * 380, width: 520, height: 380, font: `800 360px/380px ${JAK}`, color: GREEN, letterSpacing: '-0.05em' }, n));
const F1 = Letters(L3, 'Find your next home.', 160, 150, 104, INK);
const R1 = Letters(L3, 'Rent with', 120, 110, 120, INK);
const R2 = Letters(L3, 'Confidence.', 120, 250, 120, GREEN);
const BU1 = Letters(L3, 'Built for a market', 110, 330, 96, INK);
const BU2 = Letters(L3, 'that needs proof.', 110, 460, 96, GREEN);

// ---------- camera: always moving + kicks ----------
const ACTS = [0, T.drop, T.panel, T.whip, T.mask, T.lock];
const DR = [[1, -1, .010], [-1, 1, .009], [1, 1, .009], [-1, -1, .010], [1, -1, .009], [-1, 0, .006]];
const mv = (t, i) => { const d = Math.max(0, t - ACTS[i]), [x, y, z] = DR[i]; return [x * 12 * d, y * 6 * d, 1 + z * d]; };
function camera(t) {
  let v = mv(t, 0);
  for (let i = 1; i < ACTS.length; i++) { const w = sp(t, ACTS[i], 'heavy'); if (w <= 0) break; v = v.map((a, k) => lerp(a, mv(t, i)[k], w)); }
  const k = kick(t, T.land, 0.025) + kick(t, T.drop, 0.07) + kick(t, T.focus[4], 0.05) + kick(t, T.click, 0.03) + kick(t, T.pill, 0.03) + kick(t, T.lock, 0.04);
  const shake = t > T.drop && t < T.drop + 0.5 ? 10 * Math.exp(-(t - T.drop) * 9) * Math.sin((t - T.drop) * 90) : 0;
  return { x: v[0] + shake, y: v[1], z: v[2] + k };
}

// ---------- the badge path ----------
function tileState(t) {
  // returns centre, w, h, radius, glyph scale
  let c = arc([90, 150], [430, 560], sp(t, T.tile, WHIP), 0.3), w = 170, h = 170, r = 85, g = 1;
  const a1 = ant(t, T.open, 0.16);
  const o = sp(t, T.open, FAST), oc = sp(t, T.open, WHIP);
  c = [lerp(c[0], 960, oc), lerp(c[1], 540, oc)]; w = lerp(170, 1960, o); h = lerp(170, 1120, o); r = lerp(85, 0, o); g = 1 - clamp(o * 3);
  const k = sp(t, T.toCard, WHIP);                          // window -> card on the right
  c = [lerp(c[0], 1400, k), lerp(c[1], 560, k)]; w = lerp(w, 760, k); h = lerp(h, 760, k); r = lerp(r, 44, k);
  const s = sp(t, T.suck, FAST);                            // card -> badge at centre
  c = arc([c[0], c[1]], [960, 540], s, -0.2); w = lerp(w, 170, s); h = lerp(h, 170, s); r = lerp(r, 85, s); g = Math.max(g, clamp((s - 0.6) * 2.5));
  const f = sp(t, T.drop, WHIP);                             // the burst: badge floods the frame
  w = lerp(w, 2400, f); h = lerp(h, 2400, f); r = lerp(r, 1200, f); g = g * (1 - clamp(f * 4));
  const scale = (1 - a1) * (1 - ant(t, T.drop, 0.22, 0.45));   // wind-up before the drop
  const ch = clamp((t - (T.suck + 0.45)) / 0.15) * (1 - clamp((t - T.drop) / 0.05));      // charging: pulse and wobble while it waits
  return { c, w: w * scale * (1 + 0.07 * ch * Math.sin(t * 2 * Math.PI * 4)), h: h * scale * (1 + 0.07 * ch * Math.sin(t * 2 * Math.PI * 4)), r: r * (1 + 0.07 * ch * Math.sin(t * 2 * Math.PI * 4)), g, rot: 9 * ch * Math.sin(t * 2 * Math.PI * 2.5), sq: squash(t, T.land - 0.12, 0.24) + squash(t, T.drop, 0.08) };
}

// ---------- seek ----------
window.seek = function (t) {
  const cam = camera(t); VIEW.style.transform = `translate(${cam.x}px,${cam.y}px) scale(${cam.z})`;
  const green = t >= T.drop && t < T.panel + b(1);
  BG.style.background = OFF;

  // A: badge lands, type thrown out of it
  const st = tileState(t), inPhoto = t >= T.open + 0.06 && t < T.suck + b(1);
  const phWipeU = sp(t, T.suck + 0.12, FAST);
  const tileOn = (t < T.drop + b(1) && !(inPhoto && phWipeU < 0.98)) || t >= T.suck2;
  TILE.style.zIndex = t < T.panel ? 1 : 6;          // under the cards during the drop, over everything at the lockup
  if (show(TILE, tileOn)) {
    if (t < T.suck2) {
      rect(TILE, 0, 0, st.w, st.h, st.r); TILE.style.background = GREEN;
      TILE.style.transform = `translate(${st.c[0]}px,${st.c[1]}px) rotate(${st.rot || 0}deg) scale(${1 + st.sq},${1 - st.sq})`;
      glyph.style.transform = `translate(${st.w / 2}px,${st.h / 2}px) scale(${st.g * st.w / 170 * 0.85 + (1 - st.g) * 0.0})`;
      glyph.style.visibility = st.g < 0.02 ? 'hidden' : 'visible';
    } else {
      const pop = sp(t, T.suck2, 'heavy'), wind = ant(t, T.lock, 0.2, 0.3), mvL = sp(t, T.lock, WHIP);
      const ch2 = clamp((t - (T.suck2 + 0.55)) / 0.15) * (1 - clamp((t - T.lock) / 0.05)), pulse = 1 + 0.07 * ch2 * Math.sin(t * 2 * Math.PI * 4);
      const c = [lerp(960, 640, mvL), 500], sz = 190 * pop * (1 - wind) * pulse;
      rect(TILE, 0, 0, sz, sz, sz / 2); TILE.style.transform = `translate(${c[0]}px,${c[1]}px) rotate(${9 * ch2 * Math.sin(t * 2 * Math.PI * 2.5)}deg) scale(${1 + squash(t, T.lock + 0.15, 0.18)},${1 - squash(t, T.lock + 0.15, 0.18)})`;
      glyph.style.transform = `translate(${sz / 2}px,${sz / 2}px) scale(${sz / 170 * 0.85})`; glyph.style.visibility = 'visible';
    }
  }
  flyLetters(A1, t, T.find, T.open - 0.05, { from: [430, 560], bend: 0.35, to: (L, i) => [960, 540] });
  flyLetters(A2, t, T.perfect, T.open - 0.02, { from: [430, 560], bend: 0.35, to: (L, i) => [960, 540] });
  // exaggeration: "space" opens its letter spacing on its beat, then settles
  const spc = 22 * (sp(t, T.space, FAST) - sp(t, T.space + 0.25, 'default'));
  A2.slice(8).forEach((L, i) => { L.x0 = L.x0 ?? L.x; L.x = L.x0 + spc * (i + 1); });
  const lg = sp(t, T.lagos, FAST) * (1 - sp(t, T.open - 0.1, FAST));
  if (show(LAG, lg > 0.01)) LAG.style.transform = `scale(${lg * (1 + squash(t, T.lagos + 0.1, 0.18))},${lg * (1 - squash(t, T.lagos + 0.1, 0.18))})`;

  // B: the photo window (inside the badge) keeps moving: push + pan
  if (show(PH, inPhoto)) {
    const st2 = st; rect(PH, 0, 0, st2.w, st2.h, st2.r); PH.style.transform = `translate(${st2.c[0]}px,${st2.c[1]}px)`;
    const z = 0.86 - 0.08 * clamp((t - T.open) / 5), panX = -140 * (t - T.open), panY = -18 * (t - T.open);
    phImg.style.transformOrigin = '0 0';
    phImg.style.transform = `translate(${st2.w / 2 - 1600 * z + 260 + panX}px,${st2.h / 2 - 756 * z + panY}px) scale(${z})`;
    { const d = Math.hypot(st2.w, st2.h) * phWipeU; rect(phWipe, st2.w / 2, st2.h / 2, d, d); phWipe.style.display = phWipeU > 0.005 ? 'block' : 'none'; }
    phShade.style.transform = phImg.style.transform; phShade.style.transformOrigin = '0 0';
  }
  flyLetters(P1, t, T.photoH, T.toCard - 0.1, { dy: 260, to: (L) => [L.x - 300, L.y - 900] });
  flyLetters(P2, t, T.photoH + b(0.5), T.toCard - 0.05, { dy: 260, to: (L) => [L.x - 300, L.y - 900] });

  // C: just 6 steps, counter rolls 01 -> 06, everything sucked into the badge
  flyLetters(C1, t, T.just, T.suck, { dy: 240, to: () => [960, 540], bend: 0.3 });
  flyLetters(C2, t, T.count, T.suck + 0.06, { dy: 120, st: 0.012, to: () => [960, 540], bend: 0.3 });
  const cv = track(t, [{ t: 0, v: 0 }, ...[1, 2, 3, 4, 5].map(k => ({ t: T.roll + b(k * 0.3), v: k, spring: FAST }))]);
  const cIn = sp(t, T.count + b(0.5), WHIP), cOut = sp(t, T.suck + 0.08, FAST);
  if (show(CNT, cIn > 0.01 && cOut < 0.99)) {
    const p = arc([130, 520], [960 - 260, 540 - 190], cOut, 0.3);
    CNT.style.left = '0px'; CNT.style.top = '0px'; CNT.style.transform = `translate(${p[0]}px,${p[1] + (1 - cIn) * 300}px) scale(${1 - 0.9 * cOut})`;
    cntCol.style.transform = `translateY(${-cv * 380}px)`;
  }

  // D/E: drop. green flood, six cards burst out of the badge, then each card takes the stage in turn
  if (show(FLOOD, t >= T.drop + b(0.5) && green)) { rect(FLOOD, 960, 540, 2400, 2400, 0); }
  if (show(BIGNUM, t >= T.focus[0] && t < T.panel + 0.2)) {
    const fv = track(t, [{ t: 0, v: 0 }, ...T.focus.map((f, i) => ({ t: f, v: i, spring: FAST }))]);
    bigCol.style.transform = `translateY(${-fv * 760 + 160 - 40 * Math.sin(t * 2)}px) scale(${1 + 0.04 * Math.sin(t * 3)})`;
  }
  const fan = i => ({ x: 960 + (i - 2.5) * 290, y: 600 + Math.abs(i - 2.5) ** 2 * 22, rot: (i - 2.5) * 7 });
  const focusW = T.focus.map((f, i) => sp(t, f, WHIP) - (i < 5 ? sp(t, T.focus[i + 1], WHIP) : 0));
  const anyF = focusW.reduce((a, c) => a + c, 0);
  steps.forEach((e, i) => {
    const t0 = T.drop + i * 0.035, on = t >= t0 && t < T.panel + b(1.5);
    if (!show(e, on)) return;
    const fz = focusW[i], rec = clamp(anyF - fz), F = fan(i), out = sp(t, T.panel, WHIP);
    const pf = tt => {
      const u = sp(tt, T.drop + i * 0.035, WHIP); let p = arc([960, 540], [F.x, F.y], u, (i - 2.5) * 0.12);
      const fzz = T.focus.map((f, j) => sp(tt, f, WHIP) - (j < 5 ? sp(tt, T.focus[j + 1], WHIP) : 0))[i];
      p = [lerp(p[0], 960, fzz), lerp(p[1], 560, fzz)];
      const o = sp(tt, T.panel, WHIP); if (i !== 5 && o > 0) p = arc(p, [p[0] + (i - 2.5) * 900, p[1] + 900], o, 0.2);
      return p;
    };
    const s = (0.3 + 0.7 * sp(t, t0, WHIP)) * (1 + 0.5 * fz - 0.15 * rec) * (i === 5 ? 1 + 0.6 * out : 1);
    fly(e, pf, t, { s, rot: F.rot * (1 - fz) * (1 + 0.4 * rec), sq: squash(t, T.focus[i] + 0.12, 0.1) });
    e.style.zIndex = fz > 0.5 ? 10 : Math.round(5 - Math.abs(i - 2.5));
  });

  // F: the Move In card blows up into the white stage; the real search panel lands; cursor hits Apply Filters
  const wh = sp(t, T.panel, FAST);
  if (show(WHITE, t >= T.panel && t < END)) { rect(WHITE, 960, 560, lerp(420 * 1.5, 2100, wh), lerp(404 * 1.5, 1300, wh), lerp(36, 0, wh)); }
  flyLetters(F1, t, T.nextH, T.strips, { dy: 200, st: 0.018, to: (L) => [L.x + 1800, L.y] });
  const pIn = sp(t, T.panel + b(0.02), WHIP), pOut = sp(t, T.strips, FAST), click = sp(t, T.click, FAST) - sp(t, T.click + 0.1, 'default');
  if (show(panel, pIn > 0.01 && pOut < 0.99)) fly(panel, tt => [960 + (1 - sp(tt, T.panel + b(0.02), WHIP)) * 1400, 620 + sp(tt, T.strips, FAST) * 900], t, { s: 0.9 + 0.1 * pIn, sq: -0.06 * click, maxStretch: 0.2 });
  const BTN = [960 - 800 + 1467, 620 - 232 + 392];
  const cOn = t >= T.cur && t < T.strips + 0.1;
  if (show(CUR, cOn)) fly(CUR, tt => arc([300, 1000], [BTN[0] - 20, BTN[1] - 20], sp(tt, T.cur, WHIP), 0.4), t, { s: 1 - 0.3 * click });
  const cr = sp(t, T.click, { k: 14, c: 8.5 });
  if (show(curRing, t >= T.click && cr < 0.97)) { const r = 20 + 200 * cr; Object.assign(curRing.style, { left: BTN[0] - r + 'px', top: BTN[1] - r + 'px', width: 2 * r + 'px', height: 2 * r + 'px', opacity: 1 - cr }); }
  // the panel splits into three moving photo strips (parallax: each strip pans at its own speed)
  strips.forEach((e, i) => {
    const t0 = T.strips + i * 0.06, u = sp(t, t0, WHIP), o = sp(t, T.rent, FAST);
    if (!show(e, t >= t0 && o < 0.99)) return;
    const x = 120 + i * 570, w = 540, h = 800, y = 140 + (1 - u) * 1100 + o * 1200 + (i - 1) * 30;
    Object.assign(e.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    e.firstChild.style.transform = `translate(${-x - 700 - (t - T.strips) * (90 + i * 70)}px,${-120 - (i - 1) * 30}px) scale(0.85)`; e.firstChild.style.transformOrigin = '0 0';
  });

  // G: Rent with Confidence, trust cards dealt in on arcs, then whipped off
  flyLetters(R1, t, T.rent, T.whip, { dy: 220, to: (L) => [L.x - 1700, L.y] });
  flyLetters(R2, t, T.rent + b(0.5), T.whip + 0.04, { dy: 220, to: (L) => [L.x - 1700, L.y] });
  trust.forEach((e, i) => {
    const t0 = T.deal + b(0.5 * i), on = t >= t0 && sp(t, T.whip + i * 0.04, FAST) < 0.99;
    if (!show(e, on)) return;
    const P = [[520, 690, -5], [1000, 650, 0], [1480, 690, 5]][i];
    fly(e, tt => { const p = arc([2200, 1300], [P[0], P[1]], sp(tt, T.deal + b(0.5 * i), WHIP), 0.25); return arc(p, [P[0] - 2600, P[1] - 100], sp(tt, T.whip + i * 0.04, FAST), 0.1); }, t, { rot: P[2] + 14 * (1 - sp(t, t0, WHIP)), sq: squash(t, t0 + 0.14, 0.08) });
  });

  // H: verified rows slam in, each with a lime ping; the pill stamps
  verify.forEach((e, i) => {
    const t0 = T.rows + b(0.5 * i), out = sp(t, T.mask, FAST);
    if (!show(e, t >= t0 && out < 0.99)) return;
    const y = 300 + i * 170;
    fly(e, tt => [lerp(2500, 760, sp(tt, T.rows + b(0.5 * i), WHIP)) - sp(tt, T.mask, FAST) * 1800, y], t, { sq: squash(t, t0 + 0.12, 0.08) });
    const pr = sp(t, t0 + 0.15, { k: 14, c: 8.5 });
    if (show(pings[i], t >= t0 + 0.15 && pr < 0.97)) { const r = 26 + 140 * pr, cx = 760 - 450 + 56 - sp(t, T.mask, FAST) * 1800, cy = y; Object.assign(pings[i].style, { left: cx - r + 'px', top: cy - r + 'px', width: 2 * r + 'px', height: 2 * r + 'px', opacity: 1 - pr }); }
  });
  const ps = sp(t, T.pill, FAST), pm = sp(t, T.mask, WHIP);
  if (show(pill, t >= T.pill && pm < 0.5)) fly(pill, () => [760, 840], t, { s: lerp(1.9, 1, ps), sq: squash(t, T.pill + 0.08, 0.2) });

  // I: the pill becomes the window onto the family; headline slams in; the photo keeps moving
  if (show(FAM, t >= T.mask && t < T.suck2 + b(2))) {
    const k = sp(t, T.suck2 + 0.1, WHIP), r0 = [760, 840, 520, 100, 50], r1 = [1430, 560, 860, 900, 44];
    let g = r0.map((v, i) => lerp(v, r1[i], pm)); g = [lerp(g[0], 960, k), lerp(g[1], 540, k), lerp(g[2], 190, k), lerp(g[3], 190, k), lerp(g[4], 95, k)];
    rect(FAM, g[0], g[1], g[2], g[3], g[4]);
    const z = 0.9 - 0.06 * clamp((t - T.mask) / 4); famImg.style.transformOrigin = '0 0';
    famImg.style.transform = `translate(${g[2] / 2 - 600 * z - (t - T.mask) * 22}px,${g[3] / 2 - 520 * z}px) scale(${z})`;
  }
  flyLetters(BU1, t, T.built, T.suck2 + 0.05, { dy: 220, to: () => [960, 540], bend: 0.3 });
  flyLetters(BU2, t, T.proof, T.suck2 + 0.1, { dy: 220, to: () => [960, 540], bend: 0.3 });

  // J: lockup
  const wv = sp(t, T.word, WHIP);
  if (show(word, t >= T.word)) { word.style.left = 760 + 'px'; word.style.top = 500 - 82 + 'px'; word.style.clipPath = `inset(0 ${(1 - wv) * 100}% 0 0)`; wordIn.style.transform = `translateX(${(1 - wv) * -120}px)`; }
  const cs = sp(t, T.cta, FAST);
  if (show(cta, t >= T.cta)) fly(cta, tt => [960, lerp(900, 720, sp(tt, T.cta, WHIP))], t, { s: cs, sq: squash(t, T.cta + 0.1, 0.16) });
  if (show(url, t >= T.url)) { url.style.left = '660px'; url.style.top = '820px'; url.firstChild.style.transform = `translateY(${(1 - sp(t, T.url, FAST)) * 50}px)`; }
};
