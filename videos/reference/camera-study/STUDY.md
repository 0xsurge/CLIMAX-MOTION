# Camera study: the Instagram "Save Reminders" concept film

The user sent this as the best camera work they have seen. It is 1080x810, 30 fps, 30.4 s long, with a voiceover
("See it, like it, save it, scroll…") and music at 136 BPM, mixed to -13.8 LUFS. The clip is kept locally in `v/C1.mp4`
(git-ignored).

## How it was measured
- `flow.json` holds the camera motion for every frame. For each pair of frames, tracked feature points give one
  similarity transform (pan x, tilt y, zoom, roll), using RANSAC so that animation inside the frame does not count
  as camera motion. The script is in the session scratchpad; it is also described in `.claude/skills/camera-style`.
- `graphs.png` plots pan, tilt, speed, zoom rate and roll over the whole film. Orange lines mark the cuts.
- `easing.png` and `fit.png` show the speed profile around each move, fitted two ways: a bell curve, and
  exponential tails on both sides of the peak.
- `sheets/` holds the contact sheets (2 fps for the whole film, 7.5 to 15 fps through the big moves).

## What the camera does
1. **Flat 2D only. Zero roll, no perspective.** Roll stays at 0° on every frame outside the cuts. The spikes in
   the graph are single-frame artefacts of the cuts. The camera never orbits, never tilts a card in 3D, never leans
   the frame. It only pans, tilts and zooms over flat layouts, so every text block and UI card stays square and
   undistorted, before, during and after a move. This is what the user noticed.
2. **The easing is an exponential ease-in-out, not a spring.** On the clean moves (12.3 s, 18.4 s) the speed curve
   is a sharp cusp with exponential tails on both sides. The fit error is 0.7 for exponential tails against 3.9 for
   a bell curve. The camera creeps off, reaches full speed for about 0.1 s, then glides into place.
   - **Fast moves** (pans and whips): τ ≈ 0.08–0.15 s on each side. About 0.8 s in total. Peaks of 120–230 px per
     frame at 1080p.
   - **Slow moves** (feed scrolls): τ ≈ 0.28–0.32 s, symmetric. About 2.5 s in total. Peaks of about 45 px per frame.
   - **A long settle into a hold** (at 15.0 s): it starts at full speed out of a cut, then decelerates with
     τ ≈ 1 s, a pure ease-out.
   - Some moves accelerate straight into a cut (peak at 90–100% of the move). The cut hides the stop, and the next
     shot starts moving at full speed. This is a speed-matched whip.
3. **The camera holds between moves.** 42% of frames have the camera nearly still (under 3 px per frame), but
   the content keeps animating. The pattern is move, land, read, move.
4. **Pace.** In the first 19 s there is a camera move every 0.5–1.5 s: 16 moves in 19 s. They come in bursts of
   three or four fast moves, then a slow scroll. From 19 s to 30 s the camera is almost still, with one slow
   push-in (×1.4 over 2.1 s) for the emotional close. The music drops to near silence at 20 s at the same moment.
5. **Zoom does as much work as pan.** Zooms run from ×0.64 to ×1.74 in a single move.
   - The camera dives into a small UI element: the bookmark icon at 9.5 s grows into the reminder card.
   - It pulls out to show context.
   - Zoom and pan run on the same curve, so it zooms towards a point rather than zooming and then panning.
6. **Directional motion blur on fast moves**, sized to the speed: a heavy horizontal smear on whips and vertical
   blur on scroll moves. It is gone the moment the camera lands. Text also enters with blur.
7. **Every rest frame is centred.** When the camera lands, the subject group is exactly centred, or sits
   deliberately on a third with its pair on the other side ("And done..!" next to the bookmark).
   - **Statement cards:** "And just like that…", COLLECTION, "But, what if", "Instagram's gonna" sit on true centre.
   - **Feed cards:** each lands centred, then the next one scrolls up into the same slot.
8. **The transitions are motivated:**
   - a whip pan through a dense image grid (4.5–6.4 s, about 4,300 px of travel);
   - a vertical page scroll;
   - a dive into an icon;
   - an object turning into the next scene (the bookmark becomes the logo-like "done" mark).
   Hard cuts happen only at the peak of a whip, where blur hides them.
9. **Camera moves follow the voiceover phrases, not the beat.** The median offset from the beat (0.13 s) is no
   better than chance. Each move starts as a phrase starts.
