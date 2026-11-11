# Camera and motion study: "Pulse" explainer (sent by the user for camera moves, motion style, zooms, transitions)

Measured with `camflow.py` (`flow.json`, 1024×576, 30 fps, 52 s). Sheets: `sheet.png`, `s1.png`, `s2.png`.

## Measured
- **The camera is almost never still:** only 11% of frames are near-still.
- **Between moves it creeps:** a steady zoom of about 4% per second (median on calm stretches).
- **Moves come in bursts:** 87 fast moves in the first 30 s, roughly one every 0.3–0.7 s inside a burst, then a calm second or two.
- **Moves are reframes of one big UI:** the camera scrolls and zooms across a large screenshot from one region to the next
  (a list, then one row, then a chart). Typical peaks are 400–1,800 px/s of pan with a zoom change in the same move.

## Devices seen
1. **Small caption beside the UI**, built word by word, with the last phrase in the accent colour or inside an accent box.
2. **A glow outline** that lights up around the row or card being talked about.
3. **A cursor that causes the move:** it clicks an item, and the camera dives to what opened.
4. **Light rising from the bottom edge** in the accent colour on reveal moments.
5. **A circle that grows to fill the frame** as the transition into the logo.
6. **Black opening, white middle, black close.**

## Used in the Moniepoint film
- Two or three reframes inside every scene (text, then the object, then the detail), not one hold per scene.
- A stronger creep between moves (about 3% per second).
- Glow outlines on the element being talked about.

## Transition styles between scenes (what the user asked to borrow; strips in `trans.png`)
The user's note: take the styles, not the timings.
| # | style | what happens |
|---|---|---|
| X1 | **Dive into an inline box** | the small highlight box inside a sentence grows until it fills the frame and is the next scene's card |
| X2 | **Collapse to a dot** | the whole scene shrinks into a circle, the circle squeezes into a pill, and the pill is the next line's caret |
| X3 | **Colour flood from an element** | a small card floods the frame with a gradient wash, and the next shot appears through it |
| X4 | **Zoom through big type** | one huge blurred word rushes at the lens and fills the frame; the next scene is behind it |
| X5 | **Page scroll** | the camera scrolls down one long UI to the next region while the caption beside it changes |
| X6 | **Push** | a window slides in from one side and pushes the caption over, which keeps typing |

Used in the Moniepoint film: X3 as an amber flood out of the "Not yet o" bubble (hook to wait), a blue flood from the dart
(send to landing) and a navy flood (bills to cashback); X4 as the word "Spend" (bridge to card); X5 and X6 as the camera's
own vertical and sideways moves. No style is used on two scene changes in a row.
