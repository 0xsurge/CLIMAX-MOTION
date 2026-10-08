// film.js: one container that never cuts. Every state is the same element changing size, radius and fill
// while its text swaps. A cursor drives every change. Everything is a pure function of t.
// Replace the STATES with your product flow; keep the structure. Hits land on beats (see beats.json).
const { track, spring, swapAlpha, mulberry32, clamp } = Motion;
const T = window.TOKENS, W = FORMAT.w, H = FORMAT.h, stage = document.getElementById('stage');
const BEAT = 60 / T.bpm;
const S = Math.min(W, H) / 1080;                       // one scale for every format

// State list: [beat, label, w, h, radius, fill]. Sizes are for a 1080 short side.
const STATES = [
  [0, T.hook,      760, 150, 75, T.accent],
  [4, T.promise,   900, 520, 36, T.surface],
  [8, T.proof,     520, 520, 260, T.accent],
  [12, T.cta,      880, 150, 75, T.accent],
].map(([b, label, w, h, r, fill]) => ({ t: b * BEAT, label, w: w * S, h: h * S, r: r * S, fill }));

// DOM, built once. seek() only changes style values.
stage.style.background = T.canvas;
const box = Object.assign(document.createElement('div'), {});
Object.assign(box.style, { position: 'absolute', left: '0', top: '0', transformOrigin: '50% 50%', overflow: 'hidden' });
const label = document.createElement('div');
Object.assign(label.style, { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center',
  font: `700 ${64 * S}px ${T.displayFont}`, color: T.ink, letterSpacing: '-0.02em', textAlign: 'center', padding: `0 ${40 * S}px` });
const cursor = document.createElement('div');
Object.assign(cursor.style, { position: 'absolute', left: '0', top: '0', width: 28 * S + 'px', height: 28 * S + 'px', borderRadius: '50%',
  background: T.ink, border: `${4 * S}px solid ${T.canvas}`, transformOrigin: '50% 50%' });
box.appendChild(label); stage.append(box, cursor);

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, u) => 'rgb(' + hex(a).map((x, i) => Math.round(x + (hex(b)[i] - x) * u)).join(',') + ')';

window.seek = function (t) {
  // One track per property: one spring per change, each starting at its own time. Never restarted.
  const keys = f => STATES.map((s, i) => ({ t: s.t, v: f(s, i), spring: 'default' }));
  const w = track(t, keys(s => s.w)), h = track(t, keys(s => s.h)), r = track(t, keys(s => s.r));
  const fillU = track(t, STATES.map((s, i) => ({ t: s.t, v: i, spring: 'snappy' })));   // fractional state index
  const i0 = clamp(Math.floor(fillU), 0, STATES.length - 1), i1 = clamp(i0 + 1, 0, STATES.length - 1);
  box.style.background = mix(STATES[i0].fill, STATES[i1].fill, clamp(fillU - i0));
  Object.assign(box.style, { width: w + 'px', height: h + 'px', borderRadius: r + 'px',
    transform: `translate(${(W - w) / 2}px, ${(H - h) / 2}px)` });          // 2D transform only

  // Text: enters after the morph starts, leaves before the next morph; a small rise stands in for a fade-only enter.
  let k = 0; STATES.forEach((s, i) => { if (t >= s.t - 0.2) k = i; });
  const tIn = k === 0 ? -1 : STATES[k].t + 0.12,   // frame 0 already reads
         tOut = (STATES[k + 1] ? STATES[k + 1].t : 1e9) - 0.1;
  label.textContent = STATES[k].label;
  label.style.opacity = swapAlpha(t, tIn, tOut);
  label.style.transform = `translateY(${(1 - spring(t - tIn, 'heavy')) * 24 * S}px)`;
  label.style.color = k === 1 ? T.ink : T.onAccent;

  // Cursor presses just before each morph (a click lands on the beat).
  const cx = track(t, STATES.map((s, i) => ({ t: s.t - 0.3, v: W / 2 + (i % 2 ? 0.28 : -0.22) * W, spring: 'default' })));
  const cy = track(t, STATES.map((s, i) => ({ t: s.t - 0.3, v: H / 2 + 0.2 * H + (i % 2) * 0.05 * H, spring: 'default' })));
  const press = STATES.reduce((m, s) => Math.max(m, spring(t - (s.t - 0.06), 'snappy') * (1 - spring(t - (s.t + 0.08), 'snappy'))), 0);
  cursor.style.transform = `translate(${cx}px, ${cy}px) scale(${1 - 0.25 * press})`;
};
