// motion.js: closed-form springs. Every function is a pure function of time t (seconds).
// No state, no timers, no easing curves. Works in the browser (window.Motion) and in Node (import/require).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Motion = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  // k = stiffness, c = damping, unit mass. zeta = c / (2 sqrt k): <1 overshoots, 1 is critical.
  const PRESETS = {
    snappy:  { k: 700, c: 42 }, // buttons, toggles, leading edges. ~2% overshoot
    default: { k: 220, c: 25 }, // cards, containers, camera.      ~1% overshoot
    heavy:   { k: 120, c: 22 }, // big type, logo lockups.         no overshoot
    playful: { k: 260, c: 11 }, // mascots only.                   ~30% overshoot
  };
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, u) => a + (b - a) * u;
  const preset = p => (typeof p === 'string' ? PRESETS[p] : p) || PRESETS.default;

  // Step response of a damped spring, 0 -> 1, starting at t = 0. Returns 0 for t <= 0.
  function spring(t, p = 'default') {
    if (t <= 0) return 0;
    const { k, c } = preset(p);
    const w0 = Math.sqrt(k), z = c / (2 * w0);
    if (Math.abs(z - 1) < 1e-4) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
    }
    const s = w0 * Math.sqrt(z * z - 1), r1 = -z * w0 + s, r2 = -z * w0 - s;
    return 1 - (r1 * Math.exp(r2 * t) - r2 * Math.exp(r1 * t)) / (r1 - r2);
  }

  // track(t, keys): a value with several targets. keys = [{ t, v, spring? }, ...] sorted by t.
  // The first key is the starting value. Every later key adds ONE spring that starts at its own time,
  // so a retarget mid-flight never restarts anything and the velocity stays continuous.
  function track(t, keys, defaultSpring = 'default') {
    let v = keys[0].v;
    for (let i = 1; i < keys.length; i++) v += (keys[i].v - keys[i - 1].v) * spring(t - keys[i].t, keys[i].spring || defaultSpring);
    return v;
  }

  // indicator(t, stops): a pill/underline that stretches. stops = [{ t, x, w }] (left edge x, width w).
  // The leading edge (the one moving in the travel direction) rides a stiffer spring than the trailing edge.
  function indicator(t, stops, lead = 'snappy', trail = 'default') {
    let l = stops[0].x, r = stops[0].x + stops[0].w;
    for (let i = 1; i < stops.length; i++) {
      const a = stops[i - 1], b = stops[i], dt = t - b.t;
      const right = (b.x + b.w / 2) >= (a.x + a.w / 2);
      l += (b.x - a.x) * spring(dt, right ? trail : lead);
      r += ((b.x + b.w) - (a.x + a.w)) * spring(dt, right ? lead : trail);
    }
    return { x: l, w: r - l };
  }

  // swapAlpha(t, tIn, tOut): opacity for text inside a morphing box. It enters after the morph starts (tIn)
  // and is gone before the next morph (tOut). Pair it with a small translate or blur; a fade alone is never an enter.
  function swapAlpha(t, tIn, tOut, inDur = 0.16, outDur = 0.09) {
    const ss = x => x * x * (3 - 2 * x);
    return ss(clamp((t - tIn) / inDur)) * (1 - ss(clamp((t - tOut) / outDur)));
  }

  // loopT(t, dur): pin the last frame to the first. Feed every looping value from this.
  const loopT = (t, dur) => ((t % dur) + dur) % dur;

  // Seeded noise only. Never Math.random.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  return { PRESETS, spring, track, indicator, swapAlpha, loopT, mulberry32, clamp, lerp };
});
