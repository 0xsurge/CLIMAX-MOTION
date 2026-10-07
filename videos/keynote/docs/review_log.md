# Review log: Armab keynote film (27 s, 1440x1440, 120 BPM)

Scores come from rendered frames, contact/phone/strip sheets and numeric checks. One reviewer (the builder); no separate critic agent.

## Build checks (before the draft)
- Beat sheet at one frame per beat: the whole story plays as one continuous take, no fades, blurs or cuts.
- Last frame equals first frame: frame 26.99 vs frame 0.00 differ by 0.013/255 (the wordmark's return spring has not quite finished).

## Round 1 (full draft, 30 fps, with sound)
Numeric checks found real defects, all fixed:
| Defect found | Cause | Fix |
|---|---|---|
| Spike at 7.97 s (mean frame change 54): the full-bleed photo came in enlarged at the drop | the phone wrapper was being scaled by the camera, which was still zooming back from 2.97x | the camera only touches the phone from the pull-back onward; zoom spring made snappier and started earlier (change at the handoff 55 -> 8, then settled) |
| Spike at 14.5 s (50): the lock-screen wallpaper jumped when the orb's photo handed over | the orb's photo was offset differently from the wallpaper layer | same crop and offset math as the wallpaper |
| Spike at 24.47 s (34): the whole canvas turned wall-coloured before the black flood covered it | the wall layer switched on too early | wall shows only once the flood covers the screen |
| Phone-shaped black rectangle over the wall and the returning wordmark | the phone bezel was not hidden with the screen | hidden together |
| Text in the status pill sat on the top edge | CSS `font:` shorthand reset the line-height set just before it | font properties split out |
| The squeeze left a sliver of letters beside the pill | letters stopped at 5% width | letters converge under the pill and reach 0 |
| The black shape contracted over the wall, not the canvas | wall layer stayed on for 0.25 s too long | wall off when the flood covers |
| Song edit landed mid-beat | the tempo estimate from `beat_track` (120.21) gave a grid 0.3 s off the true kicks | grid re-measured from the kick attacks: 120.04 BPM, kicks on a 0.037 s phase, drop at source 16.04 s, beat returns at 63.54 s; edit rebuilt on those beats |

Pop scan (frame-to-frame change, spikes more than 3x both neighbours) after the fixes: **1 flag**, at 25.6 s, which is the iris snapping open on the print. It opens over about five frames at 30 fps (viewed frame by frame): designed, not a glitch.

Scores after round 1 (before the composition fix):
| Criterion | Score | Evidence |
|---|---|---|
| Hook | 7 | frame 0 reads, first 2 s sparse |
| Readability at phone size | 7 | big moments read, phone and window scenes small |
| Motion quality | 8 | springs, clean pop scan |
| Variety | 8 | |
| Brand accuracy | 8 | real hero, nav pill, copy |
| Composition | 7 | too much empty canvas in the grid and phone scenes |
| Polish | 7 | no blank frames, loop seam 0.3/255 |
| Sound sync | not scored | cues placed by measured peak, not yet measured in the mix |

## Round 2
Enlarged the pulled-back phone (78% -> 92%) and the photo grid tiles (280 -> 330 px). Re-checked frames; both fill the square better. Final render at 60 fps with 4 subframes per frame.

## Not done / limits
- The wall is a still crop of the site's corridor wall (no real footage with moving plant shadows: Pexels blocked my search).
- The day-to-golden-hour pair is one photograph graded two ways.
- The bento uses nine crops of five site photos; only the corridor photo is anywhere near high-res, and it is enlarged about 1.8x when the zoom fills the square, so it is soft.
- The "melt" of the glass word into the droplet is letters shrinking to the centre while the droplet pops, not a true goo merge (the glass cannot go through a goo filter).
- Liquid glass is an SVG displacement approximation with chromatic edges; it is not Apple's renderer.
- The landing page in Safari uses the real nav pill and a typeset headline over the dropped photo; the real site's hero is not a photo.
- Sound sync is placed by each effect's measured peak against the visual contact frame, with the song edited on measured beats; it has not been verified by listening.
