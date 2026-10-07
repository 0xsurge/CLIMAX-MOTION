// s1_open.js: wordmark squeeze -> pill -> click -> iris -> photo disc -> square -> paper-unfold grid -> bento -> zoom on the drop (t 0..8)
// and the wordmark's return (t 26.3..27) so the last frame equals the first.
const T_ZOOM = 7.55, T_DROP = 8.0;
CAMK.x.push({ t: T_ZOOM, v: 468, spring: SNAP }, { t: 8.06, v: C, spring: 'default' });
CAMK.y.push({ t: T_ZOOM, v: 468, spring: SNAP }, { t: 8.06, v: C, spring: 'default' });
CAMK.s.push({ t: T_ZOOM, v: W / 484, spring: SNAP }, { t: 8.06, v: 1, spring: 'default' });

function buildS1() {
  // ---------- wordmark "Armab." measured at wdth 125 ----------
  const wm = mk(camEl, { left: 0, top: 0, width: W, height: W });
  const meas = mk(wm, { whiteSpace: 'nowrap', fontFamily: ARCH, fontWeight: 800, fontSize: 100, letterSpacing: '-0.03em', fontVariationSettings: '"wdth" 125, "wght" 800', visibility: 'hidden' });
  const word = 'Armab', pre = [0];
  for (let i = 1; i <= 5; i++) { meas.textContent = word.slice(0, i); pre.push(meas.getBoundingClientRect().width); }
  meas.textContent = 'Armab.'; const full100 = meas.getBoundingClientRect().width;
  const FS = 100 * 1120 / full100, K = FS / 100, X0 = (W - 1120) / 2, BASE = 822;
  const cx = document.createElement('canvas').getContext('2d'); cx.font = `800 ${FS}px Archivo`;
  const mt = cx.measureText('A'), asc = mt.fontBoundingBoxAscent, desc = mt.fontBoundingBoxDescent, baseOff = (FS - (asc + desc)) / 2 + asc;
  // ink box of the period at wdth 125
  const pc = document.createElement('canvas'); pc.width = pc.height = Math.ceil(FS * 1.4); const pg = pc.getContext('2d'); pg.font = `800 ${FS}px Archivo`; pg.fontStretch = 'expanded'; pg.fillText('.', 60, FS);
  const pd = pg.getImageData(0, 0, pc.width, pc.height).data; let mnx = 1e9, mxx = -1, mny = 1e9, mxy = -1;
  for (let y = 0; y < pc.height; y++) for (let x = 0; x < pc.width; x++) if (pd[(y * pc.width + x) * 4 + 3] > 100) { mnx = Math.min(mnx, x); mxx = Math.max(mxx, x); mny = Math.min(mny, y); mxy = Math.max(mxy, y); }
  const xp = X0 + pre[5] * K;                       // where the period's glyph starts
  const dotL = xp + (mnx - 60), dotW = mxx - mnx + 1, dotH = mxy - mny + 1, dotBottom = BASE + (mxy + 1 - FS);
  const letters = [...word].map((ch, i) => ({ ch, x: X0 + pre[i] * K, w: (pre[i + 1] - pre[i]) * K,
    el: mk(wm, { left: 0, top: BASE - baseOff, height: FS, whiteSpace: 'nowrap', fontFamily: ARCH, fontWeight: 800, fontSize: FS, lineHeight: 1, letterSpacing: '-0.03em', color: INK, transformOrigin: '0 50%' }, ch) }));
  const PW = 420, PH = 205;
  const pill = mk(wm, { left: 0, top: 0, width: 10, height: 10, background: INK, overflow: 'hidden', zIndex: 3 });
  const label = mk(pill, { left: 0, top: 0, width: PW, textAlign: 'center', color: '#fff', fontFamily: GEIST, fontWeight: 600, fontSize: 76, letterSpacing: '-0.02em', whiteSpace: 'nowrap', lineHeight: 1.1 }, 'Our work');
  const CF = { k: 20, c: 7.2 }, RET = { k: 300, c: 26 };
  // wordmark state: squeeze factor f, pill growth e (both phases: the opening and the return)
  function wmState(t) {
    let f = track(t, [{ t: 0, v: 1 }, { t: 0.05, v: 0, spring: CF }]), e = sp(t, 1.5, 'default');
    if (t >= 26.1) { f = sp(t, 26.5, RET); e = 1 - sp(t, 26.5, 'snappy'); }
    return { f, e };
  }
  const pillGeom = (e, t) => ({ w: lerp(dotW, PW, e), h: lerp(dotH, PH, e) });
  function updateWordmark(t) {
    const on = t < 3.25 || t >= 26.4; show(wm, on); if (!on) return;
    const { f: f0, e } = wmState(t), f = Math.max(0, f0), g = pillGeom(e, t);
    const P = dotL + dotW / 2, leftX = P - (P - X0) * f, pillL = dotL, rightX = pillL + g.w, shift = C - (leftX + rightX) / 2;
    const wd = clamp(125 * f, 62, 125), sx = f * 125 / wd;
    letters.forEach(l => {
      const lx = P - (P - l.x) * f + shift;
      l.el.style.display = f < 0.004 ? 'none' : 'block'; l.el.style.fontVariationSettings = `"wdth" ${wd.toFixed(2)}, "wght" 800`;
      l.el.style.transform = `translate(${lx}px,0px) scaleX(${sx})`;
    });
    const r = lerp(Math.min(dotW, dotH) * 0.14, g.h / 2, clamp(e * 1.6));
    Object.assign(pill.style, { width: g.w + 'px', height: g.h + 'px', borderRadius: r + 'px', transform: `translate(${pillL + shift}px,${dotBottom - g.h}px)` });
    const up = t >= 26.1 ? 1 : sp(t, 2.0, 'heavy');
    label.style.width = g.w + 'px'; label.style.transform = `translateY(${(1 - up) * 96 + (g.h - 76 * 1.1) / 2}px)`;
    label.style.opacity = e > 0.02 && t < 26.1 ? 1 : 0;
  }

  // ---------- photo tiles: 9 crops; T0 starts as the disc the iris opens onto ----------
  const TILES = [
    { key: 'corridor', fx: 816.5, fy: 396.5, S: 793 }, { key: 'towers', fx: 500, fy: 333, S: 667 }, { key: 'sketch', fx: 560, fy: 333, S: 667 },
    { key: 'keyboard', fx: 600, fy: 480, S: 960 }, { key: 'fuhsi', fx: 343, fy: 512, S: 687 }, { key: 'corridor', fx: 1587, fy: 396, S: 793 },
    { key: 'corridor', fx: 260, fy: 420, S: 520 }, { key: 'towers', fx: 500, fy: 200, S: 420 }, { key: 'keyboard', fx: 780, fy: 540, S: 600 }];
  const GRID_G = 330, GRID_GAP = 28, GO = C - (3 * GRID_G + 2 * GRID_GAP) / 2;
  const cell = (c, r) => [GO + c * (GRID_G + GRID_GAP) + GRID_G / 2, GO + r * (GRID_G + GRID_GAP) + GRID_G / 2];
  const CELL = [[1, 1], [1, 0], [2, 1], [1, 2], [0, 1], [2, 0], [2, 2], [0, 2], [0, 0]];
  const BU = 232, BG = 20, BO = C - (4 * BU + 3 * BG) / 2;
  const BENTO = [[0, 0, 2, 2], [2, 0, 1, 1], [3, 0, 1, 2], [2, 1, 1, 1], [0, 2, 1, 2], [1, 2, 2, 1], [3, 2, 1, 1], [1, 3, 1, 1], [2, 3, 2, 1]].map(([c, r, w, h]) => ({ cx: BO + c * (BU + BG) + (w * BU + (w - 1) * BG) / 2, cy: BO + r * (BU + BG) + (h * BU + (h - 1) * BG) / 2, w: w * BU + (w - 1) * BG, h: h * BU + (h - 1) * BG }));
  const tiles = TILES.map((T, i) => {
    const el = mk(camEl, { left: 0, top: 0, width: 10, height: 10, overflow: 'hidden', boxShadow: '0 14px 34px rgba(0,0,0,.14)', display: 'none', zIndex: i === 0 ? 5 : 1 });
    const im = mk(el, { left: 0, top: 0, ...PHOTO(T.key, { size: '100% 100%' }) });
    return { T, el, im, i };
  });
  function placeTile(tl, cxp, cyp, w, h, r, extra = {}) {
    const k = Math.max(w, h) / tl.T.S, iw = IMGEL[tl.T.key].naturalWidth * k, ih = IMGEL[tl.T.key].naturalHeight * k;
    Object.assign(tl.el.style, { width: w + 'px', height: h + 'px', borderRadius: r + 'px', transform: `translate(${cxp - w / 2}px,${cyp - h / 2}px) scale(${extra.sx ?? 1},${extra.sy ?? 1})`, transformOrigin: '50% 50%' });
    Object.assign(tl.im.style, { width: iw + 'px', height: ih + 'px', left: (w / 2 - tl.T.fx * k) + 'px', top: (h / 2 - tl.T.fy * k) + 'px' });
  }
  function updateTiles(t) {
    const on = t >= 3.15 && t < 8.04;
    if (!on) { tiles.forEach(x => { x.el.style.display = 'none'; }); return; }
    tiles[0].el.style.display = 'block';
    // T0: disc -> square -> grid centre -> bento tile 0
    const t0 = tiles[0], b0 = BENTO[0];
    const w0 = 600 + (GRID_G - 600) * sp(t, 4.5) + (b0.w - GRID_G) * sp(t, 6.5);
    const r0 = 300 + (44 - 300) * sp(t, 4.0) + (40 - 44) * sp(t, 6.5) - 40 * sp(t, T_ZOOM);
    const cx0 = C + (b0.cx - C) * sp(t, 6.5), cy0 = C + (b0.cy - C) * sp(t, 6.5);
    placeTile(t0, cx0, cy0, w0, w0, Math.max(0, r0));
    tiles.slice(1).forEach(tl => {
      const i = tl.i, plus = i <= 4, ts = plus ? 5.5 + 0.05 * (i - 1) : 6.0 + 0.05 * (i - 5), u = sp(t, ts, 'default'), bt = 6.5 + 0.035 * i, bu = sp(t, bt, 'default');
      const [gx, gy] = cell(...CELL[i]), bb = BENTO[i];
      const cxp = C + (gx - C) * u + (bb.cx - gx) * bu, cyp = C + (gy - C) * u + (bb.cy - gy) * bu;
      const w = GRID_G + (bb.w - GRID_G) * bu, h = GRID_G + (bb.h - GRID_G) * bu;
      const horiz = i === 2 || i === 4, vert = i === 1 || i === 3, k0 = 0.1;
      const sx = (horiz || !plus) ? lerp(k0, 1, clamp(u)) : 1, sy = (vert || !plus) ? lerp(k0, 1, clamp(u)) : 1;
      tl.el.style.display = u > 0.002 ? 'block' : 'none';
      placeTile(tl, cxp, cyp, w, h, 36, { sx, sy });
    });
  }

  // ---------- cursor, iris ----------
  CURSEGS.push({ a: 2.2, b: T_DROP, space: 'world',
    x: [{ t: 0, v: 1200 }, { t: 2.25, v: 770 }, { t: 7.0, v: 468 }], y: [{ t: 0, v: 1320 }, { t: 2.25, v: 748 }, { t: 7.0, v: 468 }], press: [[2.5, 2.64], [7.5, 7.64]] });
  const IR = 330, IRC = { k: 260, c: 34 };
  function updateIris(t) {
    let a, rot;
    if (t < 3.5) { const c = sp(t, 2.75, IRC); a = IR * 1.4 * (1 - c); rot = 30 * c; if (t < 2.75) a = IR * 1.4; }
    else { const o = sp(t, 3.5, 'snappy'); a = IR * 1.4 * o; rot = 30 - 30 * o; }
    setIris(C, C, IR, Math.max(a, 0), rot);
  }
  window.wmPillCenter = () => { const g = pillGeom(1, 0), f = 0, P = dotL + dotW / 2, leftX = P - (P - X0) * f, shift = C - (leftX + dotL + g.w) / 2; return [dotL + shift + g.w / 2, dotBottom - g.h / 2]; };
  return t => { updateWordmark(t); updateTiles(t); updateIris(t); };
}
