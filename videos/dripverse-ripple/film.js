// DRIP VERSE, "One order": a beat-for-beat rebuild of the structure, cut points and grammar of the revest reference film
// (71 s, 16:9), in DRIP VERSE's own brand: bone, ink and brass, Bodoni Moda + Geist, the brass drop as the floating shape.
// No revest logo, UI, footage or claims. Shop UI here is a stand-in (no prices, no stock numbers). Every frame is a pure function of t.
const { spring, track, swapAlpha, clamp, lerp, mulberry32 } = Motion;
const W = 1920, H = 1080, END = 71.2667;
const INK = '#121214', BONE = '#F3EFE8', STONE = '#E6E1D8', BRASS = '#B08A4E', GRAD = 'linear-gradient(90deg,#9A733A,#C8A766)';
const GEIST = "'Geist', system-ui, sans-serif", BOD = "'Bodoni', 'Times New Roman', serif";
const STAGE = document.getElementById('stage');
const sp = (t, t0, p = 'default') => spring(t - t0, p);

const css = document.createElement('style');
css.textContent = `@font-face{font-family:'Bodoni';src:url(assets/fonts/bodoni-normal.woff2) format('woff2');font-weight:400 600;font-style:normal}
@font-face{font-family:'Bodoni';src:url(assets/fonts/bodoni-italic.woff2) format('woff2');font-weight:400 600;font-style:italic}
@font-face{font-family:'Geist';src:url(assets/fonts/geist.woff2) format('woff2');font-weight:100 900}
#stage *{position:absolute;box-sizing:border-box;margin:0;padding:0}
#stage .t,#stage i,#stage b{position:static;display:inline-block}`;
document.head.appendChild(css);
const SHOES = { 'adidas-niteball': [579, 365], 'axel-arigato': [688, 394], 'nb-550': [390, 304], 'nb-480': [577, 470], 'nike-af1': [707, 607], 'nike-zoom': [405, 307] };
const PH = { 'nb-550': [512, 640], 'jordan-4': [640, 635], 'asics-kayano': [736, 1308] };
const ld = s => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = s; });
window.__preload = [document.fonts.load("400 100px 'Bodoni'"), document.fonts.load("italic 400 100px 'Bodoni'"), document.fonts.load("600 30px 'Geist'"), document.fonts.load("400 30px 'Geist'"),
  ...Object.keys(SHOES).map(n => ld(`assets/cut/${n}_c.png`)), ...Object.keys(PH).map(n => ld(`assets/photos/${n}.jpg`))];

// ---------- cut points: the reference's 19 cuts, each snapped to the nearest beat of the 120 BPM song ----------
const CUTS = [0, 2.5, 3.5, 5.0, 7.0, 8.0, 10.0, 12.0, 13.0, 25.0, 28.0, 30.0, 34.0, 35.5, 44.5, 49.0, 56.0, 58.5, 62.5, END];
window.TIMELINE = { CUTS };

// ---------- helpers ----------
const PXK = new Set(['left', 'top', 'width', 'height', 'borderRadius']);
function mk(parent, o = {}, html) {
  const e = document.createElement('div'); e.style.left = '0px'; e.style.top = '0px';
  for (const k in o) e.style[k] = (PXK.has(k) && typeof o[k] === 'number') ? o[k] + 'px' : o[k];
  if (html != null) e.innerHTML = html; parent.appendChild(e); return e;
}
const put = (e, o) => { e.style.transform = `translate(${o.x || 0}px,${o.y || 0}px) rotate(${o.rot || 0}deg) skewX(${o.skx || 0}deg) scale(${o.sx ?? o.s ?? 1},${o.sy ?? o.s ?? 1})`; };
const show = (e, on) => { e.style.display = on ? 'block' : 'none'; return on; };
function Rise(parent, o) {   // masked rise, upward exit
  const bx = mk(parent, { left: o.x, top: o.y, width: o.w, height: o.h, overflow: 'hidden' });
  const inner = mk(bx, { width: o.w, height: o.h, font: o.font, color: o.color || INK, letterSpacing: o.ls || '0', whiteSpace: 'nowrap', textAlign: o.al || 'left' }, o.html);
  return (t, tin, tout = 999, p = o.sp || 'heavy') => { const u = sp(t, tin, p), v = sp(t, tout, 'snappy'); inner.style.transform = `translateY(${(1 - u - v) * o.h * 1.15}px)`; bx.style.visibility = (t < tin - .02 || v > .995) ? 'hidden' : 'visible'; };
}
const pop = (e, t, t0, origin = '50% 50%', extra = {}) => { const s = sp(t, t0, 'snappy'); e.style.transformOrigin = origin; put(e, { ...extra, s: s * (extra.s ?? 1) }); e.style.visibility = s < .01 ? 'hidden' : 'visible'; };
const shoe = (parent, n, w, o = {}) => { const [iw, ih] = SHOES[n], h = w * ih / iw; return mk(parent, { left: -w / 2, top: -h / 2, width: w, height: h, ...o }, `<img src="assets/cut/${n}_c.png" style="left:0;top:0;width:${w}px;height:${h}px;filter:drop-shadow(0 24px 28px rgba(40,32,20,.24))">`); };
const photo = (parent, n, w, h, o = {}) => mk(parent, { width: w, height: h, borderRadius: 30, overflow: 'hidden', boxShadow: '0 30px 70px rgba(40,32,20,.22)', ...o }, `<img src="assets/photos/${n}.jpg" style="left:0;top:0;width:${w}px;height:${h}px;object-fit:cover;filter:saturate(.9) sepia(.05)">`);
const glass = (parent, w, h, html = '', o = {}) => mk(parent, { width: w, height: h, borderRadius: 26, background: 'rgba(255,255,255,.72)', boxShadow: '0 24px 60px rgba(60,48,30,.16), inset 0 0 0 1.5px rgba(255,255,255,.95)', overflow: 'hidden', ...o }, html);
const DROP = (s, id) => `<svg width="${60 * s}" height="${86 * s}" viewBox="0 0 60 86" style="left:0;top:0;overflow:visible"><defs><linearGradient id="dg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9D3A4"/><stop offset=".45" stop-color="#C39A57"/><stop offset="1" stop-color="#7E5A26"/></linearGradient></defs><path d="M30 2 C 24 26 6 42 6 60 a24 24 0 0 0 48 0 C 54 42 36 26 30 2z" fill="url(#dg${id})"/><ellipse cx="21" cy="58" rx="6" ry="11" fill="#fff" opacity=".55" transform="rotate(16 21 58)"/></svg>`;
const ICON = { box: '<path d="M8 20 L32 8 L56 20 L56 46 L32 58 L8 46Z M8 20 L32 32 L56 20 M32 32 L32 58" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>',
  check: '<path d="M14 33 l12 12 l24 -26" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
  bag: '<path d="M14 22 h36 l-3 34 h-30z M24 22 a8 8 0 0 1 16 0" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>',
  card: '<rect x="8" y="16" width="48" height="32" rx="6" fill="none" stroke="#fff" stroke-width="4"/><path d="M8 26 h48" stroke="#fff" stroke-width="4"/>',
  receipt: '<path d="M16 8 h32 v48 l-6 -4 -5 4 -5 -4 -5 4 -5 -4 -6 4z M22 20 h20 M22 30 h20 M22 40 h12" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>' };
const iconBox = (k, s = 88) => `<div style="left:0;top:0;width:${s}px;height:${s}px;border-radius:${s * .28}px;background:${GRAD};box-shadow:0 10px 24px rgba(150,110,50,.3)"><svg width="${s}" height="${s}" viewBox="0 0 64 64" style="left:0;top:0">${ICON[k]}</svg></div>`;
const chip = (txt, icon = 'check') => `<div style="left:0;top:0;height:80px;padding:0 30px 0 88px;border-radius:40px;background:rgba(255,255,255,.86);box-shadow:0 14px 30px rgba(60,48,30,.16),inset 0 0 0 1.5px #fff;font:600 31px/80px ${GEIST};color:${INK};white-space:nowrap"><div style="left:12px;top:12px;width:56px;height:56px;border-radius:28px;background:${GRAD}"><svg width="56" height="56" viewBox="0 0 64 64" style="left:0;top:0">${ICON[icon]}</svg></div>${txt}</div>`;
const rnd = mulberry32(11);

// ---------- scenes: each is a container with its own always-moving camera ----------
const SC = [];
function scene(t0, t1, bg, build) {
  const el = mk(STAGE, { width: W, height: H, overflow: 'hidden', background: bg, display: 'none' });
  const cam = mk(el, { width: W, height: H, transformOrigin: '960px 540px' });
  const upd = build(cam, el);
  SC.push({ t0, t1, el, cam, upd });
}
const BGW = 'linear-gradient(160deg,#F7F3EC 0%,#ECE5D9 100%)';
const BGD = 'radial-gradient(120% 90% at 50% 40%,#FBF7F0 0%,#EADFCB 70%,#DCCBAE 100%)';   // the drop world (revest's blue world)
// ambient floating drops (revest's 3D triangles): seeded positions, depth by size and blur, each drifting and turning slowly
function drops(parent, n, seed) {
  const r = mulberry32(seed);
  return Array.from({ length: n }, (_, i) => { const s = .4 + r() * 1.4; let x = r() * W, y = r() * H; if (x > 300 && x < 1620 && y > 80 && y < 760) x = x < 960 ? 40 + r() * 260 : 1620 + r() * 260; const d = { x, y, s, rot: r() * 360, vx: Math.sign(x - 960) * (10 + r() * 25), vy: (r() - .5) * 30, vr: (r() - .5) * 30, blur: s < .7 ? 3 : 0 };
    d.el = mk(parent, { width: 60 * s, height: 86 * s, filter: d.blur ? `blur(${d.blur}px)` : 'none', transformOrigin: '50% 60%' }, DROP(s, seed * 100 + i)); return d; });
}
const driftDrops = (D, u, k = 1) => D.forEach(d => put(d.el, { x: d.x + d.vx * u * k, y: d.y + d.vy * u * k, rot: d.rot + d.vr * u }));
const camMove = (cam, u, z0, z1, dur, dx = 0, dy = 0) => { const p = clamp(u / dur); cam.style.transform = `translate(${dx * u}px,${dy * u}px) scale(${lerp(z0, z1, p)})`; };

// A 0-2.5: "One [shoe] order."
scene(0, 2.5, BGW, cam => {
  const s = shoe(cam, 'axel-arigato', 360), one = Rise(cam, { x: 430, y: 470, w: 360, h: 140, html: 'One', font: `400 120px/140px ${BOD}`, ls: '-3px' }), ord = Rise(cam, { x: 1180, y: 470, w: 420, h: 140, html: '<i>order.</i>', font: `400 120px/140px ${BOD}`, color: BRASS, ls: '-3px' });
  return (u, t) => { camMove(cam, u, 1, 1.06, 2.5, 0, -6); const e = sp(u, .15); put(s, { x: 960, y: 540 + (1 - e) * -420 + 6 * Math.sin(u * 3), rot: -8 + 6 * Math.sin(u * 2), s: .95 + .05 * e }); one(u, .55); ord(u, .8); };
});
// B 2.5-3.5: the first pair (photo card with a push)
scene(2.5, 3.5, BGW, cam => {
  const p = photo(cam, 'nb-550', 600, 750, { left: 260, top: 165 }), tx = Rise(cam, { x: 990, y: 420, w: 860, h: 230, html: 'It starts with<br><i style="color:#B08A4E">one pair.</i>', font: `400 96px/112px ${BOD}`, ls: '-2px' });
  return u => { camMove(cam, u, 1.04, 1.1, 1, -20, 0); p.firstChild.style.transform = `scale(${1.05 + .05 * u})`; tx(u, .1); };
});
// C 3.5-5.0: the catalogue (stand-in shop UI, tilted plane, camera pans)
scene(3.5, 5.0, BGW, cam => {
  const plane = mk(cam, { left: 200, top: 120, width: 1700, height: 900, borderRadius: 30, background: '#fff', boxShadow: '0 40px 100px rgba(60,48,30,.2)', transformOrigin: '50% 50%' });
  mk(plane, { left: 50, top: 40, width: 800, height: 50, font: `600 30px/50px ${GEIST}`, color: INK, letterSpacing: '.18em' }, 'DRIP VERSE &nbsp;<span class="t" style="color:#B08A4E;letter-spacing:0">· New in</span>');
  Object.keys(SHOES).concat(['adidas-niteball', 'axel-arigato']).forEach((n, i) => { const c = mk(plane, { left: 50 + (i % 4) * 405, top: 120 + Math.floor(i / 4) * 380, width: 380, height: 350, borderRadius: 22, background: STONE, overflow: 'hidden' }); const s = shoe(c, n, 300); put(s, { x: 190, y: 160, rot: -4 }); mk(c, { left: 22, top: 296, width: 300, height: 36, font: `600 22px/36px ${GEIST}`, color: INK }, n.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())); });
  return u => { camMove(cam, u, 1, 1.05, 1.5); put(plane, { x: 160 - 220 * u, y: 40 - 20 * u, rot: -6, skx: 14, sy: .86 }); };
});
// D 5.0-7.0: on its way (stand-in delivery map, route draws, the van dot travels)
scene(5.0, 7.0, '#EDE7DC', cam => {
  const R = 'M120 860 C 420 700, 520 760, 760 600 S 1140 420, 1360 470 S 1700 300, 1820 220';
  const map = mk(cam, { width: W, height: H }, `<svg width="1920" height="1080" viewBox="0 0 1920 1080" style="left:0;top:0">${Array.from({ length: 14 }, (_, i) => `<path d="M${-100 + i * 160} -50 L ${200 + i * 140} 1150" stroke="#DCD3C4" stroke-width="${i % 3 ? 3 : 9}"/>`).join('')}${Array.from({ length: 9 }, (_, i) => `<path d="M-50 ${60 + i * 130} L 1980 ${-40 + i * 150}" stroke="#DCD3C4" stroke-width="${i % 2 ? 3 : 8}"/>`).join('')}<path id="rt" d="${R}" fill="none" stroke="${BRASS}" stroke-width="10" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><circle cx="120" cy="860" r="14" fill="${INK}"/></svg>`);
  const rt = map.querySelector('#rt'), L = rt.getTotalLength(), van = mk(cam, { width: 0, height: 0 }, `<div style="left:-26px;top:-26px;width:52px;height:52px;border-radius:26px;background:${GRAD};box-shadow:0 0 0 12px rgba(176,138,78,.25),0 10px 20px rgba(0,0,0,.2)"></div>`);
  const c = mk(cam, { left: 160, top: 160 }, chip('On its way', 'box'));
  return u => { camMove(cam, u, 1.08, 1, 2, 0, 0); const p = clamp(sp(u, .1, 'heavy')); rt.style.strokeDashoffset = 1 - p; const pt = rt.getPointAtLength(L * p * .985); put(van, { x: pt.x, y: pt.y }); pop(c, u, .45, '0 50%'); };
});
// E 7.0-8.0: the pair in stock (hero shoe on a pedestal, glass chip)
scene(7.0, 8.0, 'linear-gradient(#EEE8DE,#DCD2C2)', cam => {
  mk(cam, { left: 560, top: 720, width: 800, height: 120, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(60,45,25,.28),transparent)' });
  const s = shoe(cam, 'adidas-niteball', 820), c = mk(cam, { left: 1260, top: 300 }, chip('In stock · ready to ship'));
  return u => { camMove(cam, u, 1, 1.07, 1, -10, 0); put(s, { x: 960, y: 520 + 5 * Math.sin(u * 4), rot: -4 }); pop(c, u, .25, '0 50%'); };
});
// F 8.0-10.0: the product page (stand-in) with a chip
scene(8.0, 10.0, BGW, cam => {
  const pg = mk(cam, { left: 210, top: 120, width: 1500, height: 840, borderRadius: 30, background: '#fff', boxShadow: '0 40px 100px rgba(60,48,30,.18)' });
  const im = mk(pg, { left: 40, top: 40, width: 780, height: 760, borderRadius: 24, background: STONE });
  const s = shoe(im, 'adidas-niteball', 640); put(s, { x: 390, y: 380, rot: -5 });
  mk(pg, { left: 880, top: 70, width: 560, height: 60, font: `600 46px/60px ${GEIST}`, color: INK }, 'Niteball');
  mk(pg, { left: 880, top: 136, width: 560, height: 40, font: `400 28px/40px ${GEIST}`, color: 'rgba(18,18,20,.55)' }, 'adidas Originals');
  mk(pg, { left: 880, top: 230, width: 560, height: 34, font: `500 24px/34px ${GEIST}`, color: 'rgba(18,18,20,.6)' }, 'Size (EU)');
  [40, 41, 42, 43, 44].forEach((n, i) => mk(pg, { left: 880 + i * 104, top: 280, width: 88, height: 88, borderRadius: 44, background: n === 42 ? GRAD : '#fff', boxShadow: n === 42 ? 'none' : 'inset 0 0 0 2px rgba(18,18,20,.12)', font: `600 30px/88px ${GEIST}`, color: n === 42 ? '#FFF9EE' : INK, textAlign: 'center' }, String(n)));
  mk(pg, { left: 880, top: 420, width: 520, height: 100, borderRadius: 50, background: INK, font: `600 32px/100px ${GEIST}`, color: '#FFF9EE', textAlign: 'center' }, 'Add to bag');
  const c1 = mk(cam, { left: 720, top: 180 }, chip('Only a few left', 'bag')), c2 = mk(cam, { left: 1400, top: 760 }, chip('Size 42 · ready', 'check'));
  return u => { camMove(cam, u, 1.1, 1, 2, 10, -6); pop(c1, u, .3, '0 50%'); pop(c2, u, .7, '0 50%'); };
});
// G 10.0-12.0: the big glass stat card over the blurred page (revest "Online stock" card)
scene(10.0, 12.0, BGW, cam => {
  const back = mk(cam, { left: 0, top: 0, width: W, height: H, filter: 'blur(14px)', opacity: .7 }); const s = shoe(back, 'adidas-niteball', 900); put(s, { x: 1300, y: 540, rot: -5 });
  const g = glass(cam, 760, 400, `<div style="left:50px;top:50px">${iconBox('box', 100)}</div><div style="left:50px;top:170px;width:660px;height:130px;font:400 120px/130px ${BOD};color:${BRASS}">Size 42</div><div style="left:54px;top:304px;width:660px;height:50px;font:500 36px/50px ${GEIST};color:${INK}">packed and ready to ship</div>`, { left: 120, top: 320 });
  return u => { camMove(cam, u, 1, 1.05, 2, -8, 0); const e = sp(u, .05); put(g, { y: (1 - e) * 80, s: .92 + .08 * e }); };
});
// H 12.0-13.0: the order at the counter (stand-in order card with floating status cards)
scene(12.0, 13.0, 'linear-gradient(#E9E2D6,#D7CCB9)', cam => {
  const o = mk(cam, { left: 620, top: 160, width: 680, height: 760, borderRadius: 40, background: '#fff', boxShadow: '0 40px 100px rgba(60,48,30,.25)' });
  mk(o, { left: 50, top: 50, width: 580, height: 50, font: `600 36px/50px ${GEIST}`, color: INK }, 'Order DV-0428');
  ['nb-550', 'adidas-niteball'].forEach((n, i) => { const r = mk(o, { left: 50, top: 140 + i * 200, width: 580, height: 170, borderRadius: 22, background: STONE }); const s = shoe(r, n, 200); put(s, { x: 120, y: 85 }); mk(r, { left: 240, top: 55, width: 320, height: 60, font: `600 28px/60px ${GEIST}`, color: INK }, n === 'nb-550' ? 'New Balance 550' : 'adidas Niteball'); });
  mk(o, { left: 50, top: 600, width: 580, height: 100, borderRadius: 50, background: GRAD, font: `600 32px/100px ${GEIST}`, color: '#FFF9EE', textAlign: 'center' }, 'Pay');
  const a = mk(cam, { left: 300, top: 300 }, chip('Paid', 'card')), b2 = mk(cam, { left: 1370, top: 640 }, chip('Packing', 'box'));
  return u => { camMove(cam, u, 1.05, 1.1, 1, 0, -10); pop(a, u, .15, '100% 50%'); pop(b2, u, .4, '0 50%'); };
});
// I-K 13.0-25.0: the drop world (one continuous stretch, like the reference's 15-25 s)
scene(13.0, 25.0, BGD, cam => {
  const D = drops(cam, 16, 3);
  const t1 = Rise(cam, { x: 360, y: 150, w: 1200, h: 110, html: 'Order <i style="color:#B08A4E">confirmed</i>', font: `400 92px/110px ${BOD}`, al: 'center' });
  const plane = mk(cam, { left: 360, top: 330, width: 1200, height: 700, borderRadius: 30, background: '#fff', boxShadow: '0 40px 100px rgba(60,48,30,.22)', transformOrigin: '50% 0%' });
  mk(plane, { left: 50, top: 40, width: 1100, height: 50, font: `600 30px/50px ${GEIST}`, color: INK }, 'Order DV-0428 &nbsp;<span class="t" style="color:#B08A4E">· confirmed</span>');
  ['Confirmed', 'Paid', 'Packed', 'Shipped'].forEach((s, i) => { const r = mk(plane, { left: 50 + i * 278, top: 130, width: 258, height: 120, borderRadius: 20, background: STONE }); mk(r, { left: 20, top: 20 }, iconBox(['check', 'card', 'box', 'bag'][i], 52)); mk(r, { left: 20, top: 80, width: 220, height: 30, font: `600 22px/30px ${GEIST}`, color: INK }, s); });
  ['nb-550', 'adidas-niteball'].forEach((n, i) => { const r = mk(plane, { left: 50 + i * 556, top: 280, width: 536, height: 130, borderRadius: 20, background: '#FAF8F4' }); const s = shoe(r, n, 140); put(s, { x: 90, y: 65, rot: -4 }); mk(r, { left: 180, top: 40, width: 340, height: 50, font: `600 26px/50px ${GEIST}`, color: INK }, n === 'nb-550' ? 'New Balance 550' : 'adidas Niteball'); });
  const bars = [.35, .5, .42, .62, .55, .74, .68, .86, .8, .95].map((h, i) => mk(plane, { left: 60 + i * 108, top: 650 - h * 200, width: 70, height: h * 200, borderRadius: 12, background: i === 9 ? GRAD : '#E4DBCB' }));
  const t2 = Rise(cam, { x: 360, y: 150, w: 1200, h: 110, html: 'Every sale, <i style="color:#B08A4E">tracked</i>', font: `400 92px/110px ${BOD}`, al: 'center' });
  // payments reconciled: two icons and a dashed line drawing between them
  const recon = mk(cam, { width: W, height: H, display: 'none' });
  const ia = mk(recon, { left: 520, top: 480 }, iconBox('receipt', 150)), ib = mk(recon, { left: 1250, top: 480 }, iconBox('card', 150));
  const line = mk(recon, { width: W, height: H }, `<svg width="1920" height="1080" style="left:0;top:0"><path id="dl" d="M690 555 L1240 555" stroke="${BRASS}" stroke-width="6" stroke-dasharray="14 14" fill="none"/></svg>`);
  const dl = line.querySelector('#dl');
  const t3 = Rise(recon, { x: 690, y: 470, w: 550, h: 70, html: 'Payments, reconciled', font: `500 40px/70px ${GEIST}`, color: BRASS, al: 'center' });
  // sweep: two big drops cross the frame at the scene changes inside this stretch
  const sweep = [0, 1, 2].map(i => mk(cam, { width: 600, height: 860, transformOrigin: '50% 60%' }, DROP(10, 900 + i)));
  return (u, t) => {
    camMove(cam, u, 1, 1.12, 12, 0, -4); driftDrops(D, u, .8);
    t1(u, .2, 4.0); t2(u, 4.3, 8.1);
    const rise = sp(u, 1.0, 'default'), tilt = sp(u, 2.6, 'heavy'), more = sp(u, 4.3, 'heavy');
    const pOn = u < 8.6; show(plane, pOn);
    if (pOn) put(plane, { x: 0, y: (1 - rise) * 800 + more * -40 - sp(u, 8.0, 'default') * 900, rot: -6 * tilt - 4 * more, skx: 18 * tilt + 6 * more, sy: 1 - .16 * tilt - .06 * more, s: 1 + .12 * more });
    bars.forEach((b, i) => { const g = sp(u, 4.5 + i * .06, 'snappy'); b.style.transformOrigin = '50% 100%'; put(b, { sy: g }); });
    const sw = sp(u, 7.7, { k: 60, c: 14 });                       // the sweep that changes the scene to "reconciled"
    sweep.forEach((s, i) => { show(s, u > 7.6 && u < 9.4); put(s, { x: lerp(2100 + i * 300, -1200 + i * 200, sw), y: lerp(600 - i * 200, -200 - i * 150, sw), rot: -30 + i * 20, s: .8 + .3 * i }); });
    if (show(recon, u >= 8.3)) { pop(ia, u, 8.4); pop(ib, u, 8.6); dl.style.strokeDashoffset = 560 - 560 * clamp((u - 8.9) / 1.2); dl.setAttribute('d', `M690 555 L${690 + 550 * clamp((u - 8.9) / 1.2)} 555`); t3(u, 9.6); }
  };
});
// L 25.0-28.0: the stock chart, cursor clicks Restock (stand-in, no numbers)
scene(25.0, 28.0, BGW, cam => {
  const c = mk(cam, { left: 260, top: 180, width: 1400, height: 720, borderRadius: 30, background: '#fff', boxShadow: '0 40px 100px rgba(60,48,30,.18)' });
  mk(c, { left: 60, top: 50, width: 700, height: 50, font: `600 34px/50px ${GEIST}`, color: INK }, 'Niteball · size 42');
  mk(c, { left: 60, top: 106, width: 700, height: 36, font: `400 24px/36px ${GEIST}`, color: 'rgba(18,18,20,.5)' }, 'Stock &nbsp;—&nbsp; forecast - - -');
  const g = mk(c, { left: 60, top: 170, width: 1280, height: 480 }, `<svg width="1280" height="480" viewBox="0 0 1280 480" style="left:0;top:0">${[0, 1, 2, 3].map(i => `<path d="M0 ${60 + i * 120} H1280" stroke="#EEE8DE" stroke-width="2"/>`).join('')}<path id="sl" d="M0 60 C 200 90, 320 140, 520 200 S 820 330, 980 380" fill="none" stroke="${BRASS}" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><path id="fl" d="M980 380 C 1080 405, 1180 425, 1270 440" fill="none" stroke="${BRASS}" stroke-width="5" stroke-dasharray="10 12" opacity=".6"/></svg>`);
  const sl = g.querySelector('#sl'), fl = g.querySelector('#fl');
  const btn = mk(c, { left: 1100, top: 46, width: 240, height: 80, borderRadius: 40, background: GRAD, font: `600 28px/80px ${GEIST}`, color: '#FFF9EE', textAlign: 'center', transformOrigin: '50% 50%' }, 'Restock');
  const cur = mk(cam, { width: 42, height: 60 }, `<svg width="42" height="60" viewBox="0 0 28 40" style="left:0;top:0;overflow:visible"><path d="M3 2 L3 30 L10 24 L15 36 L20 34 L15 22 L24 22 Z" fill="${INK}" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>`);
  const lo = mk(cam, { left: 1180, top: 560 }, chip('Low stock', 'bag'));
  return u => { camMove(cam, u, 1, 1.06, 3, -6, 0); sl.style.strokeDashoffset = 1 - clamp(sp(u, .1, 'heavy')); fl.style.opacity = .6 * clamp((u - .9) * 2); pop(lo, u, 1.0, '0 50%');
    const k = sp(u, 1.4, 'default'); put(cur, { x: lerp(1700, 1460, k), y: lerp(950, 300, k), s: 1 - .15 * (sp(u, 2.2, 'snappy') - sp(u, 2.32, 'snappy')) });
    put(btn, { s: 1 - .06 * (sp(u, 2.2, 'snappy') - sp(u, 2.32, 'snappy')) }); };
});
// M 28.0-30.0: restock order (the boxed pair)
scene(28.0, 30.0, 'linear-gradient(#E6DED0,#D3C6B0)', cam => {
  const p = photo(cam, 'nb-550', 560, 700, { left: 680, top: 260 }), t = Rise(cam, { x: 360, y: 90, w: 1200, h: 130, html: 'Restock <i style="color:#B08A4E">order</i>', font: `400 110px/130px ${BOD}`, al: 'center' });
  const c = mk(cam, { left: 1280, top: 640 }, chip('Order placed', 'check'));
  return u => { camMove(cam, u, 1.06, 1, 2, 0, -8); p.firstChild.style.transform = `scale(${1.08 - .04 * u})`; t(u, .05); pop(c, u, .7, '0 50%'); };
});
// N 30.0-34.0: payment completed, then the glass collage of everything so far
scene(30.0, 34.0, BGD, cam => {
  const D = drops(cam, 10, 7);
  const pc = glass(cam, 620, 420, `<div style="left:40px;top:40px">${iconBox('check', 90)}</div><div style="left:40px;top:150px;width:540px;height:56px;font:600 40px/56px ${GEIST};color:${INK}">Payment completed</div><div style="left:40px;top:212px;width:540px;height:40px;font:400 26px/40px ${GEIST};color:rgba(18,18,20,.55)">Order DV-0428 · confirmed</div><div style="left:40px;top:300px;width:250px;height:76px;border-radius:38px;background:${INK};font:600 26px/76px ${GEIST};color:#FFF9EE;text-align:center">Receipt</div>`, { left: 650, top: 330 });
  const tiles = [['nb-550', 0], ['adidas-niteball', 1], ['axel-arigato', 2], ['nike-zoom', 3]].map(([n, i]) => { const g = glass(cam, 300, 240, '', { left: 0, top: 0 }); const s = shoe(g, n, 230); put(s, { x: 150, y: 120, rot: -5 }); return g; });
  return u => { camMove(cam, u, 1, 1.1, 4, 0, -5); driftDrops(D, u);
    const out = sp(u, 2.0, 'default'); pc.style.transformOrigin = '50% 50%'; put(pc, { y: (1 - sp(u, .1)) * 300 - out * 40, s: 1 - .35 * out, x: -out * 420 });
    tiles.forEach((g, i) => { const e = sp(u, 2.1 + i * .1); const P = [[1060, 160], [1420, 220], [1060, 520], [1420, 600]][i]; g.style.transformOrigin = '50% 50%'; put(g, { x: lerp(1900, P[0], e), y: lerp(1200, P[1], e), rot: (1 - e) * 20 + (i - 1.5) * 2, s: .7 + .3 * e }); g.style.visibility = u < 2.1 + i * .1 ? 'hidden' : 'visible'; }); };
});
// O 34.0-35.5: "in one tap" over the board of everything
scene(34.0, 35.5, BGW, cam => {
  const names = ['nb-550', 'adidas-niteball', 'axel-arigato', 'nike-zoom', 'nb-480', 'nike-af1'];
  const g = names.map((n, i) => { const c = glass(cam, 420, 300, '', { left: 120 + (i % 3) * 580, top: i < 3 ? 80 : 640 }); const s = shoe(c, n, 320); put(s, { x: 210, y: 150, rot: -4 }); return c; });
  const t = Rise(cam, { x: 460, y: 440, w: 1000, h: 140, html: 'in one <i style="color:#B08A4E">tap.</i>', font: `400 120px/140px ${BOD}`, al: 'center' });
  return u => { camMove(cam, u, 1.08, 1.02, 1.5, 0, 0); g.forEach((c, i) => put(c, { y: 6 * Math.sin(u * 3 + i) })); t(u, .1); };
});
// P-S 35.5-44.5: the drops become the wordmark; not just a shop; the order list; one store
scene(35.5, 44.5, BGD, cam => {
  const D = drops(cam, 14, 21);
  const mark = mk(cam, { left: 960 - 46, top: 380, width: 92, height: 130 }, DROP(1.5, 777));
  const word = Rise(cam, { x: 460, y: 520, w: 1000, h: 150, html: 'DRIP VERSE', font: `500 84px/150px ${GEIST}`, ls: '.32em', al: 'center' });
  const nj = Rise(cam, { x: 360, y: 480, w: 1200, h: 110, html: 'Not just a <i style="color:#B08A4E">shop.</i>', font: `400 92px/110px ${BOD}`, al: 'center' });
  const list = mk(cam, { left: 300, top: 160, width: 1320, height: 760, borderRadius: 30, background: '#fff', boxShadow: '0 40px 100px rgba(60,48,30,.2)', transformOrigin: '50% 50%' });
  mk(list, { left: 50, top: 40, width: 800, height: 50, font: `600 32px/50px ${GEIST}`, color: INK }, 'Orders');
  ['nb-550', 'adidas-niteball', 'axel-arigato', 'nike-zoom'].forEach((n, i) => { const r = mk(list, { left: 50, top: 120 + i * 150, width: 1220, height: 130, borderRadius: 20, background: i === 1 ? '#F5EEDF' : '#FAF8F4' }); const s = shoe(r, n, 150); put(s, { x: 100, y: 65 }); mk(r, { left: 200, top: 40, width: 600, height: 50, font: `600 28px/50px ${GEIST}`, color: INK }, ['New Balance 550', 'adidas Niteball', 'Axel Arigato Area', 'Nike Zoom Vomero'][i]); mk(r, { left: 960, top: 34, width: 220, height: 62, borderRadius: 31, background: i === 1 ? GRAD : STONE, font: `600 22px/62px ${GEIST}`, color: i === 1 ? '#FFF9EE' : INK, textAlign: 'center' }, ['Delivered', 'On its way', 'Packed', 'Confirmed'][i]); });
  // one store: a glowing shop card on a brass grid floor
  const floor = mk(cam, { left: -400, top: 560, width: 2720, height: 900, display: 'none', transformOrigin: '50% 0%', background: 'repeating-linear-gradient(90deg,rgba(176,138,78,.35) 0 2px,transparent 2px 160px),repeating-linear-gradient(0deg,rgba(176,138,78,.35) 0 2px,transparent 2px 120px)' });
  const store = glass(cam, 520, 360, `<div style="left:30px;top:26px;width:460px;height:40px;font:600 24px/40px ${GEIST};color:${INK};letter-spacing:.16em">DRIP VERSE</div>`, { left: 700, top: 360, boxShadow: '0 0 0 3px rgba(200,167,102,.9),0 0 60px rgba(200,167,102,.55),0 40px 80px rgba(60,48,30,.25)', display: 'none' });
  const ss = shoe(store, 'axel-arigato', 360); put(ss, { x: 260, y: 200, rot: -5 });
  const one = Rise(cam, { x: 430, y: 250, w: 400, h: 120, html: 'One', font: `400 104px/120px ${BOD}` }), sto = Rise(cam, { x: 1260, y: 250, w: 400, h: 120, html: '<i style="color:#B08A4E">store.</i>', font: `400 104px/120px ${BOD}` });
  return u => { camMove(cam, u, 1, 1.08, 9, 0, -3); cam.style.transform += ` translate(${-9 * Math.max(0, u - .2)}px,0)`; driftDrops(D, u, 1.6);
    const conv = sp(u, 0, 'heavy'); D.forEach((d, i) => { if (i < 6) put(d.el, { x: lerp(d.x, 960, conv * (1 - sp(u, .9))), y: lerp(d.y, 440, conv * (1 - sp(u, .9))), rot: d.rot * (1 - conv) }); });
    const mo = sp(u, .5, 'snappy') * (1 - sp(u, 1.6, 'snappy')); mark.style.transformOrigin = '50% 60%'; put(mark, { s: mo }); word(u, .7, 1.6); nj(u, 1.8, 3.3);
    const lu = sp(u, 3.5, 'default'), lo = sp(u, 6.3, 'default'); show(list, u > 3.4 && u < 7.0); put(list, { y: (1 - lu) * 900, s: 1 + .25 * sp(u, 4.6, 'heavy') - .5 * lo, rot: -lo * 4 });
    const so = u > 6.3; show(floor, so); show(store, so);
    if (so) { const e = sp(u, 6.4, 'default'); put(floor, { y: (1 - e) * 400, skx: -22, sy: .55 }); store.style.transformOrigin = '50% 50%'; put(store, { y: (1 - e) * 200 + 6 * Math.sin(u * 3), s: .8 + .2 * e }); }
    one(u, 6.9); sto(u, 7.1); };
});
// T 44.5-49.0: one store to a hundred: "Grows with you."
scene(44.5, 49.0, BGD, cam => {
  mk(cam, { left: -400, top: 380, width: 2720, height: 1200, transformOrigin: '50% 0%', background: 'repeating-linear-gradient(90deg,rgba(176,138,78,.3) 0 2px,transparent 2px 160px),repeating-linear-gradient(0deg,rgba(176,138,78,.3) 0 2px,transparent 2px 120px)', transform: 'skewX(-22deg) scaleY(.55)' });
  const r = mulberry32(5), cards = Array.from({ length: 22 }, (_, i) => { const n = Object.keys(SHOES)[i % 6]; const g = glass(cam, 220, 150, '', { left: 0, top: 0 }); const s = shoe(g, n, 150); put(s, { x: 110, y: 78, rot: -4 }); return { g, x: 120 + (i % 8) * 230 + (Math.floor(i / 8) % 2) * 110, y: 430 + Math.floor(i / 8) * 190, d: r() * .9 }; });
  const hero = glass(cam, 420, 290, '', { left: 750, top: 330, boxShadow: '0 0 0 3px rgba(200,167,102,.9),0 0 60px rgba(200,167,102,.5),0 40px 80px rgba(60,48,30,.25)' }); const hs = shoe(hero, 'axel-arigato', 300); put(hs, { x: 210, y: 150, rot: -5 });
  const t1 = Rise(cam, { x: 360, y: 120, w: 1200, h: 110, html: 'to a <i style="color:#B08A4E">hundred.</i>', font: `400 92px/110px ${BOD}`, al: 'center' });
  const t2 = Rise(cam, { x: 1180, y: 160, w: 700, h: 230, html: 'Grows<br><i style="color:#B08A4E">with you.</i>', font: `400 96px/112px ${BOD}` });
  return u => { camMove(cam, u, 1.12, 1, 4.5, 0, -6);
    cards.forEach((c, i) => { const e = sp(u, .3 + c.d, 'snappy'); c.g.style.transformOrigin = '50% 50%'; put(c.g, { x: c.x, y: c.y + (1 - e) * 60, s: e * .9 }); c.g.style.visibility = e < .01 ? 'hidden' : 'visible'; });
    hero.style.transformOrigin = '50% 50%'; put(hero, { y: -sp(u, 2.0, 'heavy') * 160 + 5 * Math.sin(u * 3), x: -sp(u, 2.0, 'heavy') * 380, s: 1 + .15 * sp(u, 2.0, 'heavy') });
    t1(u, .2, 1.9); t2(u, 2.3); };
});
// U 49.0-56.0: the hub: everything DRIP VERSE handles orbits the mark (no third-party logos)
scene(49.0, 56.0, BGW, cam => {
  const hub = mk(cam, { left: 960 - 170, top: 540 - 170, width: 340, height: 340, borderRadius: 170, background: 'rgba(255,255,255,.85)', boxShadow: '0 0 0 3px rgba(200,167,102,.7),0 0 80px rgba(200,167,102,.35),0 40px 80px rgba(60,48,30,.18)' }, `<div style="left:124px;top:66px;width:92px;height:130px">${DROP(1.5, 555)}</div><div style="left:0;top:214px;width:340px;height:44px;font:500 24px/44px ${GEIST};color:${INK};text-align:center;letter-spacing:.3em;padding-left:.3em">DRIP VERSE</div>`);
  const L = ['DMs', 'Orders', 'Payments', 'Delivery', 'Restock', 'Receipts', 'Sizes', 'Returns', 'Pickup', 'Tracking', 'New drops', 'Reorders'];
  const IC = ['bag', 'check', 'card', 'box', 'box', 'receipt', 'check', 'bag', 'box', 'check', 'bag', 'receipt'];
  const ch = L.map((s, i) => mk(cam, {}, chip(s, IC[i])));
  return u => { camMove(cam, u, 1, 1.1, 7, -9, 4); hub.style.transformOrigin = '50% 50%'; put(hub, { s: sp(u, .05, 'snappy') });
    ch.forEach((c, i) => { const ring = i < 6 ? 0 : 1, k = ring ? i - 6 : i, a = k / 6 * Math.PI * 2 + (ring ? .5 : 0) + u * .12 * (ring ? -1 : 1), R = ring ? 460 : 300, t0 = ring ? 2.6 + k * .12 : .22 + k * .12;
      const e = sp(u, t0, 'default'); put(c, { x: 960 + Math.cos(a) * R * 1.35 * e - 90, y: 540 + Math.sin(a) * R * .8 * e - 32, s: e }); c.style.visibility = e < .01 ? 'hidden' : 'visible'; }); };
});
// V 56.0-58.5: the notification over the on-foot photo
scene(56.0, 58.5, '#2A2620', cam => {
  const p = photo(cam, 'jordan-4', 1920, 1905, { left: 0, top: -400, borderRadius: 0 });
  const n = glass(cam, 760, 150, `<div style="left:24px;top:24px">${iconBox('bag', 100)}</div><div style="left:150px;top:30px;width:580px;height:40px;font:600 28px/40px ${GEIST};color:${INK}">DRIP VERSE</div><div style="left:150px;top:74px;width:580px;height:44px;font:400 28px/44px ${GEIST};color:rgba(18,18,20,.7)">Your order is on its way.</div>`, { left: 580, top: 120 });
  return u => { put(p, { x: -40 * u, y: -20 * u, s: 1 + .02 * u }); const e = sp(u, .3, 'snappy'); n.style.transformOrigin = '50% 0%'; put(n, { y: (1 - e) * -200, s: .9 + .1 * e }); };
});
// W 58.5-62.5: in one tap (Asics on foot)
scene(58.5, 62.5, BGW, cam => {
  const p = photo(cam, 'asics-kayano', 500, 888, { left: 1180, top: 96 });
  const t = Rise(cam, { x: 150, y: 400, w: 1000, h: 280, html: 'At your door,<br><i style="color:#B08A4E">in one tap.</i>', font: `400 110px/130px ${BOD}` });
  return u => { camMove(cam, u, 1, 1.07, 4, -6, 0); p.firstChild.style.transform = `scale(${1.06 - .015 * u}) translateY(${-6 * u}px)`; t(u, .2); };
});
// X-Y 62.5-71.3: the drops resolve into the mark, then the end card
scene(62.5, END, BGD, cam => {
  const D = drops(cam, 14, 31);
  const mark = mk(cam, { left: 960 - 46, top: 300, width: 92, height: 130 }, DROP(1.5, 888));
  const word = Rise(cam, { x: 460, y: 440, w: 1000, h: 150, html: 'DRIP VERSE', font: `500 84px/150px ${GEIST}`, ls: '.32em', al: 'center' });
  const tag = Rise(cam, { x: 460, y: 600, w: 1000, h: 60, html: 'One order. <i style="color:#B08A4E">Every step handled.</i>', font: `400 46px/60px ${BOD}`, al: 'center', sp: 'snappy' });
  const sub = Rise(cam, { x: 460, y: 600, w: 1000, h: 60, html: 'Luxury footwear, delivered.', font: `400 40px/60px ${GEIST}`, color: 'rgba(18,18,20,.6)', al: 'center', sp: 'snappy' });
  const dm = mk(cam, { left: 960 - 220, top: 700, width: 440, height: 100, borderRadius: 50, background: GRAD, boxShadow: '0 24px 50px rgba(120,90,40,.28)', font: `600 34px/100px ${GEIST}`, color: '#FFF9EE', textAlign: 'center', transformOrigin: '50% 50%' }, 'Send us a DM');
  const pw = Rise(cam, { x: 660, y: 830, w: 600, h: 44, html: 'Powered by Climax Store', font: `400 26px/44px ${GEIST}`, color: 'rgba(18,18,20,.55)', al: 'center', sp: 'snappy' });
  return u => { camMove(cam, u, 1.12, 1, 8.8, -9, 4);
    const conv = sp(u, 1.0, 'heavy'); D.forEach(d => { put(d.el, { x: lerp(d.x + d.vx * u * 2.5, 960 - 30, conv), y: lerp(d.y + d.vy * u * 2.5, 360, conv), rot: lerp(d.rot, 0, conv), s: 1 - conv * .95 }); d.el.style.visibility = u > 1.75 ? 'hidden' : 'visible'; });
    mark.style.transformOrigin = '50% 60%'; put(mark, { y: -40 * sp(u, 1.5, 'default'), s: sp(u, 1.2, 'snappy') * (1 + .04 * Math.sin(u * 2.4)) });
    word(u, 1.5); tag(u, 2.6, 4.6); sub(u, 4.8);
    const d = sp(u, 5.2, 'snappy'); put(dm, { s: d }); dm.style.visibility = d < .01 ? 'hidden' : 'visible'; pw(u, 5.8); };
});

window.seek = function (t) {
  // each scene switches 5 ms before its cut so no motion-blurred frame straddles a hard cut
  for (const s of SC) { const a = s.t0 ? s.t0 - .005 : -1, b = s.t1 - .005, on = t >= a && t < b; if (show(s.el, on)) s.upd(Math.max(0, t - s.t0), t); }
};
