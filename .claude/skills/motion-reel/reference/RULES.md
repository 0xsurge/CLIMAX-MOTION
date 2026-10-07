# Rules (detailed)

This expands `CLAUDE.md`. If they ever disagree, `CLAUDE.md` wins.

## Render contract
- A film is `window.seek(t)`. Frame `f` is `seek(f / fps)`. `seek` reads only `t`, `FORMAT`, `TOKENS`. No state between frames: no counters, no "last position" caches, no accumulating arrays. If a value needs history, recompute it from `t`.
- Frames may be rendered out of order or in parallel; this is why state is banned. Choose verification frames that straddle every hand-off.
- Banned in film code: CSS `transition`/`animation`, `setTimeout`/`setInterval`, `requestAnimationFrame`, `Math.random`, `Date.now`. Noise comes from `Motion.mulberry32(seed)` with a fixed seed; derive per-element seeds from the element index.
- Banned: `will-change`, `translate3d`, `translateZ(0)`, `filter` layers promoted to the GPU on things the camera scales. Composited layers can paint the same `t` differently (and blur text). Use 2D `translate/scale/rotate`.
- The render is `render.mjs` -> H.264, `yuv420p`, CRF 16, `+faststart`. Motion blur is `--sub N` subframes in a 180-degree shutter. Draft at `--fps=30 --sub=1`; finals at `--fps=60 --sub=4`.
- Check frame accuracy once per film: frame N of the MP4 must equal `seek(N/fps)`. Check determinism: two renders of the same `t` must hash equal.

## Motion
- Springs only (`Motion.spring`). A pure opacity fade is never an enter or an exit: pair opacity with a translate, scale or mask. No easing curves for anything that enters, exits or retargets.
- A value with more than one target is one `track()`: one spring per change, each starting at its own time. Never restart a spring (restarting zeroes velocity and shows as a hitch).
- Presets: `snappy` buttons, toggles, leading edges (about 2% overshoot). `default` cards, containers, camera (about 1%). `heavy` big type, logo lockups (none). `playful` visible overshoot, mascots only (about 30%).
- Tab/pill indicators use `indicator()`: the leading edge rides a stiffer spring so the pill stretches.
- Text inside a morphing box: `swapAlpha(t, tIn, tOut)`. It enters after the morph starts and is gone before the next morph begins.
- Snap, then hold: change in 1-2 frames, then a hold, reads intentional. Slow eases read as a slideshow. Overlap parts (body first, accents 2-3 frames later). One thing moves at a time unless it's a group; stagger groups 0.05-0.14 s. Holds need life (a cursor drift, a caret blink).

## Look
- Banned clichés: centered title on a gradient; everything fading in; corner labels and frame borders; glow on UI chrome; generic particle bursts; crossfades between shots; spins, glitches, light leaks; bouncy easing on UI; dead time.
- One display face, one UI face, one accent unless the brief says otherwise. Real product UI, logos and fonts. Frame 0 must already read (open mid-action; never an empty frame).
- Something new happens every 2-4 s. The build accelerates into the logo. Re-block each format; 9:16 keeps key text out of the platform UI zones (top 14%, bottom 20%).
- Safe type: every must-read line is legible at 360 px wide; the CTA is the most legible thing in the film.

## Sound
- Synthesized in code unless a track is supplied. `beats.json` is measured, not assumed. State changes on beats, big moments on downbeats, SFX on hits.
- Visuals lead audio: place a cue about 3 frames (30-45 ms) before the visual's first frame at 50% of its motion peak. Hits more than 80 ms off fail the sound-sync criterion.
- SFX levels 0.3-0.6; the mixer soft-clips. Loudness -14 LUFS integrated, true peak <= -1 dBTP; verify with `loudnorm` after the mux.
- No continuous "drawing" scratch sound; contacts make sound, draw-on is silent.

## Traps
- A scene pre-rolled with an opaque background paints an empty page over the outgoing shot: run `review.py`'s blank-frame scan.
- A preview read back from cache looks like the old version: write each sheet to a new filename.
- zsh eats `$var:l`: brace shell variables.
- ffmpeg builds without `drawtext`: draw labels into a PNG and overlay.
- A fix that "doesn't take": grep call sites for overrides before changing the function again.
