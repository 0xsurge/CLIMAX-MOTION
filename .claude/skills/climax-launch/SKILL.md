---
name: climax-launch
description: The complete, proven method behind the Sterling "Claim and Check" film that the user called "the definition of perfect". Everything from scratch, in order. How to study references, find the product idea, build palette and chapters, type and text animation, the cursor, chrome grounds with travelling gradient light, luma colour sweeps, the measured flat camera, pacing, sound (music drop, glitter zips, what never to use), the build and render pipeline, delivery, the review loop and the bugs to avoid. Use it for every launch, promo, teaser or product film; it sits above launch-style and camera-style.
---

# /climax-launch: the method that made the perfect film

The reference build is `videos/sterling-v3/`. The film is `film/index.html`, the sound is in `sound/`, and the
delivered file is `delivery/sterling-claim-and-check.mp4`. When a choice is unclear, open that film and do what it does.
This skill is the master. `launch-style` (the look) and `camera-style` (the camera) are its detailed chapters, and
`CLAUDE.md` holds the render contract. Where they differ, this file and the user's words win.

---

## 0. Who you are working for (what the user loves and hates)
- **Loves:**
  - bold, confident, premium launch films
  - one strong idea told through colour
  - deep blacks with moving coloured light on glossy chrome
  - a camera that travels so the eye has to follow
  - smooth moves with a sharp speed peak
  - type that builds word by word
  - real brand logos and fonts
  - the glitter-zip sound on colour sweeps
  - the Thunder track with its bass drop
- **Hates**, which got earlier versions rejected:
  - pale or white slideshow-like films, too much white space, plain "basic" visuals
  - small, timid UI
  - a static camera with everything animating in the middle of the screen
  - anything tilted or bent in 3D (type and UI must stay square)
  - crossfade ghosting and garbled text transitions
  - whoosh or "shh" swish sounds on movement
  - chime, piano or melodic notes that follow light or motion
- **How they work:**
  - They send reference videos and expect them studied deeply: measured, not eyeballed.
  - They approve a mood board and storyboard before anything is built.
  - They pick the music and the key sound by ear.
  - They watch on an Artifact player page.
  - They look at the last frame closely, so every frame must be clean.
- Their own copy and brand assets are sacred: keep the copy word for word and use the real logo and font.

## 1. The process, in order (do not skip steps)
1. **Understand the product in one sentence.** Sterling: "one API key for every model, routed only to providers Mira
   Network has verified really serve the model they name."
2. **Pick one or two visual ideas that come from the product.** Sterling: *a model name is a claim, and Sterling is the
   check.* The claim is red-orange, the check is emerald. The check mark becomes the 3D chrome. Do not copy the
   website's look. The brand gives the logo, the fonts, the copy and the real product facts, and the world is ours to
   invent.
3. **Study the references the user sends.** Use contact sheets at 1 fps, 10–15 fps strips through every key moment,
   cut detection, beat and loudness analysis, spectrograms of the sounds, and optical-flow camera graphs. Write a
   `STUDY.md` beside them.
4. **Mood board and storyboard as one Artifact page, then wait for approval.** It holds:
   - the idea in colour (two rendered grounds)
   - a short motion test of the key effect
   - the palette, type and cursor
   - the sound references next to your synthesized version
   - every beat as a full-size 1920×1080 still made from the real assets, with timing, motion and sound per beat
   - a closing question asking which look, which sound and which music
5. **Iterate on the sound separately by ear.** Offer variants, A / B / A+B, each laid over the actual music, and let
   the user pick.
6. **Build, check the contact sheet, fix, then do the full render.**
7. **Deliver on an Artifact player page.** Commit and push the film and the delivery file.

## 2. Structure and pacing (the 30 s template that worked)
Cut everything to the music's grid. Measure the beat (Sterling: 95.9 BPM, P = 0.625653 s), and put the **drop on the
first slam word at 1.9 s**. Times below are in beats after the drop (B(n) = 1.9 + n·P).

| beat | time | what happens |
|---|---|---|
| hook | 0–1.9 s | the problem line builds word by word from frame 1 on the claim-coloured chrome ("A model name on an API") |
| drop | 1.9 s | the slam word lands on the bass drop ("is a **claim.**") |
| doubt | B2 | word swap with a colour smear ("Is it really Claude? / GPT? / Gemini?") |
| turn | B4 | **luma colour sweep** from the claim palette into the verified palette ("Time to **check** it.") |
| mark | B6 | the brand mark slams in big and blurred and shrinks to size |
| name | B7.5 | wordmark letters fly in from scattered seeded positions, about 0.085 s apart |
| promise | B9.5 | the key card and the cursor presses Copy; the camera dives into the button ("One key. Every model.") |
| code | B13.5 | the real endpoint types at display size; the camera rides along with the caret |
| route | B17.5 | the provider list: a check per row on the beat, the unverified row skipped in claim colour |
| checks | B21.5 | the five checks as a word swap, one per 0.8 beat, with a light pass on the chrome |
| answer | B26.5 | the answer slam ("The model you pay for. **Verified.**") |
| range | B29.5 | the same response card with the model name swapping every 4 frames |
| steps | B33.5 | three pills pressed one per 1.3 beats; the last grows into an emerald flood |
| end | B38.5 | the logo builds from its pieces, then the support line, the URL pill with a light drawing its outline, and "powered by" |

- Something new every 0.5–1 s in type sections, never more than 2 s without a change.
- Calm stretches against bursts. The ending is quieter: the camera nearly stops, with one slow push.
- About 30 s in total, ending on a fade of the music over the last 1.6 s.

## 3. Colour: one idea, two chapters
- **The void:** #030404 true black, never milky grey. Keep a dark band behind the type so it always reads: a radial
  rgba(3,4,4,.82) at the centre falling to 0 at about 900 px.
- **Chapter 1, the claim:** red #FF3D12, orange #FF8A1F, gold #FFD36B, hot pink #FF2D6F, cyan rim #5FD6FF.
- **Chapter 2, verified:** emerald #0FBF7A, mint #3DFFB0, lime #D8FF7A, teal #0AA3A3, ice #9FE8FF.
- **Accent type:** gradient text in the chapter colour on the key word only (claim: #FF3D12 → #FFC46B; verified:
  #0FBF7A → #D8FF7A). Everything else is #EEF3F0.
- **UI cards:** #121414 with a 1.5 px rgba(255,255,255,.06) inner line and a thin mint rim line along the top edge.
- **Glow:** only on the active element (the button being pressed, a row being checked, the URL pill outline as it
  draws). Never on idle chrome.
- The palette is the story: the colour change is the turn of the film.

## 4. Type and text animation
- **Fonts:** the brand's display face for everything (Sterling: Zalando Sans Expanded 500) and the brand's UI face
  for small UI text (Public Sans). Use a monospace face only for code.
- **Two sizes only:** caption at 66 px, one centred line of 2–5 words, tracking −0.02 em; slam word at 300 px, one
  word, tracking −0.05 em.
- **Word-by-word build:** each word springs in (k 900, c 50) from blur 12 px and +34 px x to sharp, with the next word
  P/4 later. The whole line creeps while read (scale −3.5% and x −18 px over 2.5 s). Exit: blur 10 px and slide −40 px
  in 0.12 s. Keep it visible 0.3 s past its exit time so the camera can leave it.
- **Slam:** scale 1.3 → 1.0 with blur 22 → 0 (spring k 520, c 46), then a slow shrink of 10% per second until the
  next beat.
- **Word swap:** the fixed lead-in stays, and the last word changes every 0.5 beat (or 0.8 beat for longer words). The
  new word streaks in from +130 px with a coloured text-shadow smear behind it.
- **Typing:** one character every 0.036 s at 68 px, with a real caret; the typed URL is in the accent colour.
- **Logo build:** the mark at 360 px blurred and scaled 1.25, settling to its lockup size. The wordmark is split into
  its real letter paths, and each letter flies in from a seeded random offset (±450 px, ±310 px, ±30°).
- Never a pure opacity fade: every enter and exit has blur and motion.

## 5. The cursor
- **Shape:** a notched dart: a triangle with its tip at the top-left and the back edge notched inward (path
  `M4 4 L42 20 L24 25 L18 44 Z`, viewBox 0 0 46 50). It is not the OS arrow.
- **Look on dark grounds:** black #0B0C0D fill, thick white 4.2 stroke, drop shadow, about 100 px tall.
- **Motion:** it enters from off-frame on a curved path (x on the default spring, y on a slightly different spring),
  drifts about 3 px when idle, and presses with scale 0.88 for 0.09 s while the target reacts (it grows, turns
  emerald and glows).

## 6. The grounds: a chrome world with travelling gradient light
- **Forms (three.js):**
  - **The brand mark as a fat chrome tube:** a CatmullRom curve through the check-mark stroke, tube radius 0.34, scale 9.5.
  - **Two wide folded chrome ribbons:** extruded rounded rectangles along curves.
  - **A second tick far behind.**
  - **Material:** metalness 1, roughness 0.1, clearcoat 1.
- **Light:** a dome environment map whose colour ramp rotates with t (phase t·0.11). The light glides along the
  chrome and the surfaces change colour as it passes. That travelling light is the soul of the look. Use the chapter
  palette in the ramp, a cyan or ice rim strip up high, and the gain raised briefly for big light passes.
- **Lens:** a shallow-focus look. The frame is blurred 22 px at the edges with the centre sharp, using a radial mask.
- The world moves with parallax: its rotation follows the film camera at 0.00022 rad per px, plus a slow drift.
  Don't give it roll.

## 7. The luma colour sweep (the chapter change)
The next frame floods in through its own brightness: bright parts first, then the dark ground. It is painted by a
moving gradient ramp (violet → red-orange → amber → emerald → mint) and then relaxes into true colour.
- Per pixel: L = luma(B); th = 1.4p − 0.2; mask = clamp((th − (1 − L)·0.75)/0.2); wash = ramp(0.9L + 0.55p − 0.05);
  res = clamp((p − 0.55)/0.45); out = mix(A, mix(wash, B, res), mask).
- Drive p with a slow spring over about 1.5 beats.
- **Do it in 2D on the finished frames** (getImageData), not in a WebGL render target: the render target lost tone
  mapping and colour space and came out muddy brown.
- **A second use:** a button pressed by the cursor grows into a solid emerald flood, and the sweep then resolves that
  flood into the ending world (solidA mode).

## 8. The camera: flat, measured, travelling (see /camera-style for the measurements)
- **Layout:** every beat sits at its own place on one big canvas, so the camera travels between them.
  - Sterling places, as [x, y]: hook [0, 0], drop [0, 900], doubt [1700, 900], mark [1700, −150],
    promise [3300, −150], code [3300, 950], route [4900, 950], checks [4900, −150], range [6500, −150],
    steps [6500, 950].
  - The old beat stays on its spot while the camera leaves it.
- **Flat 2D only:** pan, tilt and zoom. **Roll 0°, no perspective, no tilted cards.** Cards are drawn flat through the
  same camera transform as the type.
- **The move curve** is an exponential ease-in-out, `camMove(t, tc, tau)`. It creeps off, peaks sharply and glides in.
  - Fast whips and pans: tau 0.09–0.13.
  - Slow pushes, pulls and pans: tau 0.3–0.7.
  - Each key is summed in order, one move per change.
- **Holds:** between moves the camera holds, with only a 3–4 px sway, while the content animates.
- **Zoom choreography:** zoom 0.92–1.42. A dive at the mark as it lands (1.3), a pull-out as the name builds (0.96),
  a dive into the Copy button (1.42), a punch-in on the answer slam (1.13), a pull-out for the logo (0.92), then one
  slow push to close (1.0, tau 0.7).
- **Caret ride-along:** while typing, the camera's x follows the caret continuously, never in steps, and hands the
  offset back with a slow move.
- **Motion blur in the direction of travel:**
  - **Type and UI layer:** an SVG feGaussianBlur with stdDeviation "bx by", where bx and by are about
    0.12 × (|velocity| − 10 px per frame), capped at 26.
  - **Canvas layers:** smeared as seven copies along the velocity.
  - **Zoom speed:** adds blur on both axes.
  - **On landing:** it is gone.

## 9. Sound
- **Music:** a supplied, licensed track with a big bass drop (Thunder, Mixkit), trimmed so the drop lands on the first
  slam word at 1.9 s, with a fade-out over the last 1.6 s.
- **The signature SFX, "glitter zips"**, measured from the reference spectrogram and approved by the user:
  - Clusters of micro-chirps, each a bright sparkle sweeping **down from about 15–16.5 kHz to 7.5–9.5 kHz in
    22–42 ms**, with a sharp attack and grainy noise mixed in.
  - Spaced 6–16 ms apart, in two or three clusters (6, 7 and 4 zips), panned across with the light.
  - One or two tiny glints after them (5.4 and 6.3 kHz pings of about 60 ms), with a faint air bed underneath.
  - Placed on every colour sweep and every big light pass, at about 0.13–0.22 gain under the music.
  - Code: `videos/sterling-v3/sound/glitter.py`.
- **Small physical hits only:**
  - a low thump (38–72 Hz pitch drop, 0.22 s decay) under each slam and mark landing
  - a soft click (filtered noise plus a 2.4 kHz tick) on each press
  - quiet key taps on every other typed character
  - a tiny tick per checked row
- **Never:** whoosh or "shh" swishes on movement, or tonal, chime, piano or melodic SFX that follow the light. Nothing
  makes a sound just because it moves.
- **Mix:** music plus SFX, then `mix.py` (two-pass loudnorm to −14 LUFS, true peak −1 dBTP). Mixer: `sound/make_mix.py`.

## 10. Build and render pipeline (what actually works here)
- **One HTML page, `film/index.html`, with `window.seek(t)`.**
  - **Layers:** a canvas carrying the three.js chrome world (with the sweep, the lens blur and the dark type band),
    flat cards drawn onto the canvas through the camera, then the DOM type, cursor and logo.
  - **Placement:** each DOM element sits inside a keyed wrapper, transformed by the camera as
    `translate(960,540) scale(z) translate(place − 960 − camX, place − 540 − camY)`.
  - **Contract:** pure function of t, seeded randomness, springs from `motion.js` for every element, `camMove` for
    the camera.
- **Render:** `node .claude/skills/motion-reel/scripts/render.mjs film --fmt=16x9 --fps=30 --dur=… --out=…`.
  - It takes 3–4 s per frame for the WebGL world on this CPU, so about 55 min for 30 s. Run it in the background and
    give the user honest progress (frame n of 911).
  - Do not use the HyperFrames renderer for heavy WebGL: it stalled at frame 0.
- **Partial re-render after a fix:** render only the changed span with `--from`/`--to`, splice it with ffmpeg
  (`trim=end_frame=N`, concat), then mix again. Splice a little before the changed region and check the seam frames.
- **Check:**
  - `flow_check.py --fps 30` for stillness, pops and jerks. Fast measured whips read as "jerks" by design.
  - A contact sheet of about 18 frames across the film.
  - A close crop of the **last frame**.
- **Deliver:**
  - Re-encode to CRF 20 for the player.
  - An Artifact player page: a dark screening column with the film, then length, format, music and sound.
  - Commit the 1080p file with `git add -f` into `delivery/`. Brand-captured fonts and images, music sources, renders
    and generated plates stay git-ignored.

## 11. Bugs and traps already paid for
- `el.style.display = ''` wipes an inline `display:flex`, which un-centred the URL pill. Store the display mode
  (`dataset.d`) and restore it.
- A line kept on screen for the camera's exit can ghost over the next scene. End it before the flood or the cut.
- WebGL render-target sweeps lose tone mapping, so do the sweep in 2D on the final frames.
- The `seek` function must return nothing. Prime any GSAP timeline. Never use Math.random.
- An opacity crossfade between two light states leaks content through (the v1 ghosting). Never crossfade.
- 3D-tilted cards and camera roll were rejected. Keep everything flat facing the lens.
- Text on bright chrome is unreadable, so always keep the dark type band.

## 12. Final checklist before showing the user
- In the first 3 s, muted: is text on screen, with a striking visual and a bold claim?
- One idea told through colour, with a chapter change done by the luma sweep?
- Two type sizes, word-by-word builds, slams on beats, no pure fades?
- A flat camera that travels between places with `camMove`, plus holds, zoom dives and directional blur?
- Real logo and copy, the cursor pressing real UI, and every card flat and square?
- Thunder's drop on the first slam, glitter zips on sweeps, small physical hits, no whooshes, no notes, −14 LUFS?
- A contact sheet checked, the last frame checked up close, seams checked after any splice?
- Delivered on an Artifact page, committed and pushed?
