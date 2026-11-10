# Camera study: Bolt concept ad (Matrixedit, "I really nailed this one")

These numbers come from optical flow (`camflow.py` → `flow.json`, 1280×720 at 30 fps, 23.7 s). The contact sheets are
`sheet.png`, `s2.png` and `s3.png`.

## What the camera does
1. **It never stops.** Between scene moves the frame keeps a slow drift of about 20–150 px/s and a slow push-in. It
   only holds still on the final logo (from 21.8 s).
2. **Moves build up gradually and then settle.** Speed rises steadily before each scene move. At 12.0–13.2 s, for
   example, the drift goes 12, 14, 26, 46, 92 and then 495 px/s, roughly doubling every 0.15–0.2 s. The move then
   peaks, which is the whip. It decays a little faster than it built: 1004, 764, 224 and 81 px/s, about 0.15–0.2 s.
   It's an ease-in-out where the ease-in is longer than the ease-out.
3. **The zoom swells with the move.** Zoom rate climbs with the pan speed (for example 4, 7, 15 and then 77%/s) and
   settles with it. The push comes from the move itself, not from a separate quick kick.
4. **Scene moves are 0.4–0.8 s,** and the travel between them is calm. The objects and text keep their own fast
   timing, and the camera carries them.

## How it's built in the Obi reel (`videos/obi-reel/film`)
- `camFlow(t, tc, ti, to)` is an asymmetric exponential ease. The ease-in is `ti`, the ease-out is `to`, and position
  and velocity stay continuous through the peak. Whips use ti 0.2 and to 0.14; slow zooms use ti = tau and
  to = 1.25·tau.
- `creep(t)` adds the drift between moves: 18 px/s that eases off after a few seconds, plus a slow push of 1.5%/s, in
  a direction that alternates from scene to scene. Each scene move hands it over to the next.
- `swell(t)` adds a 5% zoom that follows the speed of each scene move. The 4-frame punch-zooms on those moves were
  replaced by it, and the remaining punches are about 40% smaller.
- **Opening:** the camera starts 32% closer, centred on the first line. It pulls out slowly as "Your product…" lands,
  and runs on real time, so it keeps moving through the product swap.
