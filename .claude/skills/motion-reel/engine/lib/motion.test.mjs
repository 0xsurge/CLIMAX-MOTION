// node motion.test.mjs: checks the properties the house rules depend on.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const M = createRequire(import.meta.url)('./motion.js');
const peak = p => Math.max(...Array.from({ length: 4000 }, (_, i) => M.spring(i / 1000, p)));
assert.equal(M.spring(-1), 0); assert.equal(M.spring(0), 0);
for (const p of Object.keys(M.PRESETS)) assert.ok(Math.abs(M.spring(5, p) - 1) < 1e-3, p + ' settles');
assert.ok(peak('heavy') <= 1.0005, 'heavy has no overshoot (type)');
assert.ok(peak('default') < 1.02 && peak('snappy') < 1.04, 'UI overshoot is tiny');
assert.ok(peak('playful') > 1.15, 'playful visibly overshoots');
// track: retargeting mid-flight is continuous in value and does not restart.
const keys = [{ t: 0, v: 0 }, { t: 0.2, v: 100 }, { t: 0.5, v: 40 }];
const e = 1e-6;
assert.ok(Math.abs(M.track(0.5 - e, keys) - M.track(0.5 + e, keys)) < 1e-2, 'continuous at retarget');
assert.ok(Math.abs(M.track(9, keys) - 40) < 0.05, 'settles on last target');
// indicator: leading edge moves first so the pill stretches.
const st = [{ t: 0, x: 0, w: 50 }, { t: 0, x: 200, w: 50 }].map((s, i) => ({ ...s, t: i ? 0.1 : 0 }));
const mid = M.indicator(0.14, st);
assert.ok(mid.w > 50, 'stretches while travelling');
assert.ok(Math.abs(M.indicator(5, st).x - 200) < 0.1);
// swapAlpha: in after tIn, out before the next morph.
assert.equal(M.swapAlpha(0.99, 1, 2), 0); assert.ok(M.swapAlpha(1.5, 1, 2) > 0.99); assert.equal(M.swapAlpha(2.2, 1, 2), 0);
// loopT and seeded noise are pure.
assert.equal(M.loopT(5, 5), 0); assert.equal(M.loopT(-1, 5), 4);
const a = M.mulberry32(7), b = M.mulberry32(7); assert.equal(a(), b());
console.log('motion.js ok');
