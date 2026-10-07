// s3_stage.js: t 15.5 .. 24.9. The phone, the liquid island, the Mac window that unrolls, drag into Safari, the landing page,
// the hero becoming a framed print on a product card, the pickers, the nav button flying down.
// World coordinates (the camera layer): the Mac window; the phone is placed in world coordinates too (see phonePose).
const WIN = { x: 470, y: 330, w: 960, chrome: 108, ph: 600 };           // window rect; page viewport is ph tall
const CARD = { x: 120, y: 640, w: 720, h: 520 };                         // product card in page coordinates
const SCROLL_END = 560;
const CTA_PAGE = { x: CARD.x + 400, y: CARD.y + 410, w: 300, h: 72 };    // the card's call to action, page coords
const pageToWorld = (px, py, scroll = SCROLL_END) => [WIN.x + px, WIN.y + WIN.chrome + py - scroll];
window.CTA_WORLD = pageToWorld(CTA_PAGE.x + CTA_PAGE.w / 2, CTA_PAGE.y + CTA_PAGE.h / 2);   // centre of the CTA in world coords
const T_ISL0 = 16.5, T_PINCH = 17.0, T_WIN = 17.5, T_LP = 18.0, T_DRAG = 18.55, T_PUSH = 19.05, T_LAND = 19.1, T_SCROLL = 20.0, T_MORPH = 20.5;
const T_PAINT = 21.5, T_SIZE = 22.0, T_FLY = 22.5, T_CLICK = 22.72;
const TAB2 = [WIN.x + 150 + 232 + 111, WIN.y + 31];                       // the Safari tab the wallpaper is dropped on
const PHONE_REST = { x: 320, y: 790 };                                    // phone centre once it has slid aside

// camera pushes (screen-studio): onto the window once the page arrives, onto the CTA for the order states
CAMK.x.push({ t: 19.3, v: 950, spring: 'default' }, { t: 22.6, v: window.CTA_WORLD[0] - 100, spring: 'default' }, { t: 24.95, v: C, spring: 'default' });
CAMK.y.push({ t: 19.3, v: 700, spring: 'default' }, { t: 22.6, v: window.CTA_WORLD[1] - 90, spring: 'default' }, { t: 24.95, v: C, spring: 'default' });
CAMK.s.push({ t: 19.3, v: 1.4, spring: 'default' }, { t: 22.6, v: 1.75, spring: 'default' }, { t: 24.95, v: 1, spring: 'default' });

// the cursor (world space): long-press + drag the wallpaper, scroll, pick a colour, pick a size, press the call to action
const swatchW = i => pageToWorld(CARD.x + 400 + i * 56 + 22, CARD.y + 225 + 22), chipW = i => pageToWorld(CARD.x + 400 + i * 80 + 36, CARD.y + 335 + 22);
CURSEGS.push({ a: 17.9, b: 19.3, space: 'world',
  x: [{ t: 0, v: 760 }, { t: 17.95, v: PHONE_REST.x + 10 }, { t: T_DRAG, v: TAB2[0] }], y: [{ t: 0, v: 1040 }, { t: 17.95, v: PHONE_REST.y }, { t: T_DRAG, v: TAB2[1] }], press: [[T_LP, T_LAND]] });
CURSEGS.push({ a: 19.9, b: 20.6, space: 'world', x: [{ t: 0, v: 960 }], y: [{ t: 0, v: 860 }], press: [] });
CURSEGS.push({ a: 21.0, b: 23.0, space: 'world',
  x: [{ t: 0, v: 1230 }, { t: 21.2, v: swatchW(1)[0] }, { t: 21.75, v: chipW(1)[0] }, { t: 22.5, v: window.CTA_WORLD[0] }], y: [{ t: 0, v: 760 }, { t: 21.2, v: swatchW(1)[1] }, { t: 21.75, v: chipW(1)[1] }, { t: 22.5, v: window.CTA_WORLD[1] }],
  press: [[T_PAINT, T_PAINT + 0.14], [T_SIZE, T_SIZE + 0.14], [T_CLICK, T_CLICK + 0.14]] });

function buildS3() {
  const PH = window.PH;
  // ---------- the phone: pose in world coordinates, composed with the camera ----------
  const islPhone = mk(L.scr, { left: C - 95, top: 96, width: 190, height: 54, borderRadius: 27, background: '#000', display: 'none', zIndex: 9 });
  function phonePose(t) {
    const u1 = window.PHONE_U1 ?? 0, u2 = sp(t, T_WIN, 'default');
    return { cx: C + (PHONE_REST.x - C) * u2, cy: C + (PHONE_REST.y - C) * u2, ps: 1 - 0.08 * u1 - 0.32 * u2 };
  }
  const p2s = (px, py, pose, cam) => toScreen(pose.cx + (px - C) * pose.ps, pose.cy + (py - C) * pose.ps, cam);

  // ---------- the Mac window (world layer) ----------
  const win = mk(camEl, { left: WIN.x, top: WIN.y, width: 68, height: 68, borderRadius: 34, background: INK, overflow: 'hidden', display: 'none', boxShadow: '0 50px 100px rgba(0,0,0,.30), 0 0 0 1px rgba(0,0,0,.10)' });
  const chrome = mk(win, { left: 0, top: 0, width: WIN.w, height: WIN.chrome, opacity: 0 });
  [['#FF5F57', 32], ['#FEBC2E', 62], ['#28C840', 92]].forEach(([c, x]) => mk(chrome, { left: x, top: 24, width: 15, height: 15, borderRadius: 8, background: c }));
  const tabs = [['Photos', 150, false], ['New Tab', 150 + 232, true], ['Notes', 150 + 464, false]].map(([nm, x, on]) => {
    const tb = mk(chrome, { left: x, top: 13, width: 222, height: 36, borderRadius: 10, background: on ? '#fff' : 'rgba(0,0,0,.05)', boxShadow: on ? '0 1px 3px rgba(0,0,0,.12)' : 'none' });
    const lab = mk(tb, { left: 14, top: 9, width: 190, color: '#222', fontFamily: GEIST, fontWeight: 500, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden' }, nm); return { tb, lab };
  });
  const urlBar = mk(chrome, { left: (WIN.w - 600) / 2, top: 61, width: 600, height: 38, borderRadius: 19, background: 'rgba(0,0,0,.06)' });
  const urlTx = mk(urlBar, { left: 0, top: 9, width: 600, textAlign: 'center', fontFamily: GEIST, fontWeight: 500, fontSize: 17, color: '#333' }, '');
  const vp = mk(win, { left: 0, top: WIN.chrome, width: WIN.w, height: WIN.ph, overflow: 'hidden', background: '#FAF8F4' });
  const pc = mk(vp, { left: 0, top: 0, width: WIN.w, height: 1250 });        // page content (scrolls)
  const roll = mk(win, { left: 0, top: 0, width: WIN.w, height: 34, background: 'linear-gradient(180deg,#BDB9B1 0%,#F4F2EE 45%,#CFCAC2 100%)', borderRadius: 17, display: 'none', boxShadow: '0 6px 14px rgba(0,0,0,.25)' });
  // the landing page
  mk(pc, { left: 180, top: 16, width: 600, height: 55.5, ...{ backgroundImage: `url(${IMGS.nav})`, backgroundSize: '100% 100%' } });
  const navBtn = mk(pc, { left: 770, top: 20, width: 170, height: 48, borderRadius: 24, background: INK, display: 'block' }, `<div style="left:0;top:0;width:170px;height:48px;line-height:48px;text-align:center;color:#fff;font-weight:600;font-size:17px;font-family:${GEIST};white-space:nowrap">Start a project</div>`);
  const slot = mk(pc, { left: 40, top: 100, width: 880, height: 420, borderRadius: 22, background: '#E6E1D7' });
  // card
  const card = mk(pc, { left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 36, background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,.10), 0 1px 3px rgba(0,0,0,.08)' });
  mk(card, { left: 400, top: 52, color: INK, fontFamily: ARCH, fontWeight: 800, fontSize: 52, fontVariationSettings: '"wdth" 125', letterSpacing: '-0.03em', whiteSpace: 'nowrap' }, 'Opus');
  mk(card, { left: 402, top: 124, color: '#8A857C', fontFamily: GEIST, fontWeight: 500, fontSize: 24, whiteSpace: 'nowrap' }, 'Project print');
  mk(card, { left: 402, top: 190, color: '#8A857C', fontFamily: GEIST, fontWeight: 500, fontSize: 21 }, 'Frame');
  mk(card, { left: 402, top: 300, color: '#8A857C', fontFamily: GEIST, fontWeight: 500, fontSize: 21 }, 'Size');
  const SW_COL = ['#0A0A0A', '#2F5A43', '#E9E2D3'];
  const swatches = SW_COL.map((c, i) => mk(card, { left: 400 + i * 56, top: 225, width: 44, height: 44, borderRadius: 22, background: c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.14)' }));
  const swRing = mk(card, { left: 394, top: 219, width: 56, height: 56, borderRadius: 28, boxShadow: '0 0 0 3px #0A0A0A' });
  const chipHi = mk(card, { left: 400, top: 335, width: 72, height: 44, borderRadius: 22, background: INK });
  ['S', 'M', 'L'].forEach((nm, i) => mk(card, { left: 400 + i * 80, top: 335, width: 72, height: 44, textAlign: 'center', lineHeight: '44px', fontFamily: GEIST, fontWeight: 600, fontSize: 21, color: '#8A857C' }, nm));
  const chipTx = [...card.children].slice(-3);
  // the print: molding + mat grow out of the photo's edge; the hero is the same element
  const molding = mk(pc, { left: 0, top: 0, width: 10, height: 10, background: '#0A0A0A', boxShadow: '0 12px 24px rgba(0,0,0,.20)', display: 'none' });
  const molding2 = mk(pc, { left: 0, top: 0, width: 10, height: 10, background: '#2F5A43', display: 'none' });
  const mat = mk(pc, { left: 0, top: 0, width: 10, height: 10, background: '#F6F3ED', boxShadow: 'inset 0 3px 8px rgba(0,0,0,.14)', display: 'none' });
  const hero = mk(pc, { left: 0, top: 0, width: 10, height: 10, overflow: 'hidden', display: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,.16)', ...PHOTO('towers') });
  const heroTx = mk(hero, { left: 40, top: 300, color: '#fff', fontFamily: ARCH, fontWeight: 800, fontSize: 78, fontVariationSettings: '"wdth" 125', letterSpacing: '-0.03em', whiteSpace: 'nowrap', textShadow: '0 4px 24px rgba(0,0,0,.4)' }, 'Armab Agency');
  // the nav button that flies down to become the card's call to action
  const flyBtn = mk(vp, { left: 770, top: 20, width: 170, height: 48, borderRadius: 24, background: INK, display: 'none', zIndex: 8 }, `<div style="left:0;top:0;width:100%;height:100%;line-height:48px;text-align:center;color:#fff;font-weight:600;font-size:17px;font-family:${GEIST};white-space:nowrap" class="fb">Start a project</div>`);
  const ctaCard = mk(card, { left: CTA_PAGE.x - CARD.x, top: CTA_PAGE.y - CARD.y, width: 300, height: 72, borderRadius: 36, background: 'transparent' });

  // ---------- goo (the island that stretches, pinches off and flies), the dragged wallpaper, the long-press ring ----------
  const gooBox = mk(L.top, { left: 0, top: 0, width: W, height: W, filter: 'url(#goo)', display: 'none', zIndex: 30 });
  const gA = mk(gooBox, { left: 0, top: 0, width: 10, height: 10, background: '#000' }), gB = mk(gooBox, { left: 0, top: 0, width: 10, height: 10, background: '#000' });
  const ring = mk(L.top, { left: 0, top: 0, width: 20, height: 20, borderRadius: 10, boxShadow: '0 0 0 5px rgba(255,255,255,.85), 0 0 0 7px rgba(0,0,0,.12)', display: 'none', zIndex: 31 });
  const thumb = mk(L.top, { left: 0, top: 0, width: 150, height: 150, overflow: 'hidden', display: 'none', zIndex: 32, boxShadow: '0 30px 60px rgba(0,0,0,.35), 0 0 0 4px rgba(255,255,255,.92)', ...PHOTO('towers') });

  // ---------- helpers ----------
  const scrollAt = t => SCROLL_END * sp(t, T_SCROLL, 'default');
  const HERO = { x: 40, y: 100, w: 880, h: 420, r: 22 };
  const PRINT = { x: CARD.x + 80, y: CARD.y + 100, w: 230, h: 320, r: 4 };      // photo rect in the card, page coordinates
  const grow = t => sp(t, T_MORPH, 'default'), frameU = t => sp(t, T_MORPH + 0.1, 'default');

  return t => {
    const cam = camera(t), pose = phonePose(t);
    // phone placement composed with the camera
    if (t >= 15.4) { const [sx, sy] = toScreen(pose.cx, pose.cy, cam); PH.style.transform = `translate(${sx - C}px,${sy - C}px) scale(${pose.ps * cam.s})`; } else PH.style.transform = 'none';   // before the pull-back the screen is full-bleed: the camera must not touch it
    // island inside the phone (hidden while the goo island stretches, pinches and flies)
    const inGoo = t >= T_ISL0 && t < T_WIN;
    show(islPhone, t >= 16.0 && !inGoo); if (t >= 16.0 && !inGoo) put(islPhone, { x: 0, y: 0, s: Math.max(0.01, sp(t, 16.0, POP)) });
    // ----- goo island -----
    show(gooBox, inGoo);
    if (inGoo) {
      const k = pose.ps * cam.s, [ix, iy] = p2s(C, 96 + 27, pose, cam), st = sp(t, T_ISL0, 'default'), pn = sp(t, T_PINCH, 'snappy');
      const aw = (190 + 190 * st * (1 - pn)) * k, ah = (54 + 14 * st * (1 - pn)) * k, ax = ix + 95 * st * (1 - pn) * k * 0.0;
      Object.assign(gA.style, { width: aw + 'px', height: ah + 'px', borderRadius: ah / 2 + 'px', transform: `translate(${ix - aw / 2 + 95 * st * (1 - pn) * k * 0.0}px,${iy - ah / 2}px)` });
      // the droplet: grows from the island's right end, then pinches off and flies to where the window appears
      const fly = sp(t, T_PINCH, 'default'), tgt = toScreen(WIN.x + WIN.w / 2, WIN.y + 54, cam), sx0 = ix + 95 * k * st, sy0 = iy;
      const bx = lerp(sx0, tgt[0], fly), by = lerp(sy0, tgt[1], fly) - 160 * Math.sin(Math.PI * Math.min(1, fly)) * k, bd = (40 + 30 * st * (1 - fly) + 28 * fly) * k;
      Object.assign(gB.style, { width: bd + 'px', height: bd + 'px', borderRadius: bd / 2 + 'px', transform: `translate(${bx - bd / 2}px,${by - bd / 2}px)`, display: st > 0.02 ? 'block' : 'none' });
    }
    // ----- the window: droplet -> title bar -> unrolls like a blind -----
    const wOn = t >= T_WIN - 0.02 && t < 24.86; show(win, wOn);
    if (wOn) {
      const g = sp(t, T_WIN, 'default'), un = sp(t, 17.85, 'default'), col = sp(t, 17.7, 'snappy');
      const bw = lerp(68, WIN.w, g), bh = lerp(68, WIN.chrome, g) + WIN.ph * un;
      Object.assign(win.style, { width: bw + 'px', height: bh + 'px', borderRadius: lerp(34, 30, g) + 'px', background: mixc('#0A0A0A', '#F2F1EF', col), left: WIN.x + WIN.w / 2 - bw / 2 + 'px', top: WIN.y + 54 - lerp(34, 54, g) + 'px' });
      chrome.style.opacity = sp(t, 17.75, 'snappy'); vp.style.height = WIN.ph * un + 'px';
      const rOn = un > 0.01 && un < 0.985; show(roll, rOn); if (rOn) Object.assign(roll.style, { top: WIN.chrome + WIN.ph * un - 34 + 'px', opacity: 1 });
      // the new tab becomes the page on drop; the page pushes in
      urlTx.textContent = t >= T_PUSH ? 'armabagency.vercel.app' : ''; tabs[1].lab.textContent = t >= T_PUSH ? 'Armab Agency' : 'New Tab';
      pc.style.transform = `translate(${960 * (1 - sp(t, T_PUSH, 'default'))}px,${-scrollAt(t)}px)`;
      // hero (the dropped wallpaper) -> print on the card
      const heroOn = t >= 19.6; show(hero, heroOn); show(mat, heroOn && frameU(t) > 0.01); show(molding, heroOn && frameU(t) > 0.01); show(molding2, heroOn && frameU(t) > 0.01 && t >= T_PAINT);
      show(slot, t >= T_PUSH && !heroOn);
      if (heroOn) {
        const u = grow(t), x = lerp(HERO.x, PRINT.x, u), y = lerp(HERO.y, PRINT.y, u), w = lerp(HERO.w, PRINT.w, u), h = lerp(HERO.h, PRINT.h, u), r = lerp(HERO.r, PRINT.r, u);
        Object.assign(hero.style, { width: w + 'px', height: h + 'px', borderRadius: r + 'px', transform: `translate(${x}px,${y}px)`, backgroundSize: 'cover' });
        heroTx.style.transform = `translateY(${(1 - sp(t, 19.62, 'heavy')) * 130}px) scale(${1 - 0.55 * u})`; heroTx.style.transformOrigin = '0 100%'; heroTx.style.opacity = 1 - clamp(u * 2);   // rises out of the hero's edge, never pops
        const fu = frameU(t), tm = 34 * fu, tf = 14 * fu, sizeBump = 1 + 0.04 * sp(t, T_SIZE, 'snappy') * 0 ;
        const rect = (e, d, c) => Object.assign(e.style, { width: w + 2 * d + 'px', height: h + 2 * d + 'px', transform: `translate(${x - d}px,${y - d}px)`, borderRadius: Math.max(0, r) + 'px' });
        rect(mat, tm); rect(molding, tm + tf); rect(molding2, tm + tf);
        molding2.style.clipPath = `inset(0 ${(1 - sp(t, T_PAINT, 'default')) * 100}% 0 0)`;
        mat.style.zIndex = 2; hero.style.zIndex = 3; molding.style.zIndex = 1; molding2.style.zIndex = 1;
      }
      // pickers
      const sel = t >= T_PAINT ? 1 : 0;
      put(swRing, { x: sp(t, T_PAINT, 'snappy') * 56, y: 0 });
      const cx = indicator(t, [{ t: 0, x: 400, w: 72 }, { t: T_SIZE, x: 480, w: 72 }]); put(chipHi, { x: cx.x - 400, y: 0 }); chipHi.style.width = cx.w + 'px';
      chipTx.forEach((e, i) => { e.style.color = mixc('#8A857C', '#FFFFFF', i === 0 ? 1 - sp(t, T_SIZE, 'snappy') : (i === 1 ? sp(t, T_SIZE, 'snappy') : 0)); });
      // the nav button flies down and becomes the call to action
      const fl = sp(t, T_FLY, 'default'), fOn = t >= T_FLY && t < 22.75; show(navBtn, t < T_FLY); show(flyBtn, fOn);
      if (fOn) {
        const tx = CTA_PAGE.x - 0 - 0, tyv = CTA_PAGE.y - SCROLL_END;
        Object.assign(flyBtn.style, { left: lerp(770, tx, fl) + 'px', top: lerp(20, tyv, fl) + 'px', width: lerp(170, CTA_PAGE.w, fl) + 'px', height: lerp(48, CTA_PAGE.h, fl) + 'px', borderRadius: lerp(24, 36, fl) + 'px' });
        const fb = flyBtn.querySelector('.fb'); fb.style.lineHeight = lerp(48, 72, fl) + 'px'; fb.style.fontSize = lerp(17, 26, fl) + 'px';
      }
    }
    // ----- long-press ring + the dragged wallpaper -----
    const cur = CURSEGS[2];
    const lpOn = t >= T_LP && t < T_DRAG + 0.05, thOn = t >= 18.5 && t < 19.62;
    show(ring, lpOn); show(thumb, thOn);
    if (lpOn || thOn) {
      const seg = CURSEGS.find(g => g.a === 17.9), wx = track(t, seg.x, 'default'), wy = track(t, seg.y, 'default'), [sx, sy] = toScreen(wx, wy, cam);
      if (lpOn) { const r = (26 + 70 * sp(t, T_LP, 'default')) * cam.s; Object.assign(ring.style, { left: sx - r + 'px', top: sy - r + 'px', width: 2 * r + 'px', height: 2 * r + 'px', borderRadius: r + 'px', opacity: 1 - clamp((t - T_LP - 0.35) / 0.2) }); }
      if (thOn) {
        const pop = sp(t, 18.5, POP), land = sp(t, T_LAND, 'default'), hx = WIN.x + HERO.x, hy = WIN.y + WIN.chrome + HERO.y;   // hero rect in world coords at scroll 0
        const w = lerp(150 * Math.max(0.01, pop), HERO.w, land), h = lerp(150 * Math.max(0.01, pop), HERO.h, land);
        const cxw = lerp(wx, hx + HERO.w / 2, land), cyw = lerp(wy, hy + HERO.h / 2, land), [tx, ty] = toScreen(cxw, cyw, cam);
        Object.assign(thumb.style, { width: w * cam.s + 'px', height: h * cam.s + 'px', borderRadius: lerp(34, HERO.r, land) * cam.s + 'px', transform: `translate(${tx - w * cam.s / 2}px,${ty - h * cam.s / 2}px) rotate(${-6 * (1 - land)}deg)`, backgroundSize: 'cover' });
      }
    }
  };
}
