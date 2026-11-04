# Motion studio rules

## Render contract
- Every film is a pure function of time: window.seek(t) paints frame t.
- No CSS transitions, no setTimeout, no requestAnimationFrame in render mode, no state carried between frames. Seeded noise only (mulberry32), never Math.random.
- No will-change, translate3d or translateZ(0). Composited layers make the same t paint differently. Use 2D transforms.
- Render with node render.mjs, encode H.264 yuv420p, CRF 16.

## Motion
- Springs only: closed-form springs from lib/motion.js. No easing curves for anything that enters, exits or retargets.
- Any value with more than one target uses track(): one spring per change, each starting at its own time. Never restart a spring.
- Presets: snappy (buttons, toggles, leading edges), default (cards, containers, camera), heavy (big type, logo lockups), playful (visible overshoot, mascots only). Tiny overshoot on UI, none on type.
- Text inside a morphing box enters after the morph starts and leaves before the next one (swapAlpha).
- A pure opacity fade is never an enter or an exit.
- Never hold still: the camera is always moving. Every scene has a slow push-in or pull-out plus a gentle drift (left/right, up/down) that alternates scene to scene and hands over to the next scene through a spring, so motion never stops. Landed elements keep a small float. Measure it: no frozen stretch of 0.25 s or more.
- One continuous take by default: one camera for the whole film, built from spring keys plus a sway that always returns to centre (never linear, never reset at a scene change). Scenes change by morphing a carrier object, not by cutting; keep hard cuts for at most two or three big beats. Overlap: the next element moves before the last one settles. Measure it: flow_check.py, no jerks.

## Look
- Banned defaults (clichés):
  - centered title on a gradient
  - everything fading in
  - corner labels and frame borders
  - glow on UI chrome
  - generic particle bursts
  - crossfades between shots
  - spins, glitches, light leaks
  - bouncy easing on UI
  - dead time
- Centre what is centred: lay out statements as one centred group (flexbox, measured gaps), balance tracked type, and let the camera settle on true centre at every lockup. Measure it: flow_check.py --centre, within 8 px.
- Hierarchy: three type levels only (display, support, label) with big jumps between them; one focal point per frame; when type speaks, the UI recedes (smaller, blurred), and the reverse.
- Moving light is allowed when it is motivated: rim light passes that travel along an edge and die away, soft light sweeps that carry a scene change, light pools under products, glowing lines as they draw. Random light leaks and static glow on buttons stay banned.
- One display face, one UI face. One accent color unless the brief says otherwise.
- Real product UI, logos and fonts. Never redraw UI that exists.
- Every 2 to 4 seconds something new must happen on screen.

## Sound
- Score and SFX are synthesized in code unless a track is supplied.
- Place hits on the measured beat grid (beats.json). Loudness -14 LUFS.

## Loop before you show me anything
1. Render one frame per beat as a contact sheet and LOOK at it.
2. Score it 1-10 on: hook in first 2s, readability at phone size, motion quality, variety, brand accuracy, sound sync.
3. Fix the 3 worst problems. Repeat until every score is 8+.
4. Only then do the full render.

The /motion-reel skill (.claude/skills/motion-reel) holds the full pipeline. Its reference/RULES.md has the detailed version of these rules.

## Remotion
The Remotion agent skills (remotion-*) live in .claude/skills, installed from github.com/remotion-dev/skills at commit c7cb2fd (skills v4.0.540). Use them when a film is built in Remotion. Where their defaults differ from these rules, these rules win: springs (Remotion's spring() or lib/motion.js) instead of interpolate() with easing curves for anything that enters, exits or retargets, and no light leaks.

## GSAP
GSAP 3.15.1 and its plugins (MorphSVG, DrawSVG, MotionPath, SplitText, Flip, CustomEase) are vendored in the motion-reel engine (engine/lib/gsap).
Use them inside the render contract: one paused master timeline, primeTimeline(tl) once, window.seek = t => { tl.seek(t, false); } (returns nothing),
and springEase(preset) for every ease, never GSAP's built-in curves. See engine/lib/gsap/README.md.

## Impeccable
The Impeccable design skill (.claude/skills/impeccable, from github.com/pbakaus/impeccable at commit 5af4319, skill v4.8.0, Apache 2.0) is installed
without its automatic hooks. Use it to critique and audit the pages, UI screens and players we build (`impeccable detect <file-or-url>` for the
62-rule detector). Its engine downloads to ~/.impeccable on first use, checksum-verified; telemetry is off (`impeccable telemetry off`, rerun in a
fresh session). For films, these motion rules win where it differs: springs only, one continuous take, no light leaks.

## three.js
three.js 0.187.0 is vendored in the motion-reel engine (engine/lib/three, MIT) for real 3D inside window.seek films: createStage() from
engine/lib/three-stage.js, transforms computed from springs of t, one render per seek, no animation loop or clock. It ships only as ES modules;
render.mjs launches Chromium with --allow-file-access-from-files so file:// films can import them. See engine/lib/three/README.md and
templates/three-example.

## ComfyUI
ComfyUI (github.com/Comfy-Org/ComfyUI) with the SDXL Lightning 4-step checkpoint (OpenRAIL++, commercial use allowed) installs to /opt/ComfyUI via
install_comfyui.sh; comfy_generate.py makes one seeded image headless (~2-4 min per 1024 px image on this CPU). Not SDXL Turbo: non-commercial.
Generated images are for sets, plates, backgrounds and textures only, never in place of a brand's real products, logos, photos or UI.

## HyperFrames
HeyGen's HyperFrames agent skills (hyperframes, hyperframes-cli, hyperframes-registry, media-use, figma, remotion-to-hyperframes, reverse-any-video,
slideshow, style-sampling) live in .claude/skills, from github.com/heygen-com/hyperframes at commit 2679bcd (Apache 2.0). Use them when a film is
built in HyperFrames. Run its CLI with HYPERFRAMES_NO_TELEMETRY=1. These rules win where its defaults differ: springs only, one continuous take,
no light leaks, glitches or film grain, real brand assets only.
