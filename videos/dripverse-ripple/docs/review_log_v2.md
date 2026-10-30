# DRIP VERSE "One order" v2: review log
Rebuild for four notes: smooth motion, centre alignment, hierarchy, moving gold light.
Final: 4276 frames, 71.267 s, 1920x1080 @60 fps, H.264 yuv420p CRF 16, 4-subframe motion blur, 8 chunks joined losslessly.
Audio: -14.1 LUFS integrated, -2.5 dBTP; 109 downloaded Mixkit effects on the film's own event times.

## Checks (flow_check.py, new this round)
- Pops: 0 (no hard cuts in the film; every scene change is a card morph plus a light sweep).
- Smoothness: 11 small jerks (max 4.3 px at 480 wide), all at intended snaps: the shoe snapping into the card (2.3 s), the shoe rising (7.0 s),
  the shoe flying into the product page (8.1 s), the tiles pulled into the mark (35.5 s), the wordmark exit (37.5 s), the list opening (39.3 s).
- Stillness: 2 stretches just over the limit, 0.27 s at 37.5 s and 0.28 s at 65.3 s. Not fixed yet.
- Centre: opening 6 px, wordmark 8 px, end lockup 4 px and 2 px from centre (limit 8 px).
- Blank-frame scan: frame 0 is the empty bone stage, a split second before the shoe falls in.

## What changed from v1
1. One camera for the whole film: spring keys and a sway that always returns to centre. No camera restarts, no linear moves.
2. No hard cuts: one carrier card morphs shoe -> photo -> catalogue -> map -> gold light pool -> product page -> size card -> order -> dashboard
   -> receipt icon -> stock chart -> restock photo -> payment -> collage tile -> drop mark -> orders list -> shop card -> hub -> full-frame
   photo -> portrait photo -> drop mark.
3. Centring: statements are centred flex groups; the shoe sits in the measured gap of "One order."; tracked type is balanced.
4. Hierarchy: display / support / label only; one focal point per frame (hero tile, hero row, hero shop card); type scrims when the UI is busy.
5. Gold light: rim passes on the card and the CTA, light sweeps on every scene change, light pools under shoes and the mark, glowing route and
   stock lines with bright heads, an orbiting ring on the hub.
