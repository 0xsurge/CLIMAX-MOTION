// glass.js: liquid glass. Each glass element holds its own clone of the scene behind it, refracted through an SVG feImage
// displacement map (a rounded-rect or glyph distance field) via three feDisplacementMaps at slightly different scales (chromatic edges),
// plus a rim light. backdrop-filter: url() misreads displacement maps in Chromium, so the scene is cloned instead.
const GOLD = 'sepia(.45) saturate(1.55) hue-rotate(-14deg) brightness(.97) contrast(1.06)';
const BGS = { img: 'corridor', split: -1 };      // the state of the scene behind the glass, set from t each frame
const BGIMG = { corridor: { k: W / 793, fx: 816.5, fy: 396.5 }, towers: { k: W / 667, fx: 500, fy: 333 } };
const bgInstances = [];
function makeBg(parent) {   // a full-square photo layer, with a golden-hour reveal left of BGS.split
  const root = mk(parent, { left: 0, top: 0, width: W, height: W, overflow: 'hidden', background: '#000' });
  const A = mk(root, { left: 0, top: 0 }), gw = mk(root, { left: 0, top: 0, width: 0, height: W, overflow: 'hidden' });
  const G = mk(gw, { left: 0, top: 0, filter: GOLD }), tint = mk(gw, { left: 0, top: 0, width: W, height: W, background: 'rgba(255,170,70,.26)', mixBlendMode: 'multiply' });
  let lastImg = null;
  const inst = { root, apply() {
    const b = BGIMG[BGS.img], im = IMGEL[BGS.img], iw = im.naturalWidth * b.k, ih = im.naturalHeight * b.k, l = C - b.fx * b.k, tp = C - b.fy * b.k;
    if (lastImg !== BGS.img) { lastImg = BGS.img; for (const e of [A, G]) e.style.backgroundImage = `url(${IMGS[BGS.img]})`, e.style.backgroundSize = '100% 100%'; }
    for (const e of [A, G]) Object.assign(e.style, { width: iw + 'px', height: ih + 'px', left: l + 'px', top: tp + 'px' });
    G.style.left = l + 'px'; gw.style.width = Math.max(0, BGS.split) + 'px'; gw.style.display = BGS.split > 0 ? 'block' : 'none';
  } };
  bgInstances.push(inst); return inst;
}

const GL = { wait: [], dirty: false, mapCache: new Map(), id: 0 };
function rrMap(w, h, r, bevel) {   // rounded-rect distance field -> displacement map (R,G = inward normal * strength, strongest at the rim)
  const key = `rr${w}_${h}_${r}_${bevel}`; if (GL.mapCache.has(key)) return GL.mapCache.get(key);
  const sc = (w * h > 60000) ? 0.5 : 1, cw = Math.max(2, Math.ceil(w * sc)), ch = Math.max(2, Math.ceil(h * sc)), rr = r * sc, bv = Math.max(2, bevel * sc);
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext('2d'), im = g.createImageData(cw, ch);
  const hx = cw / 2, hy = ch / 2, ox = hx - rr, oy = hy - rr;
  const sdf = (x, y) => { const qx = Math.abs(x - hx) - ox, qy = Math.abs(y - hy) - oy; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - rr; };
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const d = -sdf(x + .5, y + .5), gx = (sdf(x + 1.5, y + .5) - sdf(x - .5, y + .5)) / 2, gy = (sdf(x + .5, y + 1.5) - sdf(x + .5, y - .5)) / 2;
    const t = Math.min(1, Math.max(0, d / bv)), m = d < 0 ? 0 : Math.pow(1 - t, 2.2), i = (y * cw + x) * 4;
    im.data[i] = 128 - 127 * gx * m; im.data[i + 1] = 128 - 127 * gy * m; im.data[i + 2] = 128; im.data[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); const url = cv.toDataURL('image/png'); GL.mapCache.set(key, url); return url;
}
const FILTER_SVG = (id, w, h, sc) => `<svg width="0" height="0" style="position:absolute"><filter id="${id}" x="0" y="0" width="${w}" height="${h}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feImage href="" x="0" y="0" width="${w}" height="${h}" result="map" preserveAspectRatio="none"/>
  <feDisplacementMap in="SourceGraphic" in2="map" scale="${sc}" xChannelSelector="R" yChannelSelector="G" result="dr"/>
  <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="R"/>
  <feDisplacementMap in="SourceGraphic" in2="map" scale="${sc * 1.07}" xChannelSelector="R" yChannelSelector="G" result="dg"/>
  <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="G"/>
  <feDisplacementMap in="SourceGraphic" in2="map" scale="${sc * 1.14}" xChannelSelector="R" yChannelSelector="G" result="db"/>
  <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="B"/>
  <feBlend in="R" in2="G" mode="screen" result="RG"/><feBlend in="RG" in2="B" mode="screen" result="RGB"/>
  <feColorMatrix in="RGB" type="saturate" values="1.35"/></filter></svg>`;

// a rounded-rect / circle glass shape that can morph every frame
function Glass(parent) {
  const id = 'gf' + (GL.id++);
  const root = mk(parent, { overflow: 'hidden', display: 'none', boxShadow: '0 18px 44px rgba(0,0,0,.28), 0 2px 8px rgba(0,0,0,.18)' });
  root.insertAdjacentHTML('afterbegin', FILTER_SVG(id, 10, 10, 60));
  const inner = mk(root, { left: 0, top: 0, filter: `url(#${id})` }), bg = makeBg(inner);
  const tint = mk(root, { left: 0, top: 0, background: 'rgba(255,255,255,.10)' }), rim = mk(root, { left: 0, top: 0 }), spec = mk(root, { left: 0, top: 0, background: 'linear-gradient(180deg,rgba(255,255,255,.38),rgba(255,255,255,0))', borderRadius: 999 });
  const fe = root.querySelector('feImage'), flt = root.querySelector('filter'), dms = [...root.querySelectorAll('feDisplacementMap')];
  let lastKey = '';
  return { root, set(o) {
    const op = o.op ?? 1; if (op <= 0.003 || o.w < 3 || o.h < 3) { root.style.display = 'none'; return; }
    root.style.display = 'block'; const { x, y, w, h } = o, r = Math.min(o.r ?? h / 2, w / 2, h / 2), bevel = o.bevel || Math.min(h / 2, 46), sc = o.scale || 60;
    Object.assign(root.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', borderRadius: r + 'px', opacity: op, transform: o.s !== undefined ? `scale(${o.s})` : 'none', transformOrigin: o.origin || '50% 50%' });
    for (const e of [inner, tint, rim]) Object.assign(e.style, { width: w + 'px', height: h + 'px', borderRadius: r + 'px' });
    bg.root.style.left = -x + 'px'; bg.root.style.top = -y + 'px'; bg.apply();
    flt.setAttribute('width', w); flt.setAttribute('height', h); fe.setAttribute('width', w); fe.setAttribute('height', h);
    dms[0].setAttribute('scale', sc); dms[1].setAttribute('scale', sc * 1.07); dms[2].setAttribute('scale', sc * 1.14);
    const key = `${Math.round(w / 3)}_${Math.round(h / 3)}_${Math.round(r / 3)}_${bevel}`;
    if (key !== lastKey) { lastKey = key; const url = rrMap(Math.round(w / 3) * 3, Math.round(h / 3) * 3, Math.round(r / 3) * 3, bevel); fe.setAttribute('href', url); GL.dirty = true; }
    tint.style.background = o.tint || 'rgba(255,255,255,.10)';
    rim.style.boxShadow = `inset 0 0 0 1.5px rgba(255,255,255,.42), inset 0 10px 16px -8px rgba(255,255,255,.75), inset 0 -12px 20px -12px rgba(0,0,0,.30), inset 10px 0 18px -14px rgba(255,255,255,.35)`;
    Object.assign(spec.style, { left: r * 0.5 + 'px', top: '3px', width: Math.max(0, w - r) + 'px', height: Math.min(26, h * .22) + 'px' });
  } };
}

// glass letters: a canvas distance field per glyph gives the displacement map, the mask and the rim light
function glyphField(ch, font, size, stretch, bevel) {
  const cvm = document.createElement('canvas').getContext('2d'); cvm.font = `${font} ${size}px ${ARCH_NAME}`; cvm.fontStretch = stretch;
  const adv = cvm.measureText(ch).width, pad = 8, w = Math.ceil(adv + pad * 2), h = Math.ceil(size * 1.15);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); g.font = `${font} ${size}px ${ARCH_NAME}`; g.fontStretch = stretch; g.textBaseline = 'alphabetic'; g.fillStyle = '#000'; g.fillText(ch, pad, size * 0.9);
  const a = g.getImageData(0, 0, w, h).data, n = w * h, d = new Float32Array(n);
  for (let i = 0; i < n; i++) d[i] = a[i * 4 + 3] > 127 ? 1e6 : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (d[i] === 0) continue; let m = d[i]; if (x > 0) m = Math.min(m, d[i - 1] + 3); if (y > 0) { m = Math.min(m, d[i - w] + 3); if (x > 0) m = Math.min(m, d[i - w - 1] + 4); if (x < w - 1) m = Math.min(m, d[i - w + 1] + 4); } d[i] = m; }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; if (d[i] === 0) continue; let m = d[i]; if (x < w - 1) m = Math.min(m, d[i + 1] + 3); if (y < h - 1) { m = Math.min(m, d[i + w] + 3); if (x < w - 1) m = Math.min(m, d[i + w + 1] + 4); if (x > 0) m = Math.min(m, d[i + w - 1] + 4); } d[i] = m; }
  for (let i = 0; i < n; i++) d[i] /= 3;
  const mapC = document.createElement('canvas'); mapC.width = w; mapC.height = h; const mg = mapC.getContext('2d'), mi = mg.createImageData(w, h);
  const rimC = document.createElement('canvas'); rimC.width = w; rimC.height = h; const rg = rimC.getContext('2d'), ri = rg.createImageData(w, h);
  const maskC = document.createElement('canvas'); maskC.width = w; maskC.height = h; const kg = maskC.getContext('2d'), ki = kg.createImageData(w, h);
  const LX = -0.55, LY = -0.83;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, dv = d[i], px4 = i * 4; if (dv <= 0) { mi.data[px4] = mi.data[px4 + 1] = mi.data[px4 + 2] = 128; mi.data[px4 + 3] = 255; continue; }
    let nx = d[i + 1] - d[i - 1], ny = d[i + w] - d[i - w]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    const t = Math.min(1, dv / bevel), m = Math.pow(1 - t, 2.2);
    mi.data[px4] = 128 + 127 * nx * m; mi.data[px4 + 1] = 128 + 127 * ny * m; mi.data[px4 + 2] = 128; mi.data[px4 + 3] = 255;
    ki.data[px4 + 3] = 255;
    const band = Math.pow(Math.max(0, 1 - dv / 11), 1.2), lit = -(nx * LX + ny * LY);   // outward normal = -n
    const hi = Math.min(1, band * Math.max(0, -lit) * 1.5 + band * 0.18), sh = band * Math.max(0, lit) * 0.42;
    if (hi >= sh) { ri.data[px4] = ri.data[px4 + 1] = ri.data[px4 + 2] = 255; ri.data[px4 + 3] = 255 * hi; } else { ri.data[px4 + 3] = 255 * sh; }
  }
  mg.putImageData(mi, 0, 0); rg.putImageData(ri, 0, 0); kg.putImageData(ki, 0, 0);
  return { adv, pad, w, h, map: mapC.toDataURL(), rim: rimC.toDataURL(), mask: maskC.toDataURL() };
}
const ARCH_NAME = 'Archivo';
function GlassGlyph(parent, field, scale) {   // fixed-shape glass: only position / scale change per frame
  const id = 'gf' + (GL.id++), w = field.w, h = field.h;
  const root = mk(parent, { width: w, height: h, display: 'none', webkitMaskImage: `url(${field.mask})`, webkitMaskSize: '100% 100%', maskImage: `url(${field.mask})`, maskSize: '100% 100%', filter: 'drop-shadow(0 14px 26px rgba(0,0,0,.42)) drop-shadow(0 0 2px rgba(255,255,255,.25))' });
  const wrap = mk(root, { left: 0, top: 0, width: w, height: h });
  wrap.insertAdjacentHTML('afterbegin', FILTER_SVG(id, w, h, scale));
  const inner = mk(wrap, { left: 0, top: 0, width: w, height: h, filter: `url(#${id})` }), bg = makeBg(inner);
  mk(wrap, { left: 0, top: 0, width: w, height: h, background: 'rgba(255,255,255,.24)' });
  mk(wrap, { left: 0, top: 0, width: w, height: h, backgroundImage: `url(${field.rim})`, backgroundSize: '100% 100%' });
  const fe = wrap.querySelector('feImage'); fe.setAttribute('href', field.map); GL.dirty = true;
  return { root, set(o) {
    const op = o.op ?? 1; if (op <= 0.003 || (o.s ?? 1) < 0.01) { root.style.display = 'none'; return; }
    root.style.display = 'block'; Object.assign(root.style, { left: o.x + 'px', top: o.y + 'px', opacity: op, transform: `scale(${o.s ?? 1})`, transformOrigin: o.origin || '50% 50%' });
    bg.root.style.left = -o.x + 'px'; bg.root.style.top = -o.y + 'px'; bg.apply();
  } };
}
async function settleGlass() {   // feImage loads its data URL asynchronously: wait until every new map has decoded and painted
  if (!GL.dirty) return; GL.dirty = false;
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
}
