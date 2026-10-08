// DRIP VERSE, Musixquare-style launch film. 32 s, 16:9, 120 BPM (beat = 0.5 s), drop at 8.0 s. One continuous take except the
// two on-foot photo cuts at 28 and 29 s. Every frame is a pure function of t. Grammar: kinetic type, one brass pill that becomes
// the rings, the wordmark and the phone, cursor-driven UI, shoes orbiting the drop mark, call to action "Send us a DM".
const { spring, track, swapAlpha, clamp, lerp, mulberry32 } = Motion;
const W = 1920, H = 1080;
const INK = '#121214', BONE = '#F4F1EB', STONE = '#E6E1D8', BRASS = '#B08A4E', GRAD = 'linear-gradient(90deg,#9A733A,#C8A766)';
const STAGE = document.getElementById('stage');
const sp = (t, t0, p = 'default') => spring(t - t0, p);

// ---------- timeline: every beat, move and cue lives here ----------
const T = {
  arrow: 0.7, flip1: 1.3, flip2: 1.9, tick1: 2.75, tick2: 3.5, out1: 4.0, all: 4.3, pill: 4.75, curIn: 6.3, click: 7.5,
  drop: 8.0, collapse: 8.75, toCircle: 9.1, toMark: 9.3, word: 9.45, wordOut: 10.3, phone: 10.45, pick: 11.0,
  cur2: 11.9, chip: 12.6, toAdd: 13.0, add: 13.5, check: 13.8, phoneOut: 14.3, ordered: 14.6, code: 15.6, field: 15.7, land: 16.4,
  out6: 17.9, dots: 17.5, mark2: 18.35, orbit: 18.45, zoom: 21.0, dtime: 21.6, flyOut: 24.6, tracker: 24.6, n1: 25.3, n2: 26.0, n3: 27.0,
  cut1: 27.995, cut2: 28.995, end: 29.995, cta: 30.7, pow: 31.0, cur3: 31.0, ctaClick: 31.5 };
window.TIMELINE = T;

const css = document.createElement('style');
css.textContent = `
@font-face{font-family:'Bodoni';src:url(assets/fonts/bodoni-normal.woff2) format('woff2');font-weight:400 600;font-style:normal}
@font-face{font-family:'Bodoni';src:url(assets/fonts/bodoni-italic.woff2) format('woff2');font-weight:400 600;font-style:italic}
@font-face{font-family:'Geist';src:url(assets/fonts/geist.woff2) format('woff2');font-weight:100 900}
#stage *{position:absolute;box-sizing:border-box;margin:0;padding:0}
#stage .t,#stage i{position:static;display:inline-block}`;
document.head.appendChild(css);
const SHOES = { 'adidas-niteball': [579, 365], 'axel-arigato': [688, 394], 'nb-550': [390, 304], 'nb-480': [577, 470], 'nike-af1': [707, 607], 'nike-zoom': [405, 307] };
const PHOTOS = { 'jordan-4': [640, 635], 'asics-kayano': [736, 1308] };
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = src; });
window.__preload = [document.fonts.load("400 100px 'Bodoni'"), document.fonts.load("italic 400 100px 'Bodoni'"), document.fonts.load("600 30px 'Geist'"), document.fonts.load("400 30px 'Geist'"),
  ...Object.keys(SHOES).map(n => loadImg(`assets/cut/${n}_c.png`)), ...Object.keys(PHOTOS).map(n => loadImg(`assets/photos/${n}.jpg`))];

// ---------- helpers ----------
const PXK = new Set(['left', 'top', 'width', 'height', 'borderRadius']);
function mk(parent, o = {}, html) {
  const e = document.createElement('div'); e.style.left = '0px'; e.style.top = '0px';
  for (const k in o) e.style[k] = (PXK.has(k) && typeof o[k] === 'number') ? o[k] + 'px' : o[k];
  if (html != null) e.innerHTML = html;
  parent.appendChild(e); return e;
}
const put = (e, o) => { e.style.transform = `translate(${o.x || 0}px,${o.y || 0}px) rotate(${o.rot || 0}deg) scale(${o.sx ?? o.s ?? 1},${o.sy ?? o.s ?? 1})`; };
const show = (e, on) => { e.style.display = on ? 'block' : 'none'; return on; };
const box = (e, cx, cy, w, h, r) => Object.assign(e.style, { left: cx - w / 2 + 'px', top: cy - h / 2 + 'px', width: w + 'px', height: h + 'px', borderRadius: (r ?? Math.min(w, h) / 2) + 'px' });
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixc = (a, b, u) => 'rgb(' + hex(a).map((x, i) => Math.round(x + (hex(b)[i] - x) * clamp(u))).join(',') + ')';
const GEIST = "'Geist', system-ui, sans-serif", BODONI = "'Bodoni', 'Times New Roman', serif";
// text that rises in through a mask and leaves upward through it (never a fade)
function Rise(parent, o) {
  const bx = mk(parent, { left: o.x, top: o.y, width: o.w, height: o.h, overflow: 'hidden' });
  const inner = mk(bx, { width: o.w, height: o.h, font: o.font, color: o.color || INK, letterSpacing: o.ls || '0', whiteSpace: 'nowrap', textAlign: o.al || 'left' }, o.html);
  const fn = (t, tin, tout = 99, p = o.sp || 'heavy') => {
    const y = (1 - sp(t, tin, p)) * o.h * 1.15 - sp(t, tout, 'snappy') * o.h * 1.15;
    inner.style.transform = `translateY(${y}px)`; bx.style.visibility = (t < tin - 0.02 || sp(t, tout, 'snappy') > 0.995) ? 'hidden' : 'visible';
  };
  fn.box = bx; fn.inner = inner; return fn;
}
function Shoe(parent, name, w) {
  const [iw, ih] = SHOES[name], hh = w * ih / iw;
  const e = mk(parent, { left: -w / 2, top: -hh / 2, width: w, height: hh });
  e.innerHTML = `<img src="assets/cut/${name}_c.png" style="left:0;top:0;width:${w}px;height:${hh}px;filter:drop-shadow(0 22px 26px rgba(40,32,20,.22))">`;
  return e;
}
const dropPath = col => `<path d="M14 1 C 11 12 2 20 2 28 a12 12 0 0 0 24 0 C 26 20 17 12 14 1z" fill="${col}"/>`;
const dropSvg = (s, col = INK) => `<svg width="${28 * s}" height="${40 * s}" viewBox="0 0 28 40" style="left:0;top:0">${dropPath(col)}</svg>`;
function Ring(parent, col = BRASS) { return mk(parent, { borderRadius: 9999, border: `2.5px solid ${col}`, display: 'none' }); }
function ringAt(el, t, ts, cx, cy, r0, r1, ratio, a0) {
  const p = sp(t, ts, { k: 14, c: 8.5 }); if (!show(el, t >= ts && p < 0.985)) return;
  const rx = r0 + (r1 - r0) * p, ry = rx * ratio;
  Object.assign(el.style, { left: cx - rx + 'px', top: cy - ry + 'px', width: rx * 2 + 'px', height: ry * 2 + 'px', opacity: a0 * Math.pow(1 - p, 1.15) });
}
const bob = (t, ph, amp = 7, per = 2.4) => amp * Math.sin(2 * Math.PI * t / per + ph);

// ---------- the world (one container; DOM order = stacking) ----------
STAGE.style.background = BONE;
const WORLD = mk(STAGE, { width: W, height: H, overflow: 'hidden', background: BONE });
const BG2 = mk(WORLD, { background: STONE, display: 'none' });              // the stone space behind the drop (zoom)

// S1-S2: "Find your", arrow, ticker, card -------------------------------------------------------------------------------------
const findRow = mk(WORLD, { left: 150, top: 370, width: 760, height: 230, overflow: 'hidden' });
const findIn = mk(findRow, { width: 760, height: 230, font: `400 170px/1.15 ${BODONI}`, color: INK, letterSpacing: '-5px', whiteSpace: 'nowrap' });
const findWords = ['Find', 'your'].map((w, i) => { const s = document.createElement('span'); s.className = 't'; s.textContent = w; s.style.marginRight = i ? '0' : '36px'; findIn.appendChild(s); return s; });
const arrow = mk(WORLD, { width: 120, height: 60 }, `<svg width="120" height="60" viewBox="0 0 120 60" style="left:0;top:0"><path d="M6 30 H104 M80 8 L106 30 L80 52" fill="none" stroke="${BRASS}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
const TICK = ['Runners', 'Classics', 'Courts'], TSHOE = ['nike-zoom', 'nb-550', 'axel-arigato'];
const tickCol = mk(WORLD, { left: 900, top: 150, width: 560, height: 700, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(transparent,#000 28%,#000 72%,transparent)', maskImage: 'linear-gradient(transparent,#000 28%,#000 72%,transparent)' });
const tickWords = TICK.map(w => mk(tickCol, { left: 0, top: 0, width: 560, height: 150, font: `italic 400 130px/150px ${BODONI}`, whiteSpace: 'nowrap' }, w));
const card = mk(WORLD, { left: 1480, top: 230, width: 380, height: 300, borderRadius: 34, background: STONE, overflow: 'hidden', boxShadow: '0 26px 60px rgba(40,32,20,.16)', transformOrigin: '50% 50%' });
const cardShoes = TSHOE.map(n => Shoe(card, n, n === 'axel-arigato' ? 360 : 300));
const chipNew = mk(WORLD, { left: 1500, top: 250, height: 40, width: 104, borderRadius: 20, background: '#fff', boxShadow: '0 6px 18px rgba(40,32,20,.14)', font: `600 20px/40px ${GEIST}`, color: INK, textAlign: 'center', transformOrigin: '50% 50%' }, `<span class="t" style="width:10px;height:10px;border-radius:5px;background:${BRASS};margin-right:10px;vertical-align:1px"></span>New`);

// S3-S4: headline, the free shoe, rings, the pill -------------------------------------------------------------------------------
const allIn = Rise(WORLD, { x: 700, y: 200, w: 900, h: 130, html: `All in one <i style="color:${BRASS}">place</i>`, font: `400 104px/130px ${BODONI}`, ls: '-3px' });
const shoeA = Shoe(WORLD, 'axel-arigato', 360);
const RINGS = [[1880, 1020, '#EFE6D6'], [1460, 780, '#E2CFAE'], [1080, 560, '#CDAE7B'], [740, 330, '#B78F52']].map(([w, h, c]) => ({ w, h, el: mk(WORLD, { background: c, boxShadow: '0 30px 80px rgba(120,90,40,.16)', display: 'none' }) }));
const pill = mk(WORLD, { background: GRAD, overflow: 'hidden', boxShadow: '0 24px 50px rgba(120,90,40,.28),inset 0 1px 0 rgba(255,255,255,.35)', display: 'none' });
const pillIcon = mk(pill, { width: 88, height: 88, borderRadius: 44, background: BONE }, `<div style="left:30px;top:24px;width:28px;height:40px">${dropSvg(1)}</div>`);
const pillT1 = mk(pill, { left: 116, top: 0, width: 420, height: 116, font: `600 34px/116px ${GEIST}`, color: '#FFF9EE', textAlign: 'center', whiteSpace: 'nowrap' }, 'Shop the drop');
const pillT2 = mk(pill, { left: 116, top: 0, width: 420, height: 116, font: `600 34px/116px ${GEIST}`, color: '#FFF9EE', textAlign: 'center', whiteSpace: 'nowrap' }, 'Dripping');
const word = Rise(WORLD, { x: 790, y: 470, w: 1000, h: 140, html: 'DRIP VERSE', font: `400 112px/140px ${BODONI}`, ls: '.04em' });

// S5: phone ---------------------------------------------------------------------------------------------------------------------
const PH = { cx: 1270, cy: 545, w: 420, h: 850, rot: -7 };
const phone = mk(WORLD, { display: 'none', boxShadow: '0 50px 100px rgba(40,32,20,.3)', transformOrigin: '50% 50%' });
const scr = mk(phone, { left: 14, top: 14, width: 392, height: 822, borderRadius: 54, background: '#FBF9F5', overflow: 'hidden', display: 'none' });
mk(scr, { left: 146, top: 16, width: 100, height: 30, borderRadius: 15, background: INK });
const sBrand = Rise(scr, { x: 26, y: 72, w: 300, h: 36, html: 'DRIP VERSE', font: `600 22px/36px ${GEIST}`, ls: '.24em', sp: 'snappy' });
const sCard = mk(scr, { left: 22, top: 130, width: 348, height: 300, borderRadius: 30, background: STONE, overflow: 'hidden', transformOrigin: '50% 50%' });
const sShoe = Shoe(sCard, 'adidas-niteball', 330);
const sName = Rise(scr, { x: 26, y: 456, w: 300, h: 40, html: 'Niteball', font: `600 30px/40px ${GEIST}`, sp: 'snappy' });
const sSub = Rise(scr, { x: 26, y: 496, w: 300, h: 34, html: 'adidas Originals', font: `400 22px/34px ${GEIST}`, color: 'rgba(18,18,20,.5)', sp: 'snappy' });
const sSize = Rise(scr, { x: 26, y: 552, w: 300, h: 30, html: 'Size (EU)', font: `500 20px/30px ${GEIST}`, color: 'rgba(18,18,20,.6)', sp: 'snappy' });
const chips = [40, 41, 42, 43, 44].map((n, i) => mk(scr, { left: 26 + i * 68, top: 592, width: 58, height: 58, borderRadius: 29, background: '#fff', boxShadow: 'inset 0 0 0 2px rgba(18,18,20,.12)', font: `600 22px/58px ${GEIST}`, color: INK, textAlign: 'center', transformOrigin: '50% 50%' }, String(n)));
const addBtn = mk(scr, { left: 26, top: 690, width: 340, height: 76, borderRadius: 38, background: INK, overflow: 'hidden', transformOrigin: '50% 50%' });
const addTxt = mk(addBtn, { left: 0, top: 0, width: 340, height: 76, font: `600 26px/76px ${GEIST}`, color: '#FFF9EE', textAlign: 'center', whiteSpace: 'nowrap' }, 'Add to bag');
const CKSVG = `<svg width="100%" height="100%" viewBox="0 0 76 76" style="left:0;top:0"><path class="ck" d="M24 39l10 10 19-21" fill="none" stroke="#FFF9EE" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;
const addCk = mk(addBtn, { left: 0, top: 0, width: 76, height: 76 }, CKSVG);
const pickH = Rise(WORLD, { x: 150, y: 290, w: 900, h: 340, html: `Pick your<br><i style="color:${BRASS}">size.</i>`, font: `400 150px/170px ${BODONI}`, ls: '-4px' });
const pickS = Rise(WORLD, { x: 156, y: 660, w: 760, h: 44, html: 'Every pair on one page. Tap a size, add to bag.', font: `400 30px/44px ${GEIST}`, color: 'rgba(18,18,20,.66)', sp: 'snappy' });

// S6: ordered, code, field ------------------------------------------------------------------------------------------------------
const ck = mk(WORLD, { display: 'none', background: BRASS, transformOrigin: '50% 50%' }, CKSVG);
const ordered = Rise(WORLD, { x: 650, y: 410, w: 1000, h: 250, html: 'Ordered.', font: `400 220px/250px ${BODONI}`, ls: '-6px' });
const field = mk(WORLD, { display: 'none', background: '#fff', boxShadow: '0 20px 50px rgba(40,32,20,.14)', overflow: 'hidden' });
const fHint = mk(field, { left: 40, top: 0, width: 500, height: 100, font: `400 30px/100px ${GEIST}`, color: 'rgba(18,18,20,.4)', whiteSpace: 'nowrap' }, 'Order number');
const fCode = mk(field, { left: 40, top: 0, width: 500, height: 100, font: `600 32px/100px ${GEIST}`, color: INK, letterSpacing: '.08em', whiteSpace: 'nowrap' }, 'DV-0428');
const fBtn = mk(field, { left: 470, top: 16, width: 150, height: 68, borderRadius: 34, background: GRAD, font: `600 24px/68px ${GEIST}`, color: '#FFF9EE', textAlign: 'center' }, 'Track');
const codeChip = mk(WORLD, { width: 200, height: 64, borderRadius: 32, background: '#fff', boxShadow: '0 12px 30px rgba(40,32,20,.18)', font: `600 28px/64px ${GEIST}`, color: INK, textAlign: 'center', letterSpacing: '.08em', display: 'none', transformOrigin: '50% 50%' }, 'DV-0428');

// S7-S8: dots, drop mark, orbit, "Drip Time" ------------------------------------------------------------------------------------
const rnd = mulberry32(7);
const DOTS = Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2 + rnd() * 0.4, r = 240 + rnd() * 200; return { x: 960 + Math.cos(a) * r * 1.4, y: 540 + Math.sin(a) * r * 0.8, s: 24 + rnd() * 20, el: mk(WORLD, { borderRadius: 999, background: BRASS, display: 'none' }) }; });
const ORB = mk(WORLD, { width: W, height: H });
const mark = mk(ORB, { display: 'none', background: GRAD, boxShadow: '0 24px 50px rgba(120,90,40,.28)', zIndex: 10 }, `<div class="dm" style="left:0;top:0;width:28px;height:40px">${dropSvg(1, BONE)}</div>`);
const markDrop = mark.querySelector('.dm');
const ORBS = ['adidas-niteball', 'axel-arigato', 'nb-550', 'nike-af1', 'nb-480', 'nike-zoom'].map(n => Shoe(ORB, n, 380));
const dtime = Rise(ORB, { x: 460, y: 410, w: 1000, h: 260, html: `Drip <i style="color:${BRASS}">Time</i>`, font: `400 210px/260px ${BODONI}`, ls: '-5px', al: 'center' });
dtime.box.style.zIndex = 12;
const zRings = [0, 1, 2].map(() => Ring(ORB)); zRings.forEach(r => r.style.zIndex = 4);

// S9: tracker -------------------------------------------------------------------------------------------------------------------
const trk = mk(WORLD, { display: 'none', background: '#fff', boxShadow: '0 40px 100px rgba(60,50,34,.2)', overflow: 'hidden' });
const tTitle = Rise(trk, { x: 70, y: 46, w: 800, h: 140, html: `On its <i style="color:${BRASS}">way.</i>`, font: `400 120px/140px ${BODONI}`, ls: '-3px' });
const tSub1 = mk(trk, { left: 74, top: 190, width: 600, height: 40, font: `400 28px/40px ${GEIST}`, color: 'rgba(18,18,20,.5)' }, 'Arriving today');
const tSub2 = mk(trk, { left: 74, top: 190, width: 600, height: 40, font: `600 28px/40px ${GEIST}`, color: BRASS }, 'Delivered');
mk(trk, { left: 90, top: 268, width: 980, height: 4, background: 'rgba(18,18,20,.14)', borderRadius: 2 });
const tBar = mk(trk, { left: 90, top: 268, width: 0, height: 4, background: BRASS, borderRadius: 2 });
const TN = [['Confirmed', 0, 'n1'], ['On its way', 490, 'n2'], ['At your door', 980, 'n3']].map(([l, x, k]) => {
  const n = mk(trk, { left: 90 + x - 18, top: 252, width: 36, height: 36, borderRadius: 18, background: '#F4F1EB', boxShadow: 'inset 0 0 0 3px rgba(18,18,20,.25)' });
  const f = mk(n, { width: 36, height: 36, borderRadius: 18, background: BRASS, transformOrigin: '50% 50%' });
  mk(trk, { left: 90 + x - 120, top: 302, width: 240, height: 34, font: `500 24px/34px ${GEIST}`, color: INK, textAlign: 'center' }, l); return { f, k };
});
const tDot = mk(trk, { left: 0, top: 0, width: 26, height: 26, borderRadius: 13, background: '#fff', boxShadow: `0 0 0 7px rgba(176,138,78,.35), inset 0 0 0 6px ${BRASS}` });
const tRing = Ring(WORLD);

// S10: hard cuts to on-foot photos ----------------------------------------------------------------------------------------------
const CUT1 = mk(STAGE, { width: W, height: H, background: BONE, display: 'none', overflow: 'hidden' });
const c1img = mk(CUT1, { left: 170, top: 163, width: 760, height: 754, borderRadius: 36, overflow: 'hidden', boxShadow: '0 30px 70px rgba(40,32,20,.2)', transformOrigin: '50% 50%' }, `<img src="assets/photos/jordan-4.jpg" style="left:0;top:0;width:760px;height:754px;object-fit:cover;filter:saturate(.88) sepia(.05)">`);
mk(CUT1, { left: 1040, top: 380, width: 820, height: 200, font: `400 150px/200px ${BODONI}`, color: INK, letterSpacing: '-4px', whiteSpace: 'nowrap' }, `At your <i style="color:${BRASS}">door.</i>`);
mk(CUT1, { left: 1046, top: 600, width: 700, height: 44, font: `400 30px/44px ${GEIST}`, color: 'rgba(18,18,20,.66)' }, 'Luxury footwear, delivered.');
const CUT2 = mk(STAGE, { width: W, height: H, background: '#EFEBE3', display: 'none', overflow: 'hidden' });
const c2img = mk(CUT2, { left: 1280, top: 122, width: 470, height: 836, borderRadius: 36, overflow: 'hidden', boxShadow: '0 30px 70px rgba(40,32,20,.2)', transformOrigin: '50% 50%' }, `<img src="assets/photos/asics-kayano.jpg" style="left:0;top:0;width:470px;height:836px;object-fit:cover;filter:saturate(.88) sepia(.05)">`);
mk(CUT2, { left: 150, top: 380, width: 1000, height: 200, font: `400 150px/200px ${BODONI}`, color: INK, letterSpacing: '-4px', whiteSpace: 'nowrap' }, `Ready to <i style="color:${BRASS}">wear.</i>`);

// S11: end card ------------------------------------------------------------------------------------------------------------------
const END = mk(STAGE, { width: W, height: H, background: BONE, display: 'none', overflow: 'hidden' });
const eMark = mk(END, { background: GRAD, boxShadow: '0 24px 50px rgba(120,90,40,.28)' }, `<div class="dm" style="left:0;top:0;width:28px;height:40px">${dropSvg(1, BONE)}</div>`);
const eDrop = eMark.querySelector('.dm');
const eWord = Rise(END, { x: 640, y: 400, w: 900, h: 140, html: 'DRIP VERSE', font: `400 112px/140px ${BODONI}`, ls: '.04em' });
const cta = mk(END, { background: GRAD, overflow: 'hidden', boxShadow: '0 24px 50px rgba(120,90,40,.28),inset 0 1px 0 rgba(255,255,255,.35)', transformOrigin: '50% 50%' });
const ctaIcon = mk(cta, { left: 12, top: 12, width: 72, height: 72, borderRadius: 36, background: BONE }, `<svg width="72" height="72" viewBox="0 0 72 72" style="left:0;top:0"><path d="M20 36 L52 22 L44 52 L36 40 Z M36 40 L52 22" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`);
const ctaTxt = mk(cta, { left: 96, top: 0, width: 330, height: 96, font: `600 32px/96px ${GEIST}`, color: '#FFF9EE', textAlign: 'center', whiteSpace: 'nowrap' }, 'Send us a DM');
const pow = Rise(END, { x: 646, y: 726, w: 600, h: 40, html: 'Powered by Climax Store', font: `400 26px/40px ${GEIST}`, color: 'rgba(18,18,20,.6)', sp: 'snappy' });
const ctaRing = Ring(END, BRASS);

const cursor = mk(STAGE, { width: 42, height: 60, display: 'none', transformOrigin: '6px 4px' }, `<svg width="42" height="60" viewBox="0 0 28 40" style="left:0;top:0;overflow:visible;filter:drop-shadow(0 4px 6px rgba(0,0,0,.25))"><path d="M3 2 L3 30 L10 24 L15 36 L20 34 L15 22 L24 22 Z" fill="#121214" stroke="#F4F1EB" stroke-width="2.4" stroke-linejoin="round"/></svg>`);
const clickRing = Ring(STAGE, INK);

// phone geometry in screen space (for the cursor targets): local point in the phone (px from its top-left) -> stage
const phonePt = (lx, ly) => { const a = PH.rot * Math.PI / 180, x = lx - PH.w / 2, y = ly - PH.h / 2; return [PH.cx + x * Math.cos(a) - y * Math.sin(a), PH.cy + x * Math.sin(a) + y * Math.cos(a)]; };
const CHIP42 = phonePt(14 + 26 + 2 * 68 + 29, 14 + 592 + 29), ADD = phonePt(14 + 26 + 170, 14 + 690 + 38);
const CTA_C = [646 + 210, 640];

// =====================================================================================================================
window.seek = function (t) {
  const inWorld = t < T.cut1; show(WORLD, inWorld); show(CUT1, t >= T.cut1 && t < T.cut2); show(CUT2, t >= T.cut2 && t < T.end); show(END, t >= T.end);

  // ---- S1-S2 ----
  findWords.forEach((s, i) => { s.style.transform = `translateY(${(1 - sp(t, -0.12 + 0.2 * i, 'heavy')) * 240 - sp(t, T.out1 + 0.05 * i, 'snappy') * 240}px)`; });
  show(findRow, t < T.out1 + 0.6);
  const aOn = t >= T.arrow && t < T.out1 + 0.5;
  if (show(arrow, aOn)) {
    const ax = track(t, [{ t: 0, v: 880 }, { t: T.flip2, v: 1365 }]), rot = track(t, [{ t: 0, v: 0 }, { t: T.flip1, v: 180, spring: 'snappy' }, { t: T.flip2, v: 360, spring: 'snappy' }]);
    const sx = sp(t, T.arrow, 'snappy') * (1 - sp(t, T.out1, 'snappy'));
    arrow.style.transformOrigin = '60px 30px'; put(arrow, { x: ax, y: 445, rot, sx, sy: sx });
  }
  const pos = track(t, [{ t: 0, v: -1.6 }, { t: T.flip2, v: 0 }, { t: T.tick1, v: 1 }, { t: T.tick2, v: 2 }, { t: T.out1, v: 3.6 }]);
  if (show(tickCol, t >= T.flip2 - 0.05 && t < T.out1 + 0.8)) tickWords.forEach((w, i) => { const d = Math.abs(i - pos); w.style.transform = `translateY(${275 + (i - pos) * 200}px)`; w.style.color = d < 1 ? `rgba(${Math.round(lerp(176, 18, d))},${Math.round(lerp(138, 18, d))},${Math.round(lerp(78, 20, d))},${lerp(1, 0.18, d)})` : 'rgba(18,18,20,.18)'; });
  const cIn = sp(t, 2.1, 'snappy'), cOut = sp(t, T.out1 + 0.1, 'snappy');
  if (show(card, t >= 2.1 && cOut < 0.995)) {
    put(card, { s: cIn * (1 - cOut) });
    const pc = Math.min(pos, 2);
    cardShoes.forEach((e, i) => { put(e, { x: 190, y: 150 + (i - pc) * 330 + bob(t, i), rot: i % 2 ? 4 : -6 }); e.style.visibility = (i === 2 && t >= T.out1) ? 'hidden' : 'visible'; });
  }
  if (show(chipNew, t >= 2.3 && t < T.out1 + 0.4)) put(chipNew, { s: sp(t, 2.3, 'snappy') * (1 - sp(t, T.out1, 'snappy')) });

  // ---- S3-S4 ----
  allIn(t, T.all, T.drop);
  const fly = sp(t, T.out1 + 0.02, 'default'), sink = sp(t, T.drop, 'default');
  if (show(shoeA, t >= T.out1 && t < T.drop + 0.7)) {
    put(shoeA, { x: lerp(1670, 868, fly), y: lerp(380 + bob(t, 2), 448, fly) + bob(t, 0.3, 5) * fly + sink * 190, rot: lerp(-6, -12, fly), s: lerp(400 / 360, 330 / 360, fly) * (1 - 0.6 * sink) });
  }
  const PILL = { x: 960, y: 560 };
  const pa = sp(t, T.pill, 'snappy'), pb = sp(t, T.pill + 0.15, 'default'), toC = sp(t, T.toCircle, 'default'), toM = sp(t, T.toMark, 'default');
  let pw = 116 * pa + 444 * pb - 444 * toC, ph = 116 * pa;
  const pcx = lerp(PILL.x, 700, toM), pcy = lerp(PILL.y, 540, toM);
  if (show(pill, t >= T.pill && t < T.phone)) {
    box(pill, pcx, pcy, pw, ph);
    const press = 1 - 0.05 * (sp(t, T.click, 'snappy') - sp(t, T.click + 0.12, 'snappy'));
    pill.style.transformOrigin = '50% 50%'; put(pill, { rot: -2.5 * sp(t, 5.3) + 2.5 * sp(t, 6.2), s: press });
    Object.assign(pillIcon.style, { left: ph * 0.12 + 'px', top: ph * 0.12 + 'px', width: ph * 0.76 + 'px', height: ph * 0.76 + 'px', borderRadius: ph * 0.38 + 'px' });
    pillIcon.firstChild.style.left = ph * 0.38 - 14 + 'px'; pillIcon.firstChild.style.top = ph * 0.38 - 20 + 'px';
    pillT1.style.opacity = swapAlpha(t, T.pill + 0.25, T.drop + 0.02); pillT2.style.opacity = swapAlpha(t, T.drop + 0.08, T.toCircle - 0.05);
    pillT1.style.width = pillT2.style.width = Math.max(0, pw - 140) + 'px';
  }
  RINGS.forEach((r, k) => {
    const g = sp(t, T.drop + 0.03 * k, 'default') - sp(t, T.collapse + 0.04 * (3 - k), 'default');
    if (!show(r.el, t >= T.drop && g > 0.004)) return;
    box(r.el, 960, 560, lerp(560, r.w, g), lerp(116, r.h, g));
  });
  word(t, T.word, T.wordOut);

  // ---- S5 phone ----
  const pu = sp(t, T.phone, 'default'), pout = sp(t, T.phoneOut, 'default');
  if (show(phone, t >= T.phone && pout < 0.995)) {
    box(phone, lerp(700, PH.cx, pu) + pout * 1100, lerp(540, PH.cy, pu) + pout * 120, lerp(116, PH.w, pu), lerp(116, PH.h, pu), lerp(58, 66, pu));
    phone.style.background = mixc('#B08A4E', INK, pu); put(phone, { rot: PH.rot * pu + 12 * pout });
    show(scr, pu > 0.6);
  }
  sBrand(t, T.pick); sName(t, T.pick + 0.25); sSub(t, T.pick + 0.3); sSize(t, T.pick + 0.35);
  put(sCard, { s: sp(t, T.pick + 0.05, 'snappy') }); put(sShoe, { x: 174, y: 160 + (1 - sp(t, T.pick + 0.15)) * 320 + bob(t, 0.8, 5), rot: -4 });
  chips.forEach((c, i) => { put(c, { s: sp(t, T.pick + 0.38 + 0.04 * i, 'snappy') * (i === 2 ? 1 - 0.08 * (sp(t, T.chip, 'snappy') - sp(t, T.chip + 0.12, 'snappy')) : 1) }); if (i === 2) { const u = sp(t, T.chip, 'snappy'); c.style.background = mixc('#FFFFFF', '#B08A4E', u); c.style.color = mixc(INK, '#FFF9EE', u); } });
  const sq = sp(t, T.check, 'default'), bw = lerp(340, 76, sq);
  Object.assign(addBtn.style, { left: 26 + (340 - bw) / 2 + 'px', width: bw + 'px', background: mixc(INK, '#B08A4E', sq) });
  put(addBtn, { s: sp(t, T.pick + 0.5, 'snappy') * (1 - 0.05 * (sp(t, T.add, 'snappy') - sp(t, T.add + 0.12, 'snappy'))) });
  addTxt.style.opacity = swapAlpha(t, T.pick + 0.55, T.check); addTxt.style.left = (bw - 340) / 2 + 'px';
  addCk.querySelector('.ck').style.strokeDashoffset = 1 - clamp((t - T.check - 0.15) / 0.25);
  pickH(t, T.pick, T.phoneOut); pickS(t, T.pick + 0.4, T.phoneOut);

  // ---- S6 ordered ----
  const cf = sp(t, T.phoneOut, 'default'), cg = sp(t, T.out6, 'default');
  if (show(ck, t >= T.phoneOut && cg < 0.995)) {
    const cs = lerp(76, 150, cf) * (1 - cg) + 22 * cg;
    box(ck, lerp(lerp(ADD[0], 520, cf), 960, cg), lerp(lerp(ADD[1], 540, cf), 540, cg), cs, cs);
    ck.querySelector('.ck').style.strokeDashoffset = 0;
  }
  ordered(t, T.ordered, T.out6);
  const fu = sp(t, T.field, 'default'), fo = sp(t, T.out6, 'snappy'), fwid = lerp(100, 660, fu) * (1 - fo);
  if (show(field, t >= T.field && fwid > 2)) { box(field, 960, 800, fwid, 100); fHint.style.opacity = swapAlpha(t, T.field + 0.2, T.land); fCode.style.opacity = swapAlpha(t, T.land + 0.02, T.out6); fBtn.style.left = fwid - 170 + 'px'; }
  const cm = sp(t, T.code + 0.12, 'default');
  if (show(codeChip, t >= T.code && t < T.land + 0.04)) { box(codeChip, lerp(520, 680, cm), lerp(540, 800, cm), 200, 64); put(codeChip, { s: sp(t, T.code, 'snappy') }); }

  // ---- S7-S8 dots, mark, orbit, zoom ----
  DOTS.forEach((d, i) => { const a = sp(t, T.dots + 0.03 * i, 'snappy'), c = sp(t, T.dots + 0.4 + 0.02 * i, 'default'); if (!show(d.el, t >= T.dots && c < 0.97)) return; box(d.el, lerp(d.x, 960, c), lerp(d.y, 540, c), d.s * a * (1 - 0.5 * c), d.s * a * (1 - 0.5 * c)); });
  const mz = sp(t, T.zoom, 'snappy'), mOn = t >= T.mark2 && mz < 0.99;
  if (show(mark, mOn)) { const ms = 140 * sp(t, T.mark2, 'snappy') * (1 - mz); box(mark, 960, 540, ms, ms); markDrop.style.transform = `translate(${ms / 2 - 14}px,${ms / 2 - 20}px) scale(${ms / 140})`; }
  const bgu = sp(t, T.zoom, 'default'), br = 70 + 1300 * bgu;
  if (show(BG2, t >= T.zoom && t < T.cut1)) box(BG2, 960, 540, br * 2, br * 2);
  const zg = sp(t, T.zoom, 'default'), fo2 = sp(t, T.flyOut, 'default');
  ORBS.forEach((e, i) => {
    const en = sp(t, T.orbit + 0.07 * i, 'default'), a = (i / 6) * Math.PI * 2 + 0.35 * (t - T.orbit) + 0.6, depth = Math.sin(a);
    if (!show(e, t >= T.orbit && fo2 < 0.99)) return;
    const rx = lerp(640, 780, zg) * en * (1 + 1.6 * fo2), ry = lerp(230, 300, zg) * en * (1 + 1.6 * fo2), base = lerp(300, 380, zg) / 380;
    put(e, { x: 960 + Math.cos(a) * rx, y: 540 + depth * ry + bob(t, i, 6), rot: (i % 2 ? 5 : -5), s: base * (0.8 + 0.2 * depth) * en });
    e.style.zIndex = depth > 0 ? 20 : 5;
  });
  dtime(t, T.dtime, T.flyOut);
  zRings.forEach((r, k) => ringAt(r, t, 22.0 + k, 960, 600, 120, 900, 0.3, 0.55));

  // ---- S9 tracker ----
  const tu = sp(t, T.tracker, 'default');
  if (show(trk, t >= T.tracker && t < T.cut1)) {
    box(trk, 960, 560, lerp(420, 1160, tu), lerp(120, 380, tu), lerp(30, 44, tu));
    tTitle(t, T.tracker + 0.2);
    tSub1.style.opacity = swapAlpha(t, T.tracker + 0.3, T.n3 - 0.05); tSub2.style.opacity = swapAlpha(t, T.n3 + 0.05, 99);
    const bar = track(t, [{ t: 0, v: 0 }, { t: T.n2, v: 490 }, { t: T.n3, v: 980 }]); tBar.style.width = bar + 'px';
    if (show(tDot, t >= T.n1 && t < T.n3 + 0.02)) put(tDot, { x: 90 + bar - 13, y: 257 });
    TN.forEach(n => { const s = sp(t, T[n.k], 'snappy'); put(n.f, { s }); n.f.style.visibility = s < 0.01 ? 'hidden' : 'visible'; });
  }
  ringAt(tRing, t, T.n3, 960 - 580 + 90 + 980, 560 - 190 + 270, 20, 260, 1, 0.6);

  // ---- S10 cuts (slow push only) ----
  put(c1img, { s: 1 + 0.03 * clamp(t - T.cut1) }); put(c2img, { s: 1 + 0.03 * clamp(t - T.cut2) });

  // ---- S11 end ----
  if (t >= T.end) {
    const pb2 = sp(t, T.end, 'default'), ms = lerp(1040, 140, pb2);
    box(eMark, lerp(960, 560, pb2), lerp(540, 470, pb2), ms, ms);
    eDrop.style.transform = `translate(${ms / 2 - 14}px,${ms / 2 - 20}px) scale(${ms / 140})`;
    eWord(t, T.end + 0.35); pow(t, T.pow);
    const ca = sp(t, T.cta, 'snappy'), cb = sp(t, T.cta + 0.12, 'default'), cw = 96 * ca + 330 * cb;
    box(cta, 646 + cw / 2, 640, cw, 96 * ca); cta.style.visibility = ca < 0.01 ? 'hidden' : 'visible';
    put(cta, { s: 1 - 0.05 * (sp(t, T.ctaClick, 'snappy') - sp(t, T.ctaClick + 0.12, 'snappy')) });
    ctaTxt.style.opacity = swapAlpha(t, T.cta + 0.25, 99); ctaTxt.style.width = Math.max(0, cw - 110) + 'px';
    ringAt(ctaRing, t, T.ctaClick, 646 + 213, 640, 60, 420, 0.3, 0.6);
  }

  // ---- cursor: three visits (pill, phone, call to action) ----
  const C = [
    { on: [T.curIn, T.drop - 0.1], k: [{ t: 0, v: [1600, 1000] }, { t: T.curIn, v: [1102, 582] }], click: T.click },
    { on: [T.cur2, T.phoneOut - 0.2], k: [{ t: 0, v: [1560, 1010] }, { t: T.cur2, v: [CHIP42[0] - 4, CHIP42[1] - 3] }, { t: T.toAdd, v: [ADD[0] - 4, ADD[1] - 3] }], click: [T.chip, T.add] },
    { on: [T.cur3, 99], k: [{ t: 0, v: [1500, 960] }, { t: T.cur3, v: [CTA_C[0] + 70, CTA_C[1] + 6] }], click: T.ctaClick }];
  let shown = false;
  for (const c of C) {
    if (t < c.on[0] || t >= c.on[1]) continue; shown = true;
    const x = track(t, c.k.map(k => ({ t: k.t, v: k.v[0] }))), y = track(t, c.k.map(k => ({ t: k.t, v: k.v[1] })));
    const clicks = [].concat(c.click), press = clicks.reduce((m, ct) => m - 0.15 * (sp(t, ct, 'snappy') - sp(t, ct + 0.12, 'snappy')), 1);
    const leave = c.on[1] < 90 ? 1 - sp(t, c.on[1] - 0.25, 'snappy') : 1;
    put(cursor, { x, y, s: press * sp(t, c.on[0], 'snappy') * leave });
    clicks.forEach((ct, j) => { if (j === 0) ringAt(clickRing, t, ct, x + 6, y + 4, 10, 120, 1, 0.5); });
  }
  show(cursor, shown); if (!shown) show(clickRing, false);
};
