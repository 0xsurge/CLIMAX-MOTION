# Review log: Moniepoint "Sent means received" v2

## Round 1 (full render, one frame per second, camera measured with camflow.py)
| measure | score | note |
|---|---|---|
| Hook in first 2 s | 8 | bold line on navy from frame 1, close start and pull-out |
| Readability at phone size | 7 | two reframes cropped words at the frame edge |
| Motion quality | 8 | springs critically damped; camera never still (longest still stretch 0.07 s). Judged from frames and measurement, not from watching playback |
| Variety | 8 | floods, type zoom, sweep, 3D phone spin and tilt, diagrams, people |
| Brand accuracy | 8 | real receipt, screens, models, icon and colours; font is Satoshi, not Moniepoint's own |
| Sound sync | 7 | cues placed on the film's own event times; not listened to |

Worst problems and fixes:
1. Bridge: the zoom on "And that's just the start." cropped the first letter. Zoom reduced from 1.25 to 1.1.
2. Savings: the second reframe pushed "Earn up to 20% a year." off the top edge. Reframe now keeps the text panel in view.
3. Readability re-check after the re-render (round 2).

## Round 2 (re-render; the two fixed scenes checked at six times)
Both crops are gone: "And that's just the start." and "Save it. Earn up to 20% a year." stay fully in frame.
Readability moves from 7 to 8. Sound sync stays at 7 until the mix has been listened to; the music is still a placeholder.

## Round 3 (16:9 re-block, `film3`; one frame per second of the finished video)
Every scene was laid out again for 1920×1080. Fixed before the full render: four reframes that cropped words, the model's
head cut off by the card panel, the closing capitals running into the model, and the close-up missing the "Successful" chip.
Scores unchanged from round 2 (8 on all but sound sync at 7, which waits on the music pick and a listen).
