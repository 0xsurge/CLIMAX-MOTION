---
name: camera-style
description: The house camera, measured frame by frame from the camera reference the user rates best (an Instagram "Save Reminders" concept film). Flat 2D camera (pan, tilt, zoom; never roll or perspective), exponential ease-in-out moves with a sharp speed peak, holds between moves, zoom-dives into UI, speed-scaled motion blur, centred landings. Use with /launch-style or /motion-reel whenever a film has a camera.
---

# /camera-style

Measured in `videos/reference/camera-study/STUDY.md`, which has the graphs and the fits. Every number below comes
from that measurement.

## 1. Flat camera: nothing ever bends
- The camera only **pans, tilts and zooms** over flat layouts. **Roll stays at 0°. No perspective, no orbit, no
  3D-tilted cards.**
- Text and UI stay square and undistorted at every frame, during the move as well as after it.
- Depth comes from zoom, blur and parallax between flat layers, never from rotating the content.
- If a 3D world sits behind the type, it can move in 3D, but the **type and UI layer stays a flat 2D plane facing
  the lens.**

## 2. The move curve: exponential ease-in-out
- The speed has a sharp peak with exponential tails on both sides: the camera creeps off, reaches full speed for a
  moment, and glides in. Position over one move from 0 to 1, centred on time `tc`, with tail constant `tau`:
  ```js
  // camera move: 0 -> 1, exponential tails, speed peak at tc
  const camMove = (t, tc, tau) => t < tc ? 0.5 * Math.exp((t - tc) / tau) : 1 - 0.5 * Math.exp(-(t - tc) / tau);
  // a value through several keys: sum one move per change (like track(), each starting at its own time)
  const camTrack = (t, keys) => keys.slice(1).reduce((v, k, i) => v + (k.v - keys[i].v) * camMove(t, k.t, k.tau), keys[0].v);
  ```
  `camMove` is continuous and smooth, a pure function of t, with no state.
- **Fast pan or whip:** `tau` 0.08–0.15 s, about 0.8 s visible, peak 120–230 px per frame at 1080p.
- **Slow scroll or reframe:** `tau` 0.28–0.32 s, about 2.5 s visible, peak about 45 px per frame.
- **Settle into a hold:** start at speed out of a cut, then pure ease-out (`tc` = the cut, `tau` ≈ 1 s).
- **Speed-matched whip:** accelerate into a cut at full speed. The next shot starts at the same speed and
  decelerates.
- `tc` is where the eye should be pulled. Put it on the start of a voiceover phrase or a musical accent, so the move
  starts a little before it.
- House rule note: `CLAUDE.md` says springs only. This curve replaces springs for **camera moves only**. UI elements,
  type and buttons keep their springs.

## 3. Rhythm: move, land, hold, move
- In the active part, a camera move every 0.5–1.5 s, in bursts of three or four fast moves and then one slow move.
- Between moves the camera **holds** (in the reference, 42% of frames are nearly still) while the content animates.
  A hold is a landing, not dead time: something on screen always moves.
- The close slows down: the camera nearly stops, with one slow push-in (about ×1.4 over 2 s) while the music falls
  away.

## 4. Zoom does as much as pan
- Zoom range in one move: ×0.65 to ×1.75. Zoom and pan run on the **same** `camMove`, so the camera zooms towards a
  point (it dives into an icon or a button, then the next UI grows out of it).
- Pull out with a zoom to show context, then dive back in.

## 5. Motion blur
- Directional blur that grows with camera speed: about 0 below 10 px per frame, up to roughly 1/4 of the per-frame
  travel at whip speed. Horizontal blur on pans, vertical on scrolls. It must be gone the moment the camera lands.

## 6. Landings are centred
- Every landing frames its subject group on exact centre, or on a deliberate third paired with its partner on the
  other side. Measure it with `flow_check.py --centre` (within 8 px).
- Feed and stack layouts: each item lands in the same slot, and the next one scrolls up into it.

## 7. Transitions the camera makes
- a whip pan through a dense grid or strip of images;
- a vertical page scroll;
- a dive into a UI element;
- an object turning into the next scene.
- Cut only at the peak of a whip, where blur hides it. No crossfades.

## 8. Checklist
- Roll 0° and no perspective on type or UI at every frame?
- Every camera move uses `camMove`, with fast and slow `tau` mixed, and holds between moves?
- Zoom used as much as pan, towards a point?
- Blur scaled to speed and gone on landing?
- Every landing centred (`flow_check.py --centre`)?
