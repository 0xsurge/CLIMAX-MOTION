import { spring } from "remotion";

// Spring presets, the same values as the house lib/motion.js (stiffness k, damping c, unit mass).
export const P = {
  snappy: { stiffness: 700, damping: 42 },
  default: { stiffness: 220, damping: 25 },
  heavy: { stiffness: 120, damping: 22 },
  slow: { stiffness: 4, damping: 4 },
  glide: { stiffness: 18, damping: 8.5 },
} as const;
type Cfg = { stiffness: number; damping: number };

// Step response 0 -> 1 starting at time t0 (seconds). 0 before t0.
export const sp = (frame: number, fps: number, t0: number, cfg: Cfg = P.default) => {
  const f = frame - t0 * fps;
  return f <= 0 ? 0 : spring({ frame: f, fps, config: { ...cfg, mass: 1 } });
};

// A value with several targets: one spring per change, each from its own time, never restarted.
export type Key = { t: number; v: number; s?: Cfg };
export const track = (frame: number, fps: number, keys: Key[]) => {
  let v = keys[0].v;
  for (let i = 1; i < keys.length; i++) v += (keys[i].v - keys[i - 1].v) * sp(frame, fps, keys[i].t, keys[i].s ?? P.default);
  return v;
};

// A rise then a fade: light that passes and dies away.
export const bump = (frame: number, fps: number, t0: number, hold = 0.5) =>
  Math.max(0, Math.min(1, sp(frame, fps, t0, P.snappy) - sp(frame, fps, t0 + hold, { stiffness: 120, damping: 20 })));
