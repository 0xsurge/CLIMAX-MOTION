---
name: launch-style
description: The house look for product launch films, reverse-engineered from six reference launches the user chose (Synaps, lovio, ProductHype, SaaS-gradient transitions, Paage, Magic Animator). Kinetic word-by-word type that blurs in, giant slam words, the real product shown in macro close-ups and tilted planes, a cursor as the main character, a mood ground (dark void with glossy 3D forms, pastel aurora fog, or a lush generated world), music-led cutting, quiet logo endings. Use whenever you plan, storyboard or build a launch, promo, teaser or product film, together with /motion-reel or /hyperframes.
---

# /launch-style

The user picked these films as the taste bar; their own study is in `videos/reference/launch-study/STUDY.md`
(read it once, with its contact sheets, before you storyboard). This file is the grammar. `CLAUDE.md` still
governs how it is built (springs, the render contract, one continuous take, checks); where this file names
a number, that number is the target.

## 0. Before anything: understand the product, then pick one or two ideas
- Say in one sentence what the product does and for whom. Then pick **one or two visual ideas** that come
  from it (a key, a check, a route, a canvas, a page) and build the whole film from them. Do not try to show
  everything on the website, and do not copy the website's look: the brand gives the logo, the name, the
  product's real screens and the copy; the film's world is ours to invent.
- Write the film as 2–5 word lines. If a line is longer than 6 words, split it.

## 1. The first 3 seconds (the hook rule)
Most people watch muted. Within 3 s the frame must have **text on screen**, **one striking visual element**
and **a bold statement**. Start on frame 1 with type already arriving (no black lead-in, no logo first).
Open on the problem or a provocation ("Designing buildings has always been hard", "Let's be honest…",
"Selling used to be…"), never on the product name.

## 2. Type
- **One sans family** for the whole film (a geometric or neo-grotesk: Inter Display, General Sans, Aeonik,
  SF Pro Display, Plus Jakarta Sans, or the brand's own). Medium/semibold for captions, bold for slams.
  Tracking slightly tight (-1% to -3%). A serif only for an ending tagline if the brand owns one.
- **Two scales, nothing in between:**
  - caption: cap height 4–6% of frame height (≈ 45–65 px at 1080p), one centred line, 2–5 words;
  - slam word: 13–35% of frame height (140–380 px), one word; may be bigger than the frame and clipped on
    purpose (V5 "Used to be").
- **One accent colour for the key word** in a caption (blue gradient, lime, the brand colour). Everything
  else white on dark or near-black on light.
- **Word-by-word build** (the signature move, V1/V5): each word enters from blur 10–14 px + x offset
  +24–40 px + opacity → sharp in ~0.10 s (3 frames), on a snappy spring; the next word starts 0.12–0.30 s later
  (on the music's 8th or 16th notes). While the line reads, the whole line keeps creeping (scale 1.00 → 0.96
  or x −20 px over its life). Exit: the whole line blurs 10 px and slides −40 px in 0.10 s while the next line
  is already arriving. Never fade a line in or out without blur and motion.
- **Slam word:** enters from zoom blur (scale 1.3 → 1.0 with 16–24 px blur, 0.12 s), then keeps shrinking
  slowly (~8–12% per second) until a hard cut on a beat. Variant: wide letter-spacing (0.6 em) that closes to
  normal as it lands ("Introducing").
- **Word swap:** a fixed lead-in ("No more") with the last word replaced every ~0.5 s; the new word streaks
  in sideways with a coloured motion smear, on the beat.
- **Text made by the product:** let the product's own interaction write a headline (a selection box drawn
  by a named cursor and the word typed into it; a prompt typed at display size; a counter rolling).
- **Typing:** prompts and URLs type at a big size (caption scale or larger), one character per frame or two,
  with a real caret; the send / enter press is a beat.

## 3. The product (real, close, tilted)
- Use the product's real screens (captured or recreated from its real UI, never invented features). Show
  them in three ways, cycling:
  1. **macro**: one control filling a third of the frame (a button, a field, a toggle, a dimension input),
     with the cursor acting on it;
  2. **tilted plane**: the whole screen as a 3D plane at 15–45° (three.js textured plane; no CSS 3D),
     on a slow dolly or a fast push-in, edges falling into soft focus;
  3. **outputs in depth**: results as cards cascading in 3D space (V1 renders, V5 photo cards).
- Never hold a flat full-screen UI for more than ~1.5 s.
- **The cursor is a character** (see section 3a for its exact look and motion).

## 3a. The cursor (exact)
- **Shape: not the OS arrow.** A short, wide **arrowhead / dart**: a triangle with the tip at top-left, the
  two long sides meeting at about 40–45°, and the back edge **notched inward** (a concave V), like a
  navigation arrow or a Figma multiplayer cursor. Corners slightly rounded (radius ≈ 6% of its size). No
  stem, no tail.
- **Three skins**, one per film:
  1. dark ground (V1): black fill, **thick white outline** (≈ 9–10% of the cursor's height), or white outline
     only (hollow) on very dark UI;
  2. light ground (V3, V6): **solid near-black navy fill (#141826)**, no outline, soft drop shadow
     (y +4 px, blur 10 px, 25%);
  3. collaborators (V1): the same dart filled in a pure colour (orange #F2542D, blue #2563EB), with a
     rounded **name pill** in the same colour attached just below-right of the base ("Sarah", "Robert").
- For pressing and typing, V5 swaps to a **cartoon hand** (white fill, thick black outline) on buttons and an
  **I-beam** over text fields. Use the dart everywhere else.
- **Size:** big — 50–110 px tall at 1080p (V3's is ~200 px in its hero shot). It is a hero object, not chrome.
- **Motion:** enters from off-frame on a curved path, fast then decelerating (default spring), with motion
  blur in flight; settles with a tiny overshoot; **press** = scale 0.88 for ~0.08 s and back (snappy) while
  the target reacts (button darkens / a focus ring lights / the field fills). While idle it never freezes —
  it drifts a few px.
- **The camera follows what the cursor does:** after a click the camera **dives through the clicked thing**
  (V1: the tool button scales ×3 through the frame into the drawing canvas — the click is the transition);
  while typing, the camera **tracks the caret** so the text grows leftward and the caret stays put, and
  slowly pushes in from a small prompt bar to a huge one (V5).
- The cursor can click a button that grows into the next ground (V3 "Get a demo" → lime world), or sweep
  the logo so it lights up in the gradient (V5).

## 4. Grounds and mood (pick ONE per film, change colour per chapter)
- **A. Dark void + glossy 3D forms** (V1): near-black (#030404) with chrome / glassy ribbons, tubes or folds
  lit by one strong colour (electric blue #2F6BFF, or red-orange #E8501E for chapter two), drifting slowly,
  defocused toward the edges, filling 30–60% of the frame. Type sits in the dark part.
- **B. White + pastel aurora fog** (V5, V2): #F9F7F9 base, soft blurred colour clouds (pink #F2D7F2, peach
  #FAE9D6, lilac #D0D0F5, mint) drifting; statements as huge white bold words inside a saturated fog band;
  small dark captions on the white.
- **C. A generated world** (V4, V6): saturated, surreal, one held object per shot (a chair on a flower hill,
  a hammock over a pink fur hill, a retro computer on grass), each shot a slow push; transitions run through
  gradient-map washes (the new shot arrives duotone and resolves into true colour), halftone or pixel
  dither, soft blur.
- **D. Lime/teal gradient tech** (V3): black → teal → lime gradient corners, bright white UI, one lime accent.
- Generated plates (ComfyUI, `install_comfyui.sh`) are for grounds only. Real product, logo and UI stay real.
- **Colour grade per mood:**
  - A (dark): crushed true blacks (83% of pixels near #030404), no milky greys; UI cards #141414–#1C1C1C;
    one saturated light colour with **bloom** on whatever is active (the selected tool, the focused field, the
    send button) — a soft halo only on the focus element, never on idle chrome; a thin **rim light running
    along the top edge of the tilted UI plane**; high contrast, cool.
  - B (pastel): lifted, low-contrast, airy; white dominant (≈ 64% of pixels), text dark grey #2B2B2B, the
    colour lives only in the fog; never pure black except the logo and the send button.
  - C (generated world): saturated, sunny, clean skies; duotone washes in transitions only.
  - D (lime tech): white UI and black text, gradient corners black → teal #152D2A → lime #D8FCAA.
- **Depth of field:** tilted UI is shot with shallow focus — a sharp band across the middle, foreground and
  far edge melting into blur (tilt-shift look). Macro shots too.
- Light: only motivated light — a band of light that sweeps across to carry a change (V2), rim light along
  the 3D forms, a glowing line drawing under a number. Hard window-stripe shadows on a device mockup are a
  good photographic beat (V5).

## 4a. The travelling light and the colour sweep (the user's favourite moments)
- **Travelling gradient light** (V1, the orange chapter): smooth, thick chrome forms (fat tubes, folded ribbons)
  in the void, lit by a gradient studio that rotates, so a band of light glides along the surfaces and the
  chrome changes colour as it passes (deep red → orange → hot gold → pink, with a cyan rim; or the brand's
  chapter palette). In three.js: a dome with a moving colour ramp as the environment map, metalness 1,
  roughness ~0.1, slow camera drift. Reference build: `videos/sterling-v3/grounds/index.html`.
- **Luma gradient sweep** (V4, the astronaut on the hill): the next shot floods in through its own brightness
  levels — bright parts first, then the dark ground — painted by a moving gradient ramp (violet → red-orange →
  amber → the new chapter colour), then relaxes into true colour over ~1 s. Use it to change chapters.
  Reference: `videos/sterling-v3/sweep.py`.
- **Its sound:** a bright, airy, pitchless swell high in the treble (energy 2.5–11 kHz, centroid ~4 kHz) that
  rises over the pass, peaks ~1 s in and blooms off fast — dense tiny noise grains, not a swish. Put it only on
  sweeps and big light passes. Sketch: `videos/sterling-v3/sound/shimmer.py` (pending the user's confirmation).

## 5. Transitions (use 3–5 kinds, each caused by something on screen)
- **On-beat hard cut** between type lines and slams — the default; most cuts land on a beat or half-beat.
- **Object becomes the world**: a clicked button grows into the next ground; a flower folds into the logo
  mark; a symbol slams in over the next background.
- **Whip / zoom with motion blur** between UI views; **page curl** peel of one UI to reveal the next (V3).
- **Light-band sweep** (V2) or **gradient-map wash** (V4) to change worlds.
- **Montage burst**: hold the frame (the product card) fixed and swap the content behind/inside it every
  4 frames for 1–2 s (V6) — the strongest way to show range.
- No crossfades between shots, no spins, no glitches, no light leaks.

## 6. Camera and motion
- Always moving: lines creep, slams shrink, UI planes dolly, 3D forms drift. No frozen stretch over 0.25 s.
- Contrast speeds: calm 2–4 s stretches against 1–2 s bursts. Something new every 0.5–1 s in type sections,
  every 2–4 s at most anywhere.
- Motion blur on everything fast (`data-motion-blur="on"` in HyperFrames, or `--sub` in render.mjs).
- Springs only (CLAUDE.md): snappy for word entrances and cursor presses, default for planes and camera,
  heavy for slams and the logo.

## 6a. The film camera (the user asked for this explicitly)
- **Use /camera-style for how the camera moves** (flat 2D camera, no roll or perspective, exponential ease-in-out moves, holds, zoom dives). It was measured from the user's favourite camera reference and overrides the spring-based camera notes below.
- Motion inside the frame is not enough: there must be a **camera over the whole composition** that the eye has to follow.
- Lay the beats out on one large canvas (each beat at its own x/y position, ~1600 px apart), and move one camera between
  them: pans left/right, tilts up/down, push-ins and pull-outs per beat (zoom 0.9–1.13), a slight roll (±1.5°) on big moves.
- Each move is a spring that starts ~0.3 s before the beat (the camera arrives as the content lands), plus a small sway.
  Content of the old beat stays on its spot while the camera leaves it, so the move reads as travel, not a cut.
- The background world moves with parallax (slower than the type); the camera rides along with typing; motion blur
  on fast moves. Reference: `videos/sterling-v3/film/index.html` (filmCam, SP, ZK, RK).

## 7. The logo ending (quiet)
- Build the logo from its own pieces: the symbol slams in big and blurred and shrinks to size; the wordmark
  letters fly in from scattered positions and snap into the line ~0.1 s apart (V1); or one object folds
  into the mark (V2); or the cursor sweeps it and it lights up (V5).
- Then one small support line (caption scale, 50–60% opacity is fine) or a URL pill with a thin gradient
  stroke. Hold 1.5–2.5 s with a tiny float. No "Get started" banners, no corner labels.

## 8. Sound
- **Music leads.** A modern track at 95–120 BPM with a clear grid; measure beats (beats.json) and put cuts on
  beats or half-beats, word entrances on 8ths/16ths. Use the track's energy dips (to ~25%) as breathers before
  a new chapter, and its lifts for the product reveal.
- Voiceover is optional (V3, V6 use one; V1, V5 do not). Without one, the type carries everything.
- SFX are few and physical: a soft tick for a cursor click, a key tap under big typing, a low thump under a
  slam word, a short riser into the logo. Keep them under the music.
- **Never** (the user hates these): loud "shh" swish sounds on every movement (soft low-passed air passes on camera whips and
  transitions are wanted, see climax-launch/SOUND.md); tonal chimes, piano-like notes
  or melodic SFX that follow motion (e.g. a note per light move). No sound for things that only move.
- Loudness: -14 LUFS for delivery (the references sit at -15 to -16; quiet pastel films like V5 at -24 are
  the exception).

## 9. Storyboard template (30–45 s)
| time | beat | what's on screen |
|---|---|---|
| 0–3 s | hook | problem line built word by word on the mood ground + one striking element; a bold claim |
| 3–6 s | turn | "Time to change it" / "Now" → slam word → logo symbol slams in, wordmark letters assemble |
| 6–9 s | promise | one caption line (what it is, for whom) with the accent word |
| 9–24 s | 3 features | each: caption line → product in macro + tilted plane with the cursor doing the real task → slam word or word swap; change ground colour per feature |
| 24–30 s | range | montage burst (4-frame swaps) or outputs cascading in depth; a number rolling if there is one |
| 30–38 s | ending | the line that matters most, then the logo built from its pieces, support line / URL pill |

Every scene: a caption or slam on screen, the product or the brand object doing something, and the ground
moving. Storyboard it first as frames (one per beat) and show the user before building.

## 10. Checklist before showing anything
- Muted, does the first 3 s make sense and grab? Is there a bold statement on screen by 1.5 s?
- Only two type scales? One accent? Every word entering with blur + motion, none fading?
- Is the product real and shown close (macro / tilted), with a cursor doing something?
- 3–5 transition kinds, each caused on screen? No crossfades, whooshes, chimes, light leaks?
- Cuts on beats? Something new every 0.5–1 s in type sections? No frozen 0.25 s?
- Then the house loop from CLAUDE.md (contact sheet per beat, scores 8+, flow_check, -14 LUFS).
