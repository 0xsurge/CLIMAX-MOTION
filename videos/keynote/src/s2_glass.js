// s2_glass.js: t 8.0 (the drop) .. 16.5. Glass word -> droplet -> toolbar -> slider -> lens -> orb -> lock screen -> player -> phone.
const POP = { k: 420, c: 20 };    // glass pop-in: visible overshoot
const KNOBSP = { k: 60, c: 16 };
const SX = 280, SW = 880, SY = 930;                       // slider geometry
const knobProg = t => track(t, [{ t: 0, v: 0.05 }, { t: 11.1, v: 0.9, spring: KNOBSP }]);
const knobX = t => SX + 70 + (SW - 140) * knobProg(t);
const T_PHONE = 15.5;
const PHONE = { l: 380, r: 380, t: 70, b: 70, rad: 96 };   // screen insets of the phone (in L.scr coordinates)

// glass-phase cursor: screen space
CURSEGS.push({ a: 8.01, b: 13.3, space: 'screen',
  x: [{ t: 0, v: 720 }, { t: 10.05, v: 720 }, { t: 10.75, v: SX + 70 + (SW - 140) * 0.05 }, { t: 11.1, v: SX + 70 + (SW - 140) * 0.9, spring: KNOBSP }],
  y: [{ t: 0, v: 720 }, { t: 10.05, v: 1225 }, { t: 10.75, v: SY }], press: [[10.5, 10.62], [11.0, 13.0]] });

function buildS2() {
  // the phone wrapper: bezel + screen; the screen is L.scr, clipped to a phone shape from T_PHONE
  const PH = mk(STAGE, { left: 0, top: 0, width: W, height: W, transformOrigin: '50% 50%' }); STAGE.insertBefore(PH, L.top);
  const bezel = mk(PH, { left: 0, top: 0, width: 10, height: 10, background: '#0b0b0c', display: 'none', boxShadow: '0 40px 80px rgba(0,0,0,.30)' });
  PH.appendChild(L.scr);
  const mainBg = makeBg(L.scr);

  // ---------- glass word ----------
  const WORD = 'Studio', FSZ = 230, flds = [...WORD].map(ch => glyphField(ch, '800', FSZ, 'expanded', 30));
  const totalAdv = flds.reduce((a, f) => a + f.adv, 0); let ax = C - totalAdv / 2;
  const letters = flds.map((f, i) => { const o = { f, x: ax - f.pad, y: 560 - f.h / 2, g: GlassGlyph(L.scr, f, 46) }; ax += f.adv; return o; });

  // ---------- droplet / toolbar / slider, knob / lens / orb ----------
  const gMain = Glass(L.scr), gKnob = Glass(L.scr);
  const ICN = ['sun', 'crop', 'adjust', 'filter', 'markup'];
  const ICONS = {
    sun: '<circle cx="12" cy="12" r="4.4" fill="none" stroke="#fff" stroke-width="2"/>' + Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<path d="M${12 + Math.cos(a) * 7.6} ${12 + Math.sin(a) * 7.6}L${12 + Math.cos(a) * 10} ${12 + Math.sin(a) * 10}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`; }).join(''),
    crop: '<path d="M7 2v15h15M2 7h15v15" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>',
    adjust: '<g fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round"><path d="M4 7h9M18 7h2M4 17h2M11 17h9"/><circle cx="15.5" cy="7" r="2.4"/><circle cx="8.5" cy="17" r="2.4"/></g>',
    filter: '<g fill="none" stroke="#fff" stroke-width="2"><circle cx="9" cy="9" r="5.6"/><circle cx="15.4" cy="9" r="5.6"/><circle cx="12.2" cy="14.8" r="5.6"/></g>',
    markup: '<path d="M4 20l4-1 11-11-3-3L5 16z M14 6l3 3" fill="none" stroke="#fff" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/>' };
  const capsule = mk(L.scr, { left: 0, top: 0, width: 196, height: 142, borderRadius: 71, background: 'rgba(255,255,255,.26)', boxShadow: 'inset 0 0 0 1.2px rgba(255,255,255,.4)', display: 'none' });
  const icons = ICN.map(n => mk(L.scr, { left: 0, top: 0, width: 64, height: 64, display: 'none' }, `<svg width="64" height="64" viewBox="0 0 24 24" style="position:absolute;left:0;top:0">${ICONS[n]}</svg>`));
  const fillL = mk(L.scr, { left: 0, top: 0, width: 10, height: 12, borderRadius: 6, background: 'rgba(255,255,255,.92)', display: 'none' });
  const fillR = mk(L.scr, { left: 0, top: 0, width: 10, height: 12, borderRadius: 6, background: 'rgba(255,255,255,.28)', display: 'none' });
  // the next photo opens inside the orb as a circle (screen-aligned, so it becomes the lock-screen wallpaper)
  const rev = mk(L.scr, { left: 0, top: 0, width: 10, height: 10, borderRadius: 5, overflow: 'hidden', display: 'none' });
  const revIm = mk(rev, { left: 0, top: 0, width: W, height: W, ...PHOTO('towers', { size: 'auto 100%', pos: '50% 50%' }) });
  { const b = BGIMG.towers, im = IMGEL.towers; Object.assign(revIm.style, { backgroundSize: '100% 100%', width: im.naturalWidth * b.k + 'px', height: im.naturalHeight * b.k + 'px', backgroundImage: `url(${IMGS.towers})` }); }

  // ---------- lock screen ----------
  const dateBox = mk(L.scr, { left: C - 300, top: 150, width: 600, height: 64, overflow: 'hidden', display: 'none' });
  const dateTx = mk(dateBox, { left: 0, top: 0, width: 600, textAlign: 'center', color: '#fff', fontFamily: GEIST, fontWeight: 500, fontSize: 46, lineHeight: '64px', textShadow: '0 2px 14px rgba(0,0,0,.35)', whiteSpace: 'nowrap' }, 'Tuesday, 7 October');
  const CLK = '9:41', cflds = [...CLK].map(ch => glyphField(ch, '800', 290, 'expanded', 28));
  const ctot = cflds.reduce((a, f) => a + f.adv, 0); let cx0 = C - ctot / 2;
  const clock = cflds.map((f, i) => { const o = { f, x: cx0 - f.pad, y: 250, g: GlassGlyph(L.scr, f, 40) }; cx0 += f.adv; return o; });
  const gBar = Glass(L.scr);
  const player = mk(L.scr, { left: 0, top: 0, width: 640, height: 230, display: 'none' });
  const art = mk(player, { left: 28, top: 28, width: 120, height: 120, borderRadius: 26, ...PHOTO('corridor', { size: 'auto 100%', pos: '55% 50%' }), boxShadow: '0 8px 20px rgba(0,0,0,.25)' });
  mk(player, { left: 172, top: 36, color: '#fff', fontFamily: GEIST, fontWeight: 600, fontSize: 34, whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,.3)' }, 'Studio Mix');
  mk(player, { left: 172, top: 82, color: 'rgba(255,255,255,.78)', fontFamily: GEIST, fontWeight: 500, fontSize: 26, whiteSpace: 'nowrap' }, 'Armab · Our work');
  mk(player, { left: 28, top: 172, width: 584, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.3)' });
  const pf = mk(player, { left: 28, top: 172, width: 100, height: 8, borderRadius: 4, background: '#fff' });
  const ctl = mk(player, { left: 440, top: 44, width: 180, height: 70 }, `<svg width="180" height="70" viewBox="0 0 180 70" style="position:absolute;left:0;top:0"><path d="M16 18v34l22-17z M38 18v34l22-17z" fill="#fff"/><rect x="82" y="16" width="9" height="38" rx="3" fill="#fff"/><rect x="99" y="16" width="9" height="38" rx="3" fill="#fff"/><path d="M130 18v34l22-17z M152 18v34l22-17z" fill="#fff" transform="translate(-6 0)"/></svg>`);

  // ---------- phone pull-back: screen clip + bezel ----------
  const pb = () => { const u = sp(T_PHONE, T_PHONE); return u; };
  function updatePhone(t) {
    const u = sp(t, T_PHONE, 'default'), l = PHONE.l * u, r = PHONE.r * u, tp = PHONE.t * u, b = PHONE.b * u, rad = PHONE.rad * u;
    L.scr.style.clipPath = u > 0.001 ? `inset(${tp}px ${r}px ${b}px ${l}px round ${rad}px)` : 'none';
    const bt = 20 * u;
    if (u > 0.001) { show(bezel, true); Object.assign(bezel.style, { left: l - bt + 'px', top: tp - bt + 'px', width: W - l - r + 2 * bt + 'px', height: W - tp - b + 2 * bt + 'px', borderRadius: rad + bt + 'px' }); } else show(bezel, false);
    window.PHONE_U1 = u;
  }

  window.PH = PH;
  return t => {
    const on = t >= T_DROP && t < 24.85; show(L.scr, on); show(PH, on); if (!on) return;
    // ----- the scene behind the glass -----
    const kx = knobX(t);
    BGS.img = t >= 14.5 ? 'towers' : 'corridor';
    BGS.split = t >= 11.0 && t < 14.5 ? kx : -1;
    mainBg.apply(); mainBg.root.style.left = '0px'; mainBg.root.style.top = '0px';
    // ----- glass word, pops letter by letter, then melts to the centre -----
    const melt = sp(t, 9.5, 'snappy');
    letters.forEach((o, i) => {
      const pop = sp(t, 8.0 + 0.2 * i, POP), s = pop * (1 - melt), cxL = o.x + o.f.w / 2;
      o.g.set({ x: lerp(o.x, C - o.f.w / 2, melt), y: lerp(o.y, 560 - o.f.h / 2, melt), s: t < 8.0 + 0.2 * i ? 0 : Math.max(0, s), op: melt > 0.97 ? 0 : 1 });
    });
    // ----- droplet -> toolbar -> slider (one glass shape morphing) -----
    const yC = track(t, [{ t: 0, v: 560 }, { t: 10.0, v: 1225 }, { t: 10.5, v: SY }]);
    const w = track(t, [{ t: 0, v: 150 }, { t: 10.05, v: 1184 }, { t: 10.5, v: SW }]);
    const h = track(t, [{ t: 0, v: 150 }, { t: 9.85, v: 230 }, { t: 10.12, v: 190 }, { t: 10.5, v: 84 }]);
    const scl = track(t, [{ t: 0, v: 80 }, { t: 10.0, v: 62 }, { t: 10.5, v: 40 }]);
    const mainOn = t >= 9.45 && t < 13.4, pop0 = sp(t, 9.45, POP);
    const slOp = 1 - sp(t, 13.05, 'snappy');
    gMain.set({ x: C - w / 2, y: yC - h / 2, w, h, r: Math.min(w, h) / 2, scale: scl, s: t < 10.0 ? Math.max(0.01, pop0) : Math.max(0.01, slOp), origin: `${knobX(t) - (C - w / 2)}px 50%`, op: mainOn ? 1 : 0 });
    // toolbar icons (pop, then all but "adjust" shrink; "adjust" travels to become the knob)
    const knob0 = SX + 70 + (SW - 140) * 0.05;
    icons.forEach((el, i) => {
      const cxI = C + (i - 2) * 238, pop = sp(t, 10.25 + 0.05 * i, POP), gone = sp(t, 10.52 + 0.03 * i, 'snappy');
      let x = cxI, y = yC, s = pop * (1 - gone);
      if (i === 2) { const m = sp(t, 10.5, 'default'); x = lerp(cxI, knob0, m); s = pop * (1 - sp(t, 10.56, 'snappy')); }
      const vis = t >= 10.25 && s > 0.01 && t < 11;
      show(el, vis); if (vis) put(el, { x: x - 32, y: y - 32, s });
    });
    { const m = sp(t, 10.52, 'snappy'), pop = sp(t, 10.3, POP), vis = t >= 10.3 && pop * (1 - m) > 0.01 && t < 11; show(capsule, vis); if (vis) put(capsule, { x: C - 98, y: yC - 71, s: pop * (1 - m) }); }
    // slider track and the knob (a glass lens while held)
    const sliderOn = t >= 10.6 && t < 13.3;
    show(fillL, sliderOn); show(fillR, sliderOn);
    if (sliderOn) {
      const o = sp(t, 10.6, 'default') * Math.max(0, slOp);
      Object.assign(fillL.style, { left: SX + 24 + 'px', top: SY - 6 + 'px', width: Math.max(0, kx - SX - 24) + 'px', transform: `scaleY(${o})` });
      Object.assign(fillR.style, { left: kx + 'px', top: SY - 6 + 'px', width: Math.max(0, SX + SW - 24 - kx) + 'px', transform: `scaleY(${o})` });
    }
    // knob, then orb: radius = lens (it grows while held), then the orb, then it expands over the screen
    const held = hold(t, 11.0, 13.0), lift = sp(t, 13.0, 'default'), expand = sp(t, 14.0, 'default'), kpop = sp(t, 10.56, POP);
    const R = 42 + (78 - 42) * held + (165 - 42) * lift + (1200 - 165) * expand;
    const ox = lerp(kx, C, lift), oy = lerp(SY, 560, lift), orbOn = t >= 10.56 && R < 760 && t < 14.5;
    gKnob.set({ x: ox - R, y: oy - R, w: 2 * R, h: 2 * R, r: R, scale: lerp(90, 120, lift), bevel: Math.min(R * 0.9, lerp(70, 120, lift)), s: t < 10.9 ? Math.max(0.01, kpop) : 1, tint: 'rgba(255,255,255,.06)', op: orbOn ? 1 : 0 });
    // the next photo opens inside the orb, then it is the lock-screen wallpaper
    const rho = Math.max(0, (R - 7) * sp(t, 13.5, 'default')), revOn = t >= 13.5 && t < 14.52;
    show(rev, revOn); if (revOn) { Object.assign(rev.style, { left: ox - rho + 'px', top: oy - rho + 'px', width: 2 * rho + 'px', height: 2 * rho + 'px', borderRadius: rho + 'px' }); revIm.style.transform = `translate(${-(C - 0) + (C - (ox - rho)) - (C - ox) + 0}px,0px)`; { const b = BGIMG.towers; revIm.style.left = (C - b.fx * b.k) - (ox - rho) + 'px'; revIm.style.top = (C - b.fy * b.k) - (oy - rho) + 'px'; revIm.style.transform = 'none'; } }
    // ----- lock screen: date rises, glass clock digits pop, home bar -> player -----
    const dOn = t >= 14.35; show(dateBox, dOn); if (dOn) dateTx.style.transform = `translateY(${(1 - sp(t, 14.4, 'heavy')) * 70}px)`;
    clock.forEach((o, i) => { const s = t < 14.5 + 0.08 * i ? 0 : sp(t, 14.5 + 0.08 * i, POP); o.g.set({ x: o.x, y: o.y, s, op: t >= 14.5 ? 1 : 0 }); });
    const b0 = sp(t, 14.6, 'default'), st = sp(t, 15.0, 'default');
    const bw = lerp(360, 640, st), bh = lerp(14, 230, st), byC = lerp(1345, 1210, st) , br = lerp(7, 56, st);
    gBar.set({ x: C - bw / 2, y: byC - bh / 2, w: bw, h: bh, r: Math.min(br, bh / 2), scale: lerp(14, 52, st), bevel: Math.min(bh / 2, 40), s: t < 14.6 ? 0.01 : 1, op: t >= 14.6 ? 1 : 0 });
    const pOn = t >= 15.15; show(player, pOn); if (pOn) { const e = sp(t, 15.2, POP); put(player, { x: C - 320, y: byC - 115, s: Math.min(1.1, e), op: Math.min(1, e * 3) }); pf.style.width = (584 * (0.18 + 0.02 * (t - 15.2))) + 'px'; }
    updatePhone(t);
  };
}
