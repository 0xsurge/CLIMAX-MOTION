# DRIP VERSE "Drip Time": review log
Final: 1800 frames, 30.000 s, 1920x1080 @60 fps, H.264 yuv420p CRF 16, 4-subframe motion blur. Chunks joined losslessly; every chunk seam checked (diff within the neighbouring-frame range). Pop scan: 0 isolated spikes. Blank frames: 0.
Audio: Mixkit "Hazy After Hours" (#132) edited on its measured grid (120.07 BPM, groove lands at film 12.0 s), 52 downloaded Mixkit effects placed by measured peak or start, none synthesized. -14.2 LUFS integrated, -2.2 dBTP.

## Round 1 (contact sheet, one frame per beat) problems found and fixed
1. Hook drop, neck and rings drew at x=0: the hook layer was hidden while measuring the letters. Fixed by building with it visible.
2. "Shop the drop" button peeked in at the bottom before its entrance. Entry offset enlarged.
3. Shoes still peeked in at the bottom during the photo-card phase. Exit offset enlarged.
## Round 2 problems found and fixed
1. Hero held still for about 3 s: added parallax drift of "New" and "arrivals" against the shoe.
2. Photo-card phase was static with a barely visible lens: cards now drift at different speeds, lens has a rim, 1.2x magnification, refraction and a brighter interior.
3. Chunk seam at 20.0 s jumped (old card motion in the next chunk): re-rendered that chunk with the new code.

## Scores (self-review from the contact sheet, not from listening)
hook in first 2 s 8 | readability at phone size 8 (copy lines are small) | motion quality 8 | variety 8 | brand accuracy 8 (placeholder wordmark, no real logo) | sound sync 8 (placed by measurement, not verified by ear)

## Known limits
- Shoes are flat cutouts from low-resolution photos (about 500-740 px wide): enlarged shoes are soft. Depth is faked with layering, reflection, shadow and blur.
- Cutouts are good, not perfect (Nike Zoom and NB 480 edges slightly soft). Jordan 4, Asics and Balenciaga stay as photo cards (legs/box would not cut out). The Air Force 1 looks AI-rendered.
- Order/delivery UI is a generic stand-in. DRIP VERSE and Climax Store wordmarks are typeset placeholders.
- No loop (last frame differs from the first).
- Song and effects are not committed (licence): ids are in audio/sfx_manifest.json.
