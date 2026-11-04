// gsap-spring.js: house springs as GSAP eases. Load after motion.js and gsap.min.js.
// springEase(preset) -> { ease, duration }: duration is when the spring has settled (within 0.1%), ease is the closed-form step response.
(function () {
  const settle = p => { let t = 0; while (t < 10) { t += 1 / 240; let ok = true; for (let k = 0; k < 12; k++) if (Math.abs(1 - Motion.spring(t + k / 60, p)) > 1e-3) { ok = false; break; } if (ok) return t; } return t; };
  const cache = {};
  window.springEase = (preset = 'default') => {
    const key = typeof preset === 'string' ? preset : JSON.stringify(preset);
    const d = cache[key] ?? (cache[key] = settle(preset));
    return { duration: d, ease: p => (p >= 1 ? 1 : Motion.spring(p * d, preset)) };
  };
})();

// primeTimeline(tl): call once after the timeline is built, before the first seek. GSAP records some start values (DrawSVG lengths,
// from() values) the first time a tween renders, so without this a frame can paint differently depending on which frames came before it.
// Running to the end and back once makes that setup happen in the same order on every load; after it, every t paints the same.
window.primeTimeline = tl => { tl.progress(1, true); tl.progress(0, true); return undefined; };
