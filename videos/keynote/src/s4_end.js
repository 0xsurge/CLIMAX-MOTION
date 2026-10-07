// s4_end.js: t 22.7 .. 27. One black shape keeps morphing (Brief sent -> Designing -> On its way -> Live), the Live circle floods the frame,
// holds black for a beat, contracts onto the framed print on the wall, the iris opens onto it and closes, the frame floods and
// contracts into the pill, which hands over to the wordmark (s1) so the last frame equals the first.
const ORD = [22.75, 23.25, 23.75, 24.25];                 // Brief sent, Designing, On its way, Live
const T_FLOOD = 24.55, T_HOLD_END = 25.25, T_IRIS_OPEN = 25.55, T_IRIS_CLOSE = 25.95, T_FLOOD2 = 26.05, T_TOPILL = 26.2, T_HAND = 26.4;
const PRINT_C = [740, 650];                                 // framed print centre on the wall
const ST = [   // geometry of the status shape per state: centre (world), size
  { c: window.CTA_WORLD, w: 300, h: 72 },
  { c: [window.CTA_WORLD[0] - 70, window.CTA_WORLD[1] - 6], w: 360, h: 92 },
  { c: [window.CTA_WORLD[0] - 130, window.CTA_WORLD[1] - 16], w: 470, h: 104 },
  { c: [window.CTA_WORLD[0] - 170, window.CTA_WORLD[1] - 36], w: 600, h: 128 },
  { c: [window.CTA_WORLD[0] - 190, window.CTA_WORLD[1] - 70], w: 150, h: 150 }];
const stateKeys = f => ST.map((s, i) => ({ t: i === 0 ? 0 : ORD[i - 1], v: f(s), spring: i === 4 ? 'snappy' : 'default' }));
window.LIVE_C = ST[4].c;
const CK = { stroke: '#fff', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };

function buildS4() {
  // ---------- the status shape (world layer, above the window) ----------
  const st = mk(camEl, { left: 0, top: 0, width: 300, height: 72, background: INK, overflow: 'hidden', display: 'none', zIndex: 20, boxShadow: '0 24px 50px rgba(0,0,0,.28)' });
  const inner = mk(st, { left: 0, top: 0, width: 600, height: 140 });
  const g0 = mk(inner, { left: 0, top: 0, width: 600, height: 140 }, `<div style="left:0;top:0;width:600px;height:140px;line-height:140px;text-align:center;color:#fff;font-weight:600;font-size:26px;font-family:${GEIST};white-space:nowrap">Start a project</div>`);
  const g1 = mk(inner, { left: 0, top: 0, width: 600, height: 140 }, `<svg width="60" height="60" viewBox="0 0 60 60" style="position:absolute;left:150px;top:40px"><circle cx="30" cy="30" r="26" stroke="#fff" stroke-width="4" fill="none"/><path id="ck1" d="M18 31l8 8 16-17" ${Object.entries(CK).map(([k, v]) => `${k}="${k === 'stroke-width' ? 4.5 : v}"`).join(' ')} pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg><div style="left:226px;top:0;height:140px;line-height:140px;color:#fff;font-weight:600;font-size:32px;font-family:${GEIST};white-space:nowrap">Brief sent</div>`);
  const g2 = mk(inner, { left: 0, top: 0, width: 600, height: 140 }, `<div style="left:104px;top:0;height:140px;line-height:140px;color:#fff;font-weight:600;font-size:30px;font-family:${GEIST};white-space:nowrap">Designing</div><div style="left:286px;top:60px;width:150px;height:14px;border-radius:7px;background:rgba(255,255,255,.22)"></div><div id="pbar" style="left:286px;top:60px;width:0px;height:14px;border-radius:7px;background:#fff"></div><div id="pnum" style="left:450px;top:0;height:140px;line-height:140px;color:#fff;font-weight:600;font-size:30px;font-family:${GEIST};font-variant-numeric:tabular-nums;white-space:nowrap">0%</div>`);
  const g3 = mk(inner, { left: 0, top: 0, width: 600, height: 140 }, `<div style="left:64px;top:22px;color:#fff;font-weight:600;font-size:30px;font-family:${GEIST};white-space:nowrap">On its way</div><svg width="600" height="140" viewBox="0 0 600 140" style="position:absolute;left:0;top:0"><path d="M72 104 C 190 76, 270 118, 390 92 S 500 90 530 100" stroke="rgba(255,255,255,.45)" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round" fill="none"/><circle cx="72" cy="104" r="8" fill="#fff"/><path d="M530 84a14 14 0 1 1 .01 0z" fill="#fff"/><circle id="van" cx="72" cy="104" r="11" fill="#fff"/></svg>`);
  const g4 = mk(inner, { left: 0, top: 0, width: 600, height: 140 }, `<svg width="80" height="80" viewBox="0 0 60 60" style="position:absolute;left:260px;top:30px"><path id="ck4" d="M14 31l11 11 21-23" stroke="#fff" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`);
  const groups = [g0, g1, g2, g3, g4];
  const ck1 = g1.querySelector('#ck1'), pbar = g2.querySelector('#pbar'), pnum = g2.querySelector('#pnum'), van = g3.querySelector('#van'), ck4 = g4.querySelector('#ck4');
  const vanPath = g3.querySelector('path'); const vanLen = vanPath.getTotalLength();

  // ---------- the wall: stand-in photograph + the framed print ----------
  const wallBg = mk(L.wall, { left: 0, top: 0, width: W, height: W, background: '#9aa28f' });
  { const im = IMGEL.corridor, k = W / im.naturalHeight, ww = im.naturalWidth * k; mk(wallBg, { left: -(ww - W) * 0.88, top: 0, width: ww, height: W, backgroundImage: `url(${IMGS.corridor})`, backgroundSize: '100% 100%', filter: 'saturate(.9) brightness(.98)' }); }
  const FW = 520, FH = 680, FX = PRINT_C[0] - FW / 2, FY = PRINT_C[1] - FH / 2;
  mk(wallBg, { left: FX + 24, top: FY + 44, width: FW, height: FH, background: 'rgba(25,30,20,.34)', filter: 'blur(26px)' });
  const frame = mk(wallBg, { left: FX, top: FY, width: FW, height: FH, background: '#0b0b0b', boxShadow: '0 2px 6px rgba(0,0,0,.4), inset 0 0 0 2px #262626' });
  const fmat = mk(frame, { left: 28, top: 28, width: FW - 56, height: FH - 56, background: '#F6F3ED', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08), inset 0 3px 8px rgba(0,0,0,.12)' });
  const fart = mk(fmat, { left: 52, top: 52, width: FW - 56 - 104, height: FH - 56 - 104, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(0,0,0,.18)' });
  mk(fart, { left: -110, top: 0, width: 1500, height: FH - 160, backgroundImage: `url(${IMGS.corridor})`, backgroundSize: 'auto 100%', backgroundPosition: '20% 0', filter: GOLD });
  mk(fart, { left: 0, top: 0, width: FW - 160, height: FH - 160, background: 'rgba(255,170,70,.22)', mixBlendMode: 'multiply' });

  const IRC2 = { k: 260, c: 34 }, IRR = 460;
  function setFloodRect(cx, cy, w, h) { if (w < 2) { floodEl.style.display = 'none'; return; } floodEl.style.display = 'block'; Object.assign(floodEl.style, { left: cx - w / 2 + 'px', top: cy - h / 2 + 'px', width: w + 'px', height: h + 'px', borderRadius: Math.min(w, h) / 2 + 'px' }); }

  return t => {
    // ----- the status shape -----
    const on = t >= 22.72 && t < T_FLOOD + 0.35; show(st, on);
    if (on) {
      const cx = track(t, stateKeys(s => s.c[0])), cy = track(t, stateKeys(s => s.c[1])), w = track(t, stateKeys(s => s.w)), h = track(t, stateKeys(s => s.h));
      Object.assign(st.style, { width: w + 'px', height: h + 'px', borderRadius: Math.min(w, h) / 2 + 'px', transform: `translate(${cx - w / 2}px,${cy - h / 2}px)` });
      Object.assign(inner.style, { left: w / 2 - 300 + 'px', top: h / 2 - 70 + 'px' });
      groups.forEach((g, i) => {
        const a = i === 0 ? 1 - sp(t, ORD[0], 'snappy') : swapAlpha(t, ORD[i - 1] + 0.1, i < 4 ? ORD[i] - 0.06 : 99, 0.14, 0.08);
        g.style.opacity = a; g.style.visibility = a < 0.01 ? 'hidden' : 'visible'; g.style.transform = `translateY(${(1 - Math.min(1, a)) * 14}px)`;
      });
      ck1.style.strokeDashoffset = 1 - clamp((t - ORD[0] - 0.12) / 0.28);
      const pr = sp(t, ORD[1] + 0.1, 'heavy'); pbar.style.width = 150 * 0.64 * pr + 'px'; pnum.textContent = Math.round(64 * pr) + '%';
      const run = sp(t, ORD[2] + 0.1, { k: 26, c: 9 }), pt = vanPath.getPointAtLength(vanLen * clamp(run)); van.setAttribute('cx', pt.x); van.setAttribute('cy', pt.y);
      ck4.style.strokeDashoffset = 1 - clamp((t - ORD[3] - 0.12) / 0.3);
    }
    // ----- the Live circle floods the frame, holds black, contracts onto the print -----
    const camF = camera(T_FLOOD), FC = toScreen(window.LIVE_C[0], window.LIVE_C[1], camF), r0 = 75 * camF.s;
    if (t >= T_FLOOD && t < T_HOLD_END) { const u = sp(t, T_FLOOD, 'snappy'); setFlood(FC[0], FC[1], r0 + (FLOOD_R - r0) * u); }
    else if (t >= T_HOLD_END && t < T_IRIS_OPEN) { const u = sp(t, T_HOLD_END, 'default'); setFlood(lerp(FC[0], PRINT_C[0], u), lerp(FC[1], PRINT_C[1], u), IRR + (FLOOD_R - IRR) * (1 - u)); }
    else if (t >= T_FLOOD2 && t < T_TOPILL) { const u = sp(t, T_FLOOD2, 'snappy'); setFlood(PRINT_C[0], PRINT_C[1], IRR + (FLOOD_R - IRR) * u); }
    else if (t >= T_TOPILL && t < T_HAND) { const u = sp(t, T_TOPILL, 'snappy'), pc = window.wmPillCenter(); setFloodRect(lerp(PRINT_C[0], pc[0], u), lerp(PRINT_C[1], pc[1], u), lerp(2 * FLOOD_R, 420, u), lerp(2 * FLOOD_R, 205, u)); }
    else floodEl.style.display = 'none';
    show(L.wall, t >= 24.88 && t < 26.2);
    // ----- the same iris: opens onto the print, closes again -----
    if (t >= T_IRIS_OPEN && t < T_FLOOD2 + 0.12) {
      let a, rot;
      if (t < T_IRIS_CLOSE) { const o = sp(t, T_IRIS_OPEN, 'snappy'); a = IRR * 1.4 * o; rot = 30 - 30 * o; }
      else { const c = sp(t, T_IRIS_CLOSE, IRC2); a = IRR * 1.4 * (1 - c); rot = 30 * c; }
      setIris(PRINT_C[0], PRINT_C[1], IRR, Math.max(0, a), rot);
    }
  };
}
