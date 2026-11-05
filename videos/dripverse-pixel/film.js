// DRIP VERSE in the "Pixel Wipe" style (videos/reference/pixel-wipe-template.md): 80 beats at 120.07 BPM (40 s), 16:9.
// Cream paper taken over by colour: gold (the one accent), ink chapter cards, a warm brass gradient behind giant words. Scene swaps ride
// pixel-block wipes and cards that grow to full frame; one camera with a sway that returns to centre runs under everything.
// The brass drop is the mascot (it bounces and squashes; no invented face). Real shoe photos and cutouts only. Pure function of t.
const { spring, track, clamp, lerp, mulberry32 } = Motion;
const W = 1920, H = 1080, BEAT = 0.4997275, b = n => n * BEAT, END = b(80);
const CREAM = '#F3EFE8', GOLD = '#C9A15C', GOLDD = '#A57E3E', INK = '#16130E', CHAMP = '#F1E4CB';
const GRAD = 'linear-gradient(135deg,#E2C48A 0%,#B8904F 55%,#8E6A31 100%)';
const WARM = 'radial-gradient(120% 120% at 30% 25%,#F6E7C6 0%,#D9B477 38%,#A57E3E 75%,#6E4F22 100%)';
const GEIST = "'Geist', system-ui, sans-serif", BOD = "'Bodoni', 'Times New Roman', serif";
const S = (t, t0, p = 'default') => spring(t - t0, p);
const SLOW = { k: 4, c: 4 }, SOFT = { k: 120, c: 20 };
const STAGE = document.getElementById('stage');

// ---------- TIMELINE (beats) ----------
const B = { card: 6, frame: 8, list: 8.25, roll: [9.2, 10, 10.8], any: 12.2, mascot: 15, word: 16, chip: 17,
  wipe1: 20, type0: 21.5, type1: 24.5, attach: 25, curIn: 25.6, click: 27, ink: 28, ch1: 28.6, ch2: 32,
  wipe2: 36, fresh: 36.6, wipe3: 40, luxe: 40.6, wipe4: 44, every: 44.6, chips: 45.5,
  wipe5: 50, words: [51, 52.5, 54, 55.5, 57, 59.5, 61], ring: 57.8, wipe6: 62.5, dm: [63.4, 64.4, 65.4, 66.4], zoom: 68.5,
  end: 70, logo: 71, pill: 72.5, pow: 73.2, click2: 76 };
const T = Object.fromEntries(Object.entries(B).map(([k, v]) => [k, Array.isArray(v) ? v.map(b) : b(v)]));
window.TIMELINE = { BEAT, beats: B, seconds: T };

const css = document.createElement('style');
css.textContent = `@font-face{font-family:'Bodoni';src:url(assets/fonts/bodoni-normal.woff2) format('woff2');font-weight:400 900;font-style:normal}
@font-face{font-family:'Bodoni';src:url(assets/fonts/bodoni-italic.woff2) format('woff2');font-weight:400 900;font-style:italic}
@font-face{font-family:'Geist';src:url(assets/fonts/geist.woff2) format('woff2');font-weight:100 900}
#stage *{position:absolute;box-sizing:border-box;margin:0;padding:0}
#stage .fx{display:flex;justify-content:center;align-items:center}
#stage .fx *{position:relative;display:block}`;
document.head.appendChild(css);
const CUTS = ['adidas-niteball', 'axel-arigato', 'nb-550', 'nb-480', 'nike-af1', 'nike-zoom'];
const PHOTOS = ['jordan-4', 'asics-kayano', 'nb-550', 'nike-af1', 'axel-arigato', 'adidas-niteball', 'nike-zoom', 'balenciaga-runner', 'nb-480'];
const ld = s => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = s; });
window.__preload = [document.fonts.load("500 100px 'Bodoni'"), document.fonts.load("italic 500 100px 'Bodoni'"), document.fonts.load("600 40px 'Geist'"), document.fonts.load("400 40px 'Geist'"),
  ...CUTS.map(n => ld(`assets/cut/${n}_c.png`)), ...PHOTOS.map(n => ld(`assets/photos/${n}.jpg`))];

// ---------- helpers ----------
const PXK = new Set(['left', 'top', 'width', 'height', 'borderRadius']);
function mk(parent, o = {}, html) {
  const e = document.createElement('div'); e.style.left = '0px'; e.style.top = '0px';
  for (const k in o) e.style[k] = (PXK.has(k) && typeof o[k] === 'number') ? o[k] + 'px' : o[k];
  if (html != null) e.innerHTML = html; parent.appendChild(e); return e;
}
const put = (e, o) => { e.style.transform = `translate(${o.x || 0}px,${o.y || 0}px) rotate(${o.rot || 0}deg) scale(${o.sx ?? o.s ?? 1},${o.sy ?? o.s ?? 1})`; };
// '' (inherit), never 'visible': a child forced visible shows through its hidden scene
const vis = (e, on) => { e.style.visibility = on ? '' : 'hidden'; return on; };
const bump = (t, t0, hold = .5) => clamp(S(t, t0, 'snappy') - S(t, t0 + hold, SOFT));
const rimConic = a => `conic-gradient(from ${a}deg,rgba(226,182,98,0) 0deg,rgba(226,182,98,0) 200deg,#D9B26A 280deg,#FFF1D2 305deg,#D9B26A 330deg,rgba(226,182,98,0) 360deg)`;
const cut = (n, w) => { const img = new Image(); img.src = `assets/cut/${n}_c.png`; return `<img src="assets/cut/${n}_c.png" style="left:${-w / 2}px;top:${-w * .32}px;width:${w}px;filter:drop-shadow(0 30px 30px rgba(40,28,10,.28))">`; };
const DROP = (s, id) => `<svg width="${60 * s}" height="${86 * s}" viewBox="0 0 60 86" style="left:${-30 * s}px;top:${-48 * s}px;overflow:visible"><defs><linearGradient id="dg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0DCAE"/><stop offset=".45" stop-color="#C79C55"/><stop offset="1" stop-color="#7E5A26"/></linearGradient></defs><path d="M30 2 C 24 26 6 42 6 60 a24 24 0 0 0 48 0 C 54 42 36 26 30 2z" fill="url(#dg${id})"/><ellipse cx="20" cy="58" rx="6" ry="12" fill="#fff" opacity=".55" transform="rotate(16 20 58)"/></svg>`;

// ---------- layers: background colour, the world under one camera, the pixel wipe on top ----------
const BG = mk(STAGE, { width: W, height: H, background: CREAM });
const WORLD = mk(STAGE, { width: W, height: H, transformOrigin: '0 0' });
const WIPE = mk(STAGE, { width: W, height: H });
// background per time window (switched only while a wipe or a growing card covers the frame)
const BGS = [[0, CREAM], [T.frame - .05, GOLD], [T.wipe1 + .5, CREAM], [T.ink, INK], [T.wipe2 + .5, WARM], [T.wipe4 + .5, CREAM],
  [T.wipe5 + .5, 'linear-gradient(180deg,#FBF4E6 0%,#F1E2C4 60%,#E2C48A 100%)'], [T.wipe6 + .5, INK], [T.end, 'linear-gradient(180deg,#FFFDF8 0%,#F5EAD3 55%,#D9B477 100%)']];
const bgAt = t => { let c = CREAM; for (const [t0, v] of BGS) if (t >= t0) c = v; return c; };

// ---------- camera: one take; slow pushes per scene plus a sway that always returns to centre ----------
const CAMK = [{ t: 0, v: 1.06 }, { t: 0, v: 1, s: SLOW }, ...[T.frame, T.wipe1, T.ink, T.wipe2, T.wipe3, T.wipe4, T.wipe5, T.wipe6, T.end].flatMap((t0, i) => [{ t: t0, v: 1, s: 'default' }, { t: t0 + .3, v: i % 2 ? .97 : 1.05, s: SLOW }]),
  { t: T.click - .6, v: 1.25, s: 'heavy' }, { t: T.ink, v: 1 }, { t: T.pill + .8, v: 1.09, s: SLOW }];
const camZ = t => track(t, CAMK.map(k => ({ t: k.t, v: k.v, spring: k.s || 'default' })));
function camera(t) {
  const a = 1 - .3 * S(t, T.pill, 'heavy'), sx = a * 12 * Math.sin(t * 2 * Math.PI / 6.4), sy = a * 7 * Math.sin(t * 2 * Math.PI / 4.7 + 1);
  const z = camZ(t) * (1 + .01 * Math.sin(t * 2 * Math.PI / 9)), fx = t > T.click - 1 && t < T.ink + .3 ? CLICKP : [960, 540];
  const k = S(t, T.click - .6, 'heavy') * (1 - S(t, T.ink, 'default'));
  const ox = lerp(960, fx[0], k), oy = lerp(540, fx[1], k);
  WORLD.style.transform = `translate(${960 + sx}px,${540 + sy}px) scale(${z}) translate(${-ox}px,${-oy}px)`;
}

// ---------- scenes: containers that are visible only inside their window ----------
const SC = [];
const scene = (t0, t1) => { const el = mk(WORLD, { width: W, height: H }); SC.push({ el, t0, t1 }); return el; };
function Line(parent, o) {   // centred flex line of masked words; o.words: strings, or {t, color, italic} objects
  const box = mk(parent, { left: 0, top: o.y, width: W, height: o.h }); box.className = 'fx'; box.style.gap = (o.gap ?? 28) + 'px';
  const ws = o.words.map(wd => { const w = typeof wd === 'string' ? { t: wd } : wd; const m = mk(box, { height: o.h, overflow: 'hidden', padding: '0 10px' });
    const inn = mk(m, { font: (w.italic ? 'italic ' : '') + o.font, color: w.color || o.color || INK, letterSpacing: o.ls || '-.02em', paddingLeft: o.ls && o.ls[0] !== '-' ? o.ls : '0', whiteSpace: 'nowrap', lineHeight: o.h + 'px' }, w.t);
    [m, inn].forEach(e => { e.style.left = ''; e.style.top = ''; }); return { m, inn }; });
  return { box, ws, upd: (t, tIn, tOut = 999, p = 'heavy') => { vis(box, t > tIn - .05 && t < tOut + .6);
    ws.forEach((w, i) => { const u = S(t, tIn + i * .06, p), v = S(t, tOut + i * .04, 'snappy'); w.inn.style.transform = `translateY(${((1 - u) - v) * o.h * 1.1}px)`; }); } };
}

// S1 0-4 s: collage of real photos and cutout tiles sliding diagonally at three depths; one gold tile wins the centre
const S1 = scene(0, T.frame + .05);
const R = mulberry32(5);
const TILES = Array.from({ length: 13 }, (_, i) => { const depth = [1, .75, .55][i % 3], w = (i % 4 === 0 ? 300 : 230) * depth * 1.25;
  const isCut = i % 3 === 1, n = isCut ? CUTS[i % CUTS.length] : PHOTOS[i % PHOTOS.length];
  const el = mk(S1, { width: w, height: w * 1.22, borderRadius: 22, overflow: 'hidden', background: isCut ? (i % 2 ? CHAMP : '#fff') : '#ddd', boxShadow: '0 20px 50px rgba(40,28,10,.16)' },
    isCut ? `<div style="left:${w / 2}px;top:${w * .62}px">${cut(n, w * .92)}</div>` : `<img src="assets/photos/${n}.jpg" style="left:0;top:0;width:${w}px;height:${w * 1.22}px;object-fit:cover">`);
  return { el, w, h: w * 1.22, depth, x0: -300 + (i * 173) % 2300, y0: 80 + ((i * 397) % 980), rot: (R() - .5) * 10 }; });
const HERO = mk(S1, { width: 300, height: 360, borderRadius: 26, overflow: 'hidden', background: GOLD, boxShadow: '0 30px 60px rgba(120,90,40,.3)' }, `<div style="left:150px;top:220px">${cut('nike-af1', 280)}</div>`);
// S2 4-10 s: the gold frame; a rolling list, then "Any pair, delivered."
const S2 = scene(T.frame, T.wipe1 + .5);
const LIST = ['Runners', 'Court classics', 'Any pair', 'Lifestyle', 'Limited drops'];
const LROWS = LIST.map((s, i) => { const r = mk(S2, { left: 0, top: 0, width: W, height: 150 }); r.className = 'fx';
  const tx = mk(r, { font: `500 120px/150px ${BOD}`, color: INK, letterSpacing: '-.02em', whiteSpace: 'nowrap', transformOrigin: '50% 50%' }, s); tx.style.left = ''; tx.style.top = ''; return { r, tx }; });
const ANY = Line(S2, { y: 470, h: 150, font: `500 130px/150px ${BOD}`, words: ['Any', 'pair,', { t: 'delivered.', italic: true, color: '#FFF8EA' }] });
// S3 7.5-10 s: the mascot drop, the wordmark, a chip
const MASCOT = mk(S2, { width: 0, height: 0 }, DROP(3.2, 1));
const WM = Line(S2, { y: 640, h: 90, font: `600 64px/90px ${GEIST}`, words: ['DRIP VERSE'], ls: '.3em' });
const CHIP = mk(S2, { left: 960 - 170, top: 760, width: 340, height: 64, borderRadius: 32, background: INK, color: '#F8EBD0', font: `500 26px/64px ${GEIST}`, textAlign: 'center', letterSpacing: '.04em', transformOrigin: '50% 50%' }, 'Luxury footwear');
// S4 10-14 s: the DM demo (a stand-in message box, not a copy of any app)
const S4 = scene(T.wipe1 + .5, T.ink);
const BOX = mk(S4, { left: 960 - 560, top: 390, width: 1120, height: 300, borderRadius: 44, background: '#FFFDF8', boxShadow: '0 30px 80px rgba(40,28,10,.14), inset 0 0 0 2px #EADFCB' });
mk(BOX, { left: 48, top: 44, width: 40, height: 40, font: `300 44px/40px ${GEIST}`, color: '#9A8F80' }, '+');
const MSG = 'Is the Niteball in size 42?';
const TYPED = mk(BOX, { left: 110, top: 36, width: 900, height: 70, font: `500 54px/70px ${GEIST}`, color: INK, whiteSpace: 'nowrap' });
const ATT = mk(BOX, { left: 110, top: 128, width: 120, height: 140, borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 24px rgba(40,28,10,.2)', transformOrigin: '50% 100%' }, `<img src="assets/photos/adidas-niteball.jpg" style="left:0;top:0;width:120px;height:140px;object-fit:cover">`);
const SEND = mk(BOX, { left: 1120 - 130, top: 300 - 130, width: 90, height: 90, borderRadius: 45, background: INK, transformOrigin: '50% 50%' }, `<svg width="90" height="90" viewBox="0 0 90 90" style="left:0;top:0"><path d="M45 62 V30 M32 42 L45 29 L58 42" fill="none" stroke="#F8EBD0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
const CLICKP = [960 - 560 + 1120 - 85, 390 + 300 - 85];
const CUR = mk(S4, { width: 44, height: 62 }, `<svg width="44" height="62" viewBox="0 0 28 40" style="left:0;top:0;overflow:visible"><path d="M3 2 L3 30 L10 24 L15 36 L20 34 L15 22 L24 22 Z" fill="${INK}" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>`);
// the send button grows into the ink frame (card to frame)
const GROW = mk(WORLD, { background: INK });
// S5 14-18 s: chapter cards on ink
const S5 = scene(T.ink, T.wipe2 + .5);
function chapter(lines, num) { const g = mk(S5, { width: W, height: H });
  const l1 = Line(g, { y: 330, h: 170, font: `500 150px/170px ${BOD}`, words: [lines[0]], color: '#FFF8EA' });
  const l2 = Line(g, { y: 500, h: 170, font: `italic 500 150px/170px ${BOD}`, words: [lines[1]], color: GOLD });
  const n = mk(g, { left: 1640, top: 880, width: 200, height: 110, font: `500 96px/110px ${GEIST}`, color: '#FFF8EA', textAlign: 'right' }, num);
  const ar = mk(g, { left: 1680, top: 470, width: 120, height: 80 }, `<svg width="120" height="80" viewBox="0 0 120 80" style="left:0;top:0"><path d="M10 40 H100 M74 14 L102 40 L74 66" fill="none" stroke="${GOLD}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
  const ul = mk(g, { left: 560, top: 690, width: 800, height: 6, background: GOLD, transformOrigin: '0 50%' });
  mk(g, { left: 1440, top: 60, width: 420, height: 30, font: `500 20px/30px ${GEIST}`, color: '#9C8F78', textAlign: 'right', letterSpacing: '.06em' }, 'DRIP VERSE &nbsp;/&nbsp; Send us a DM');
  return { g, l1, l2, n, ar, ul }; }
const CH = [chapter(['Any pair,', 'at your door.'], '01'), chapter(['Paid. Packed.', 'Delivered.'], '02')];
const PANEL = mk(S5, { left: 0, top: 0, width: W, height: H, background: '#1E1A14' });   // the 02 card slides in over 01
S5.appendChild(CH[1].g);
// S6 18-22 s: giant word behind a real cutout, twice, on the warm gradient
const S6 = scene(T.wipe2 + .5, T.wipe4 + .5);
function giant(word, n, tag) { const g = mk(S6, { width: W, height: H });
  const w = mk(g, { left: 0, top: 250, width: W, height: 560, font: `600 520px/560px ${BOD}`, letterSpacing: '-.04em', textAlign: 'center', color: 'transparent',
    backgroundImage: 'linear-gradient(180deg,rgba(255,250,238,.95),rgba(255,240,210,.55))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }, word);
  const sh = mk(g, { width: 0, height: 0 }, cut(n, 820)); const tg = mk(g, { left: 1240, top: 300, height: 48, padding: '0 20px', borderRadius: 24, background: 'rgba(22,19,14,.82)', color: '#F8EBD0', font: `500 22px/48px ${GEIST}`, letterSpacing: '.14em', whiteSpace: 'nowrap', transformOrigin: '0 50%' }, tag);
  return { g, w, sh, tg }; }
const GI = [giant('Fresh', 'adidas-niteball', 'ADIDAS NITEBALL'), giant('Luxe', 'axel-arigato', 'AXEL ARIGATO')];
// S7 22-25 s: "every [size] counts" with a cycling chip and chips flying round
const S7 = scene(T.wipe4 + .5, T.wipe5 + .5);
const EV = Line(S7, { y: 470, h: 140, font: `500 120px/140px ${BOD}`, words: ['Every', ' '.repeat(8), 'size.'], gap: 34 });
const SLOT = mk(S7, { left: 960 - 105, top: 480, width: 210, height: 120, borderRadius: 60, background: GRAD, boxShadow: '0 20px 40px rgba(120,90,40,.28)', overflow: 'hidden', transformOrigin: '50% 50%' });
const SLOTN = [40, 41, 42, 43, 44].map((n, i) => mk(SLOT, { left: 0, top: 0, width: 210, height: 120, font: `600 64px/120px ${GEIST}`, color: '#FFF9EE', textAlign: 'center' }, String(n)));
const FLY = ['In stock', 'Ready to ship', 'EU 40-44', 'Original box', 'Authentic'].map((s, i) => ({ s, el: mk(S7, { height: 60, padding: '0 26px', borderRadius: 30, background: '#FFFDF8', boxShadow: '0 14px 30px rgba(40,28,10,.14)', color: INK, font: `500 34px/60px ${GEIST}`, whiteSpace: 'nowrap', transformOrigin: '50% 50%' }, s),
  to: [[520, 300], [1400, 330], [560, 760], [1360, 760], [960, 230]][i] }));
// S8 25-31 s: kinetic words, one at a time; the "o" of "one" grows into a ring and folds back into the drop
const S8 = scene(T.wipe5 + .5, T.wipe6 + .5);
const WORDS = ['your', 'next', 'pair', 'is', 'one', 'DM', 'away.'];
const KW = WORDS.map((w, i) => mk(S8, { left: 0, top: 330, width: W, height: 420, font: `italic 600 ${w.length > 4 ? 300 : 360}px/420px ${BOD}`, color: i === 5 ? GOLDD : '#B48A47', textAlign: 'center', letterSpacing: '-.03em', transformOrigin: '50% 60%' }, w));
const RING = mk(S8, { left: 960 - 600, top: 540 - 600, width: 1200, height: 1200, borderRadius: '50%', border: `120px solid ${GOLD}`, transformOrigin: '50% 50%' });
// S9 31-35 s: "Send us a DM" typed a word at a time on ink
const S9 = scene(T.wipe6 + .5, T.end);
const DMW = ['Send', 'us', 'a', 'DM'].map((w, i) => mk(S9, { font: `500 170px/190px ${GEIST}`, color: i === 3 ? GOLD : '#FFF8EA', whiteSpace: 'nowrap' }, w));
const BIG = mk(WORLD, { width: 0, height: 0 }, DROP(14, 9));
// S10 35-40 s: the end card
const S10 = scene(T.end, END + 1);
const LOGO = Line(S10, { y: 560, h: 110, font: `600 84px/110px ${GEIST}`, words: ['DRIP VERSE'], ls: '.3em' });
const PILL = mk(S10, { left: 960 - 230, top: 720, width: 460, height: 104, transformOrigin: '50% 50%' },
  `<div class="rg" style="left:-10px;top:-10px;width:480px;height:124px;border-radius:62px;filter:blur(14px)"></div><div class="rm" style="left:-3px;top:-3px;width:466px;height:110px;border-radius:55px"></div><div style="left:0;top:0;width:460px;height:104px;border-radius:52px;background:${GRAD};box-shadow:0 24px 50px rgba(120,90,40,.3)"></div><div class="fx" style="left:0;top:0;width:460px;height:104px"><div style="font:600 36px/1 ${GEIST};color:#FFF9EE">Send us a DM</div></div>`);
const PRG = PILL.querySelector('.rg'), PRM = PILL.querySelector('.rm');
const POW = Line(S10, { y: 870, h: 40, font: `500 22px/40px ${GEIST}`, words: ['POWERED BY CLIMAX STORE'], ls: '.24em', color: '#8C7A5C' });
const ENDM = mk(S10, { width: 0, height: 0 }, DROP(3, 2));

// ---------- the pixel wipe ----------
const COLS = 16, ROWS = 9, CW = W / COLS, RH = H / ROWS, RB = mulberry32(17);
const BLOCKS = Array.from({ length: COLS * ROWS }, (_, i) => { const c = i % COLS, r = Math.floor(i / COLS);
  return { el: mk(WIPE, { left: c * CW, top: r * RH, width: CW + 1, height: RH + 1, transformOrigin: '50% 50%' }), c, r, n: RB(), m: RB() }; });
const WIPES = [[T.wipe1, [CREAM, '#FFFFFF', CHAMP]], [T.wipe2, ['#C9A15C', '#A57E3E', '#E2C48A']], [T.wipe3, ['#B8904F', '#E2C48A', '#8E6A31']],
  [T.wipe4, [CREAM, CHAMP, '#E2C48A']], [T.wipe5, ['#F7EBD3', '#E2C48A', '#FFFFFF']], [T.wipe6, [INK, '#2A241B', GOLD]]];
function wipe(t) { let w = null; for (const x of WIPES) if (t >= x[0] - .02 && t < x[0] + 1.25) w = x;
  if (!vis(WIPE, !!w)) return; const [t0, pal] = w;
  BLOCKS.forEach(k => { const d = ((k.c + k.r * .7) / (COLS + ROWS * .7)) * .28 + k.n * .1, d2 = ((COLS - k.c + k.r * .7) / (COLS + ROWS * .7)) * .28 + k.m * .12;
    const s = clamp(S(t, t0 + d * .8, 'snappy')) * (1 - clamp(S(t, t0 + .62 + d2, 'snappy')));
    const q = Math.round(s * 4) / 4;   // stepped, the way the reference does it: blocks snap in quarter sizes, never fade
    vis(k.el, q > 0); put(k.el, { s: q }); k.el.style.background = pal[k.m < .62 ? 0 : k.m < .85 ? 1 : 2]; }); }

window.seek = function (t) {
  camera(t); wipe(t);
  BG.style.background = bgAt(t);
  SC.forEach(s => vis(s.el, t >= s.t0 && t < s.t1));
  // S1 collage: everything drifts diagonally (deeper tiles slower); at the card beat the tiles sweep out and the gold tile takes the centre
  const out = S(t, T.card, 'default');
  TILES.forEach((k, i) => { const vx = 260 * k.depth, x = k.x0 - vx * t - out * (i % 2 ? 1400 : -1400) * k.depth, y = k.y0 - 90 * k.depth * t + out * (i % 3 - 1) * 500;
    k.el.style.transformOrigin = '50% 50%'; put(k.el, { x: x - k.w / 2, y: y - k.h / 2, rot: k.rot + 2 * Math.sin(t + i), s: k.depth }); k.el.style.filter = k.depth < .6 ? 'blur(3px)' : 'none'; });
  const hin = S(t, .1, 'default'), hc = S(t, T.card, 'heavy');
  const hx = lerp(1500, 960, hc) - 150, hy = lerp(lerp(1300, 700, hin), 540, hc) - 180, hs = lerp(.8, 1.2, hc);
  // card to frame: the gold tile grows to fill the frame on the frame beat
  const gf = S(t, T.frame - .45, 'default');
  HERO.style.transformOrigin = '50% 50%';
  if (vis(HERO, t < T.frame)) { const w = lerp(300 * hs, W + 40, gf), h = lerp(360 * hs, H + 40, gf); Object.assign(HERO.style, { left: lerp(hx + 150 - 150 * hs, -20, gf) + 'px', top: lerp(hy + 180 - 180 * hs, -20, gf) + 'px', width: w + 'px', height: h + 'px', borderRadius: lerp(26, 0, gf) + 'px' });
    HERO.firstChild.style.opacity = 1 - gf; HERO.firstChild.style.left = w / 2 + 'px'; HERO.firstChild.style.top = h * .6 + 'px'; }
  // S2 rolling list: the current line large and ink, the neighbours smaller and faded; the stack rolls to "Any pair"
  const roll = track(t, [{ t: 0, v: -1 }, { t: T.list, v: 0, spring: 'default' }, ...T.roll.map((r, i) => ({ t: r, v: i + 1, spring: 'snappy' }))]);
  const lo = S(t, T.list, 'heavy') * (1 - S(t, T.any, 'snappy'));
  LROWS.forEach((k, i) => { const d = i - roll; vis(k.r, lo > .01); put(k.r, { y: 465 + d * 150 + (1 - lo) * 80 });
    const f = clamp(1 - Math.abs(d)); k.r.style.opacity = lo * clamp(1 - Math.abs(d) * .45); k.tx.style.transform = `scale(${.62 + .38 * f})`; k.tx.style.color = f > .5 ? INK : '#5C4520'; });
  ANY.upd(t, T.any, T.mascot - .3);
  // the mascot: falls in, squashes on landing, keeps a little bounce
  const fall = S(t, T.mascot, 'playful'), land = S(t, T.mascot + .25, 'snappy') - S(t, T.mascot + .4, 'default');
  vis(MASCOT, t > T.mascot - .05); put(MASCOT, { x: 960, y: lerp(-300, 380, fall) - 10 * Math.abs(Math.sin((t - T.mascot) * 3.1)) * S(t, T.mascot + .8), sx: 1 + .14 * land, sy: 1 - .16 * land, rot: 6 * Math.sin(t * 2.2) });
  WM.upd(t, T.word); const cp = S(t, T.chip, 'snappy'); vis(CHIP, cp > .01); put(CHIP, { s: cp });
  // S4 the DM demo: the box rises, the message types, the photo drops in, the cursor sends
  const bx = S(t, T.wipe1 + .4, 'default'); put(BOX, { y: (1 - bx) * 160 });
  const n = Math.round(clamp((t - T.type0) / (T.type1 - T.type0)) * MSG.length); TYPED.innerHTML = MSG.slice(0, n) + (t < T.click && Math.floor(t * 2.4) % 2 ? '<span style="color:#C9A15C">|</span>' : '');
  const at = S(t, T.attach, 'playful'); vis(ATT, at > .01); put(ATT, { y: (1 - at) * -160, s: at });
  const pr = S(t, T.click, 'snappy') - S(t, T.click + .12, 'default'); put(SEND, { s: 1 - .1 * pr });
  const cu = S(t, T.curIn, 'default'); vis(CUR, cu > .01 && t < T.ink); put(CUR, { x: lerp(1700, CLICKP[0] + 12, cu), y: lerp(1000, CLICKP[1] + 14, cu), s: 1 - .15 * pr });
  // card to frame: the send button grows into the ink chapter
  const gi = S(t, T.click + .15, 'default'); vis(GROW, t > T.click + .1 && t < T.ink + .05);
  if (t > T.click + .1) { const r = lerp(45, 1300, gi); Object.assign(GROW.style, { left: (CLICKP[0] - r) + 'px', top: (CLICKP[1] - r) + 'px', width: 2 * r + 'px', height: 2 * r + 'px', borderRadius: '50%' }); }
  // S5 chapter cards: 01, then 02 slides in over it from the right
  const sl = S(t, T.ch2 - .2, 'default'); put(PANEL, { x: (1 - sl) * W }); put(CH[1].g, { x: (1 - sl) * W });
  CH.forEach((c, i) => { const t0 = i ? T.ch2 : T.ch1; c.l1.upd(t, t0); c.l2.upd(t, t0 + .15); const e = S(t, t0 + .4, 'snappy');
    put(c.n, { y: (1 - e) * 60 }); c.n.style.opacity = e; put(c.ar, { x: 10 * Math.sin(t * 4) * e, s: e }); c.ul.style.transform = `scaleX(${clamp(S(t, t0 + .7, { k: 30, c: 11 }))})`; });
  // S6 the giant words: each with a real shoe floating and turning over it, and its name on a tag
  GI.forEach((g, i) => { const t0 = i ? T.luxe : T.fresh, on = t >= (i ? T.wipe3 + .5 : 0) && t < (i ? 999 : T.wipe3 + .5); vis(g.g, on); if (!on) return;
    const e = S(t, t0, 'heavy'), f = S(t, t0 + .2, 'default'); put(g.w, { y: (1 - e) * 120, s: 1 + .03 * (t - t0) });
    put(g.sh, { x: 960 + 30 * Math.sin(t * .8), y: 620 + (1 - f) * 500 + 14 * Math.sin(t * 1.6), rot: -10 + 5 * Math.sin(t * .9), s: .9 + .1 * f });
    const tg = S(t, t0 + .6, 'snappy'); put(g.tg, { s: tg }); vis(g.tg, tg > .01); });
  // S7 every [size]: the chip cycles through sizes on the beat; chips fly in on arcs and settle round the sentence
  EV.upd(t, T.every); const so = S(t, T.every + .2, 'snappy'); put(SLOT, { s: so }); vis(SLOT, so > .01);
  const cyc = track(t, [{ t: 0, v: 0 }, ...[0, 1, 2, 3].map(i => ({ t: T.chips + i * BEAT * 1.5, v: i + 1, spring: 'snappy' }))]);
  SLOTN.forEach((e, i) => put(e, { y: (i - cyc) * 120 }));
  FLY.forEach((f, i) => { const e = S(t, T.chips + .15 * i, 'default'); vis(f.el, e > .01); const [tx, ty] = f.to;
    f.el.style.left = '0px'; put(f.el, { x: lerp(960 + (i % 2 ? 900 : -900), tx, e) - 110, y: lerp(540, ty, e) - 30 - 120 * Math.sin(Math.PI * e) + 6 * Math.sin(t * 1.7 + i), s: e, rot: (1 - e) * (i % 2 ? 20 : -20) }); });
  // S8 kinetic words: each lands tilted with a bounce, then leaves; the ring opens out of "one" and folds into the drop
  KW.forEach((k, i) => { const t0 = T.words[i], t1 = i < 6 ? T.words[i + 1] - .1 : T.wipe6 - .1, e = S(t, t0, 'playful'), o = S(t, t1, 'snappy');
    vis(k, t > t0 - .05 && o < .99); const tilt = [-8, 6, -5, 7, -4, 0, 5][i];
    put(k, { x: (i % 2 ? 1 : -1) * 60 * (1 - e) + (i % 2 ? -1 : 1) * 30 * Math.sin((t - t0) * 1.2), y: (1 - e) * 260 - o * 300, rot: tilt * e, s: (.7 + .3 * e) * (1 - .3 * o) }); });
  const rg = S(t, T.ring, 'heavy') - S(t, T.words[5] - .2, 'default'); vis(RING, rg > .01); put(RING, { s: clamp(rg, 0, 1.2) * 1.1, rot: 30 * t });
  // S9 Send us a DM, a word at a time, centred as a group; then the mascot fills the frame and carries us to the end card
  let x = 0; const ws = DMW.map(e => { const w = e.offsetWidth; return w; }); const total = ws.reduce((a, c) => a + c, 0) + 3 * 40; x = 960 - total / 2;
  DMW.forEach((e, i) => { const t0 = T.dm[i], u = S(t, t0, 'snappy'); vis(e, u > .01); put(e, { x: x, y: 445 + (1 - u) * 40 }); e.style.opacity = u; x += ws[i] + 40; });
  const z = S(t, T.zoom, 'default'); vis(BIG, t > T.zoom - .05 && t < T.end + .1); put(BIG, { x: 960, y: lerp(1500, 600, z), s: lerp(.4, 1.6, z) });
  // S10 end card: the drop bounces in, squashes, lands above the wordmark; the pill with a travelling rim light; powered by
  const ef = S(t, T.end, 'playful'), el = S(t, T.end + .3, 'snappy') - S(t, T.end + .45, 'default');
  put(ENDM, { x: 960, y: lerp(-200, 430, ef) - 8 * Math.abs(Math.sin((t - T.end) * 2.6)) * S(t, T.end + 1), sx: 1 + .12 * el, sy: 1 - .14 * el, rot: 4 * Math.sin(t * 1.8) });
  LOGO.upd(t, T.logo); POW.upd(t, T.pow, 999, 'default');
  const pe = S(t, T.pill, 'snappy'); vis(PILL, pe > .01); put(PILL, { s: pe * (1 - .05 * (S(t, T.click2, 'snappy') - S(t, T.click2 + .12, 'default'))) });
  const ri = Math.max(bump(t, T.pill + .3, .7), bump(t, T.click2, .7)) * .9 + .1 * pe; PRG.style.background = PRM.style.background = rimConic(160 * t); PRG.style.opacity = PRM.style.opacity = ri;
};
