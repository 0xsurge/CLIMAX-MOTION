# Vivox "Meet Rachel" v2: review log
Final: 1930 frames, 32.17 s (60 beats at 112.01 BPM), 1920x1080 @60 fps, H.264 yuv420p CRF 16, 4-subframe motion blur, 8 chunks joined losslessly.
Audio: Mixkit #440 "Infinity", first low hit on beat 15 ("Meet Rachel"), downloaded Mixkit effects on the film's B table. -14.4 LUFS, -2.5 dBTP.

## What v2 changes (the four notes: smooth motion, centring, hierarchy, moving light)
- Carrier: a three.js glass orb (Neutral tone mapping; ACES pushed the brand blue toward violet). It becomes the "check." and "Rachel*"
  pills, swallows the pile of reports, grows out of the collapsing dashboard, rests on the dot field, splits onto the logo's two loops.
- One camera: spring keys and a centred sway; push-ins on the dashboard's "Business activity risk" and "Address analysis".
- Type: centred flex lines on three levels (display 128 px Inter 700, support 44 px, labels 22 px tracked capitals).
- Light: rim passes on the dashboard and the CTA, sweeps on scene changes, self-drawing glowing frames, a light round the ring, a wave in the dot field.

## Checks (flow_check.py)
- Pops: 0. Stillness: 0 stretches of 0.25 s or more.
- Jerks: 4. Two are the intended camera punch on the drop (8.03 s, 8.15 s); 14.48 s (the portrait snapping away as the frame grows) and
  28.02 s (the orb splitting) are small snaps at scene changes.
- Centre (measured per element on the last frame): logo 957.5, CTA 959, label 959.5 (frame centre 960).

## Fixed during review
1. Camera x had no start key: everything sat 260 px right of centre until beat 29.
2. The orb read lavender/purple: darker base colour, fewer reflections, Neutral tone mapping.
3. The dashboard's rim-light layer was drawn over the card: moved behind it.
4. Pill slivers showed through hidden lines (a visible child inside a hidden parent).
5. The skills list switched grey to blue in one frame (a pop at 12.18 s): colour and size now ride springs.
