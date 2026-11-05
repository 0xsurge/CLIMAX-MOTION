# DRIP VERSE "Pixel Wipe": review log
Style: videos/reference/pixel-wipe-template.md (reverse-engineered from the HyperFrames launch film), gold in place of mint.
Final: 2399 frames, 39.98 s (80 beats at 120.07 BPM), 1920x1080 @60 fps, H.264 yuv420p CRF 16, 4-subframe motion blur.
Audio: Mixkit #132 "Hazy After Hours" (groove lift near 4 s, quiet outro under the end card), 71 Mixkit effects on the film's B table.
-14.1 LUFS, -2.7 dBTP.

## Checks (flow_check.py, wipe starts passed as intended cuts)
- Pops 0, still stretches 0. Jerks: the mascot drop's playful landing (7.6 s) and the list snapping (4.6-5.4 s), both intended.
- Every frame tested out of order where state could leak (the hero card at 4.0 s): identical.

## Fixed during review
1. Every scene showed at once: children set to visibility:visible override a hidden parent. vis() now sets '' (inherit).
2. Scene swaps showed through the wipe: swaps moved to +0.5 s, cover finishes by 0.45 s, reveal starts at 0.62 s.
3. One-frame jump at 4.05 s: the growing card was a gradient, the background flat gold; both flat gold now, collage off on the same frame.
4. The hero card's position after its growth depended on the previous frame: now set explicitly (vis + geometry every frame).
5. Tracked "DRIP VERSE" sat 12 px left: trailing letter-space balanced with padding-left.
6. Frozen frames behind fully covered wipes, on the gold hold and the end card: the block layer drifts, the list starts as the gold lands, floats added.

## Content notes
- The message box is a stand-in, not a copy of any messaging app. Chips "EU 40-44", "Original box", "Authentic" are assumptions: confirm.
- Product names on the tags (adidas Niteball, Axel Arigato) come from the photos supplied.
