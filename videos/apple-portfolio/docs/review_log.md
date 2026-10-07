# Review log

Scores are from rendered frames, contact sheets, the phone sheet and numeric checks. A single reviewer (the builder) looked at every sheet. No separate critic agent was used.

## Round 1 (beat sheet + key frames, draft 1)
| Criterion | Score | Evidence |
|---|---|---|
| Hook | 8 | Frame 0 shows headline, banners and island |
| Readability at 360 px | 6 | Widgets on the right turn to specks on the phone sheet |
| Motion | 8 | Fan-out strip: staggered springs, no pops |
| Variety | 8 | Something new every 2-3 s |
| Brand/Apple accuracy | 8 | One accent, white cards, island, SF-like type |
| Composition | 6 | Bottom third empty in most scenes |
| Sound sync | not measured | |
| Polish | 6 | `right:` positioning bug (labels overlapping), bars drawn past the card, type overlapping the readout card, island waveform clipped, island player overlapping a banner |

3 worst: (1) UI too small, (2) overlapping labels from the `right:` bug, (3) data bars and type scene collisions.
Fixes: widget groups scaled 1.15, `mk()` clears `left` when `right` is given, bars grow from a baseline, type scene resized, island bars and player re-laid out.

## Round 2 (draft 2)
| Criterion | Score | Evidence |
|---|---|---|
| Hook | 8 | Unchanged |
| Readability at 360 px | 8 | Headlines read; widgets legible on the phone sheet |
| Motion | 8 | |
| Variety | 8 | |
| Brand accuracy | 8 | |
| Composition | 8 | Data card clears the island and the caption after resizing |
| Polish | 8 | Loop seam 0.1/255, no blank frames, loudness -14.0 LUFS |
| Sound sync | 6 | Cues computed from spring starts, not from their 50% points; whooshes peaked ~170 ms early |

3 worst: (1) whoosh and hit cues mistimed against the springs, (2) dead moments at 16.5, 22.5 and 26.5 s while captions finish rising after the camera lands, (3) data card touching the island at 24.6 s.
Fixes: every cue recomputed from the measured 50% point of its spring (snappy +57 ms, default +104 ms, heavy +154 ms), transients land 30 ms ahead; caption/word entrances start 0.12 s before each camera push; finale clone starts at 25.9 s.

## Round 3 (draft 3, key frames at the pushes)
Pushes now show outgoing and incoming content overlapping in motion; no empty frame. Frame accuracy confirmed: frame 450 of the MP4 vs `seek(15.0)` differs by 0.33/255; a wrong-time control differs by 49.9/255.

## Not done / limits
- 16:9 only. 9:16, 1:1 and 4:5 are not built; `film.js` uses fixed 1920x1080 coordinates and would need re-blocking per format.
- Sound sync is placed by construction from spring timings and verified against the cue list, not by listening or by an audio-vs-picture measurement.
- Inter stands in for SF Pro (SF is not redistributable). The icons are hand-drawn SVG approximations of the Apple glyphs.
- Voiceover: none.
