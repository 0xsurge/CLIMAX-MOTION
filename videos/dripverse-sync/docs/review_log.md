# DRIP VERSE (Musixquare-style) "Send us a DM": review log
Final: 1920 frames, 32.000 s, 1920x1080 @60 fps, H.264 yuv420p CRF 16, 4-subframe motion blur, 8 chunks joined losslessly (every seam checked).
Pop scan: the only spikes are the three intended hard cuts (28, 29, 30 s), each a single crisp frame. Blank frames: 1 (18.3 s, the drop mark popping on).
Audio: Mixkit "Hazy After Hours" edited so the drop lands at 8.0 s on the button click; 55 downloaded Mixkit effects on the film's TIMELINE
(make_audio.py and film.js share the same times, checked by script). -14.2 LUFS integrated, -2.4 dBTP.

## Round 1 problems found and fixed
1. Arrow overlapped "Classics" in the ticker: ticker and arrow moved apart.
2. 17.5-18.5 s read nearly empty (dots too small, "Ordered." gone too early): "Ordered." holds to 17.9 s, 20 bigger dots gather while it is on screen.
3. Empty gap before the tracker and a blank opening frame: tracker enters as the shoes fly out; "Find" is mid-rise on frame 0.
## Round 2
1. Each hard cut had one blended frame (motion-blur samples straddled the cut): cuts moved 5 ms so no frame straddles them.
2. Chunk seams at 20 and 24 s jumped after the orbit timing change: re-rendered that chunk.

## Scores (self-review from contact sheets, not by listening)
hook in first 2 s 8 | readability 8 (phone UI text is small by design) | motion quality 8 | variety 8 | brand accuracy 8 (placeholder wordmark/drop mark) | sound sync 8 (by measurement)

## Known limits
- Shop UI, order number (DV-0428) and tracker are stand-ins; no prices or stock numbers shown.
- DRIP VERSE wordmark and drop mark are typeset placeholders.
- Shoes are cutouts from low-resolution photos; the on-foot photos (Jordan 4, Asics) are enlarged and slightly soft.
- Musixquare's 3D phone tunnel is a 2D orbit of shoes here.
- Song and effects are not committed (licence); ids in ../dripverse/audio/sfx_manifest.json.
