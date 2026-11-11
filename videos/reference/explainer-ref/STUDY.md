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
