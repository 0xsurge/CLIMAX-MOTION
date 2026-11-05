# Sterling "One key": review log
Built from the approved 12-panel storyboard (review/boards/storyboard.html). 2117 frames, 35.28 s (76 beats at 129.24 BPM), 1920x1080 @60 fps,
H.264 yuv420p CRF 16, 4-subframe motion blur. Song: Mixkit #371 "Cat Walk", started four beats before its lift so the hook is at full energy.
53 downloaded Mixkit effects on the film's B table. -14.4 LUFS, -2.6 dBTP.

## Checks (flow_check.py)
- Pops 0. Centre: lockup 962 (+2 px), end 960 (0 px).
- Stillness: one 0.35 s stretch at 17.27 s (a hold between two focus moves on the verification cards). Not fixed yet.
- Jerks: the verification cards entering fast (15.1-15.35 s) and the camera kicks on the drop and the card: intended.

## Fixed during review
1. The keyhole dive: the key vanished before the aurora filled the frame. Now the camera keeps flying through the real hole (position measured
   from the image's alpha, stretch off during the dive) until the hole outgrows the frame.
2. The hero card popped in at the bottom edge: it starts fully off-frame.
3. The key flashed at keyhole size before flying to card 01: it moves off-frame while hidden.
4. The paper hand-over flashed (flat colour over a gradient page) and hid the next line: same gradient, aligned, hand-over at full cover.
5. The lockup sat 12 px left (camera sway still active): the sway settles at the lockup.
6. Mira's end went still: extra light passes across the three bars.

## Content
All copy is Sterling's and Mira's own words; panel 06's label condenses their sentence about scheduled testing. Real assets: Sterling logo SVG,
"powered by mira" SVG, Zalando Sans Expanded and Public Sans, UI cards and illustrations from sterling.mira.network; Mira's 3D mark renders
and GT Super from mira.network (kept local, not committed).
