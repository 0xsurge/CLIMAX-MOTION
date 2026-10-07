# Style guide: Apple-style UI motion portfolio (30 s, 16:9, 120 BPM)

**Idea.** A continuous UI world, never cut. A black Dynamic Island stays above every scene and morphs with what happens below. Scenes are panels on a horizontal strip; the camera pushes between them on a spring. Each scene is one motion study, built from real DOM, driven only by `seek(t)`.

**Palette (one accent).** canvas `#F5F5F7` · surface `#FFFFFF` · ink `#1D1D1F` · muted `#86868B` · hairline `rgba(0,0,0,.08)` · island `#000000` · accent `#0071E3` (white text on accent). Neutral greys for inactive states. No second hue, ever.

**Type.** Display: Inter Tight, weights 100-900 (variable), tracking -0.03em at headline size. UI: Inter, 500/600, tabular numerals. Inter is the open stand-in for SF Pro (not redistributable). Headlines left-aligned on a fixed grid (x = 160), never centered on a gradient.

**Surfaces.** White cards, radius 28-44 px, shadow `0 1px 2px rgba(0,0,0,.06), 0 18px 40px rgba(0,0,0,.08)`. No glow, no gradient chrome, no borders on the frame, no corner labels. Album art and the card faces are content, not chrome.

**Motion.** Closed-form springs only. snappy: toggles, press states, leading edges. default: cards, containers, camera. heavy: big type. playful: unused (no mascots). Tiny overshoot on UI, none on type. Text in a morphing box uses swapAlpha. Nothing enters by opacity alone: every enter is a spring translate/scale with a mask or clip.

**Rhythm.** 120 BPM, 60 beats, 15 bars. Scene starts land on bar lines: 0, 4, 10, 16, 22, 26 s. Something new every 2-3 s.

**Sound.** Synthesized: minimal 120 BPM bed (kick, off-beat hat, sub, pentatonic plucks). Clicks on toggles, pops on island morphs, whoosh on camera pushes, thump on the finale. Cues placed on measured hits, about 30-40 ms ahead of the visual. -14 LUFS.

**Loop.** Frame 30.0 equals frame 0.0: the last scene is the first scene's composition, the island returns to its idle waveform, all periodic values run on `loopT(t, 30)`.
