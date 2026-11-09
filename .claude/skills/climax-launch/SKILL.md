---
name: climax-launch
description: The formula for making launch, promo and product films as good as the Sterling film the user called "the definition of perfect", without repeating it. Principles and decision steps that derive a unique look for each brand. Idea, colour (through colour theory), world, light, transitions, type, cursor, camera, pacing and sound are each worked out from the brand's own meaning, inside a fixed quality bar and the user's fixed taste. Sterling appears only as a worked example. Use it for every launch, promo, teaser or product film; launch-style and camera-style are its reference chapters.
---

# /climax-launch: a formula for unique films, not a template

**The point.** Every film must be unique to its brand: its own idea, colours, world, light, transitions and sound. What
stays the same is the **strategy** that finds those things, the **quality bar**, and the **user's taste**. Never copy
the Sterling film's palette, chrome, sweep or structure into another brand by default. Re-derive everything from the
new brand's meaning. A choice is right when you can say *why it means this brand*, not because it worked last time.

How this file is laid out:
- **Part A:** what never changes.
- **Part B:** the formula, one step per decision, each with its principle, the questions to answer, the options and a
  test.
- **Part C:** the Sterling film walked through the formula, as an illustration only.

The skill has two companion files, read alongside this one:
- `DEVICES.md`: the device library. Reusable visual grammar (images between words, live captions, swarm to form,
  ring orbits, living slots, lens portals, colour-block frames…), each with what it says, when to use it, how to make
  it, measured numbers, and how to make it unique to the brand.
- `TRANSITIONS.md`: the carrier law (the last element of a scene becomes the first of the next), 18 frame-by-frame
  transition patterns, how hierarchy reads, and the measured motion logic (camera holds, objects transform, 4-frame
  punch-zooms on morphs).
- `STORYBOARD.md`: how to read a reference (frames, devices, measurements), how to build a storyboard for a new brand
  by giving each line the device whose meaning matches it, the uniqueness test, and what the storyboard and mood board
  page must show.

---

## Part A: the constants (same in every film)

### A1. The user's taste (fixed)
- **Loves:**
  - bold, premium, confident films
  - one strong idea told visually
  - a camera that travels so the eye has to follow
  - smooth moves with a sharp speed peak, then a calm landing
  - type that builds word by word
  - real brand assets
  - colour that moves as light
  - a sound that rides each big visual change
  - music with a real drop
- **Hates:**
  - pale slideshow pacing, empty white space, "basic" visuals
  - small, timid UI
  - a static camera with everything animating mid-frame
  - anything tilted or bent in 3D (type and UI stay square to the lens)
  - crossfade ghosting
  - garbled text transitions
  - whoosh or "shh" swishes on movement
  - chime, piano or melodic notes that follow motion or light
- **How they work:**
  - They send references and expect them measured, not eyeballed.
  - They approve a mood board and storyboard before the build.
  - They pick the music and the key sound by ear.
  - They watch on an Artifact page.
  - They check the last frame up close.
- Their copy and brand assets are sacred: keep the words exact and use the real logo and fonts.

### A2. The quality bar (fixed craft rules)
- **Hook:** within 3 s, muted, there is text on screen, a striking visual and a bold statement.
- **Pace:** something new every 0.5–1 s in type sections, never 2 s without change. Bursts against calm stretches,
  and a quieter close.
- **Type:** one display face and one UI face (the brand's own). Two sizes, caption and slam, with a big jump between
  them. Every enter and exit has blur plus motion, never a pure fade.
- **Camera:** flat 2D (pan, tilt, zoom), with roll 0° and no perspective on type or UI. Moves use the measured
  exponential ease-in-out (`camMove`, see /camera-style): fast whips with tau about 0.1 s, slow moves with tau about
  0.3–0.7 s. Holds between moves, zoom dives into what matters, directional motion blur that is gone on landing, and
  centred landings.
- **Readability:** type always sits on a calm, high-contrast zone, whatever the background is doing.
- **Light:** only motivated light (it travels, sweeps, draws, pools). No random leaks, no static glow on idle UI.
- **The product is shown real and close:** macro crops of real controls, and a cursor doing real tasks.
- **Sound:** music leads, cut to its measured grid, mixed to −14 LUFS. SFX are few, physical and tied to real events.
- **Render contract:** CLAUDE.md, a pure function of t.
- **Before showing:** a contact sheet, the last frame checked up close, and seams checked after any splice.

---

## Part B: the formula (derive each of these fresh for every brand)

### B1. Find the product truth
- **Principle:** a film is about one truth, not a feature list.
- **Do:** write what the product does, for whom, in one sentence, using the brand's own words. Then write the
  **tension** it resolves as two opposing words: before and after, problem and answer.
- **Test:** can a stranger repeat the sentence after one reading? Are the two tension words opposite and concrete?

### B2. Pick one or two visual ideas that embody the truth
- **Principle:** the whole film is built from one or two objects or metaphors that come from the product itself, not
  from stock imagery.
- **Do:** list five candidate objects from the product's world: its logo's shape, its core action, its unit of value,
  its core noun, a physical stand-in for it. Pick one hero object and at most one supporting idea. The hero should
  be able to **transform** so it can carry the story's turn.
- **Options to consider:**
  - a shape from the logo turned into a 3D material
  - a UI element that becomes the world
  - a physical object (a key, a card, a seed, a lock)
  - a substance (glass, liquid, fabric, paper, light)
- **Test:** does the object belong only to this brand? Can it show both sides of the tension?

### B3. Derive the colour from meaning (colour theory)
- **Principle:** the palette tells the story. It is chosen for what each colour *means* in this film, then tuned with
  colour theory. It is never copied from the website and never reused from another film.
- **Steps:**
  1. **Assign a meaning colour to each side of the tension.**
     - Use colour psychology: warm (red, orange) means urgency, heat, risk or energy. Green means safe, growth or
       passed. Blue means trust, calm or depth. Violet means imagination or premium. Yellow means attention or
       optimism. Neutrals and black mean luxury or focus.
     - Check what the brand's audience and category expect, then decide whether to fit that expectation or break it
       on purpose.
  2. **Anchor on the brand.** One side usually starts from the brand's real accent colour, pushed in value and
     saturation until it can glow. The other side is chosen to contrast with it.
  3. **Choose the harmony between the sides.** Pick the relationship that matches the story's shape:
     - **Complementary (opposites):** for a reversal or before-and-after.
     - **Split-complementary:** for a softer turn.
     - **Analogous:** for a gentle evolution.
     - **Triadic:** for something playful and many-sided.
     - **Value contrast (dark to light):** when the story is about clarity.
  4. **Build each side as a ramp, not a swatch.** Use 4–5 analogous hues from deep to bright, plus one bolder jump,
     so moving light has somewhere to travel.
  5. **Add a temperature rim.** A thin edge light of the opposite temperature keeps forms readable and adds depth.
  6. **Pick the ground's value.** A dark void makes colour glow (premium, tech). A light ground feels airy and open
     (lifestyle, calm). A saturated world feels playful. Choose it from the brand's personality, but keep the type
     zone calm either way.
  7. **Plan the bridge.** When one palette must turn into the other, check the midpoint of the mix. If it goes
     muddy (opposites mixed straight through grey or brown), route through a clean third hue.
  8. **Keep accent discipline.** Type stays neutral, and only the key word takes the chapter colour. Glow only on the
     active element.
- **Test:**
  - Can you say what every colour means?
  - Does the turn of the story show as a change of colour?
  - Is the type readable on every frame?
  - Does it look like this brand and no other film you have made?

### B4. Invent the world (ground and material)
- **Principle:** the background is a place the brand's idea lives in, built from the hero object, lit by the palette.
- **Do:** choose the material and space from the brand's personality:
  - glossy chrome or glass for precise or technical brands
  - soft fabric, fog or paper for human or gentle brands
  - liquid for fluid ones
  - a generated landscape for imaginative ones
  - real photography for place-based ones (generated images only for sets, never in place of real products)
- Decide its depth of field, its motion (slow drift, parallax against the camera) and how much of the frame it
  fills. Leave the type zone calm.
- **Test:** would the world still read as this brand with the logo removed?

### B5. Decide how colour moves (light design)
- **Principle:** colour should move. Moving light is what makes a film feel alive and expensive.
- **Options:**
  - light travelling across forms, so surfaces change colour as it passes
  - a band of light that sweeps across to carry a change
  - a glow that draws along a line or outline
  - light pooling under an object
  - a rim light running along an edge
- Choose the ones that fit the material: reflections suit chrome, translucency and caustics suit glass, soft
  diffusion suits fabric and fog.
- **Test:** is every light move motivated by something in the story or the material?

### B5a. Choose the devices
- **Principle:** each line gets the device that *says* what the line says (see DEVICES.md and STORYBOARD.md §2).
- **Do:**
  - Use 5–8 devices per film, each once or twice. Pick one signature device for the turn.
  - Alternate type-led and image-led moments.
  - If there's a voiceover, it becomes live captions and sets the timing.
- **Test:**
  - Can you say for every beat why that device fits that line?
  - Would that beat make sense for another brand? If yes, make it specific.

### B6. Design the transitions
- **Principle:** each change of scene is caused by something on screen, and the biggest one is the story's turn.
  Use carrier transitions (TRANSITIONS.md): plan each one as carrier, transformation and arrival.
- **Do:** choose 3–5 transition kinds for the film.
  - The **signature transition** carries the main turn, and its form should express the turn itself. A colour turn
    suits a colour flood or a brightness-keyed sweep. A reveal suits an object opening or a dive into it. A
    transformation suits a morph of the hero object.
  - The rest come from:
    - a cut on the beat
    - a whip pan with motion blur
    - a click that grows into the next ground
    - an object becoming the world
    - a page scroll
    - a zoom dive into UI
- **Never:** crossfades, spins, glitches, light leaks.
- **Test:** can you name the cause of every transition?

### B7. Type voice and text animation
- **Principle:** the type is the narrator. Its motion should feel like the brand speaking.
- **Do:**
  - Use the brand's display face.
  - Pick the build style from the brand's voice: word by word from blur for confident or technical, letter by letter
    for precise or playful, line wipes for calm.
  - Pick a slam treatment for the few lines that matter most.
  - Pick a word-swap device for lists (the lead-in stays, the end word changes on the beat).
  - Decide how the product itself writes text: typing, counters, a cursor drawing a selection.
- **Test:**
  - Are all the lines 2–5 words?
  - Does every word land on the grid?
  - Is it readable at phone size?

### B8. The cursor and the UI as characters
- **Principle:** the product is shown being used, close up, by a cursor with intent.
- **Do:**
  - Choose the cursor skin to suit the ground: on dark, a dark fill with a thick light outline; on light, a dark
    solid fill with a soft shadow. Collaborators get coloured cursors with name pills.
  - Choose the real UI moments worth a macro shot: the one button, the one field, the one result.
  - The click is a beat: press, react, and often transition.
- **Test:** does every UI moment show real product behaviour?

### B9. Choreograph the camera
- **Principle:** the camera is a guide that travels through one big composed space. It is flat and never bends the
  content.
- **Do:**
  - Lay the beats out on one large canvas, each at its own place.
  - Plan the route so the directions alternate (down, right, up, right…) and match the story: dive towards
    revelations, pull out for context, push in slowly for the close.
  - Plan the zoom choreography (dives at landings, a punch-in on the key slam).
  - Plan the holds.
  - Mix fast and slow `tau`.
  - Consider a ride-along with any typing.
- **Test:** draw the route as a path on paper first. Does it flow without doubling back pointlessly? Does every
  landing centre its subject?

### B10. Pace to the music
- **Principle:** music is the clock. The structure follows its energy.
- **Do:**
  - Choose music for the brand's energy: a hard drop for bold launches, a gentle groove for calm brands.
  - Offer the user 3–6 options with previews cut to their drops.
  - Measure the beat grid. Put the **first slam on the drop**, inside the first 2 s.
  - Map the story onto the track: hook during the build, the slam on the drop, the turn on a lift, the features in
    the high-energy stretch, the close on the outro.
  - Assign each beat a length in whole or half beats.
- **Test:** does each section's energy match the music under it?

### B11. Design the sound
- **Principle:** sound makes the visuals physical. Every effect is tied to a real event, and each film gets one
  signature sound for its signature visual.
- **Do:**
  - **The signature sound.** Derive it from the signature transition's material and motion: what would this light,
    substance or object sound like? Sketch it in code, check it against any reference with a spectrogram (study
    the shape, not just the averages), then offer variants on top of the actual music and let the user pick by ear.
  - **Small physical hits.** A thump under slams, a click under presses, quiet taps under typing, a tick per checked
    item.
  - **Never** whooshes on movement, never melodic or tonal notes following motion.
- **Test:** mute the music. Do the SFX only mark real events? With the music, are they felt more than heard?

### B12. Study, prove, then build
- **Principle:** decisions are proven before the full build, and references are measured.
- **Do:**
  - Measure the references: contact sheets, cut detection, beat analysis, optical-flow camera graphs, spectrograms.
    Write the findings into a study file.
  - Make a **mood board and storyboard Artifact page**. It holds:
    - the idea in colour (a rendered ground for each chapter)
    - a short motion test of the signature effect
    - the palette with the meaning of each colour
    - type, cursor and sound references next to your sketch
    - every beat as a full-size still made from the real assets, with timing, motion and sound
  - Wait for approval. Iterate on the sound separately.
  - Build, check the contact sheet, fix, then do the full render. Deliver on an Artifact page, commit and push.

---

## Part C: worked example (Sterling): how the formula produced one unique film
This shows the reasoning, not a template to reuse. The build is in `videos/sterling-v3/`.
- **B1, truth:** "One API key for every model, routed only to verified providers." The tension is **claim against
  check**.
- **B2, idea:** the brand's own check mark, turned into the hero object. The claim is something unproven and the
  check proves it.
- **B3, colour:**
  - **Meanings:** the claim is risky and hot, so red-orange (seeded from the moving orange light the user loved in a
    reference). Verified is safe and passed, so emerald (anchored on Sterling's accent #059669, pushed into glowing
    mint and lime).
  - **Harmony:** red-orange and green are near-complementary, which suits a reversal.
  - **Ramps:** ember, red, orange, gold, then a jump to pink; deep green, emerald, mint, lime, then a jump to teal.
  - **Rims:** cyan against the warm side, ice blue against the green.
  - **Ground:** a true black void, for a premium developer tool.
  - **Bridge:** orange mixed straight into green goes muddy, so the sweep routes through violet.
  - **Type:** neutral, with only the key word in gradient.
- **B4, world:** chrome bent from the check-mark stroke plus folded ribbons. Precise, technical, glossy, fitting an
  infrastructure brand.
- **B5, light:** a rotating gradient dome, so the light travels over the chrome and recolours it as it passes.
- **B6, transitions:**
  - **Signature:** a brightness-keyed colour sweep from claim to verified, because the turn is a colour change.
  - **Others:** a slam on the drop, word swaps, whips, a click that grows into an emerald flood, the logo built from
    its pieces.
- **B7, type:** Zalando Sans Expanded. Words build from blur; slams on "claim." and "Verified." as a question and
  its answer; word swaps for the model names and the five checks.
- **B8, product:** the key card with Copy pressed, the endpoint typed huge, the provider list checked row by row, the
  response card swapping models.
- **B9, camera:** a route of down, right, up, right, down, right, up, right, down, with dives at the mark and the
  Copy button, a punch-in on "Verified.", a pull-out for the logo and a slow push to close.
- **B10, pace:** Thunder at 95.9 BPM, with the drop on "claim." at 1.9 s and 14 beats in 30 s.
- **B11, sound:** the signature "glitter zips" (bright downward micro-chirps, 16 kHz down to 8 kHz in 20–40 ms,
  in clusters), measured from the reference's sweep and picked by the user, plus thumps, clicks and taps.

Another brand would come out entirely different through the same steps.
- **Example:** a calm meditation app. Its tension might be noise against stillness; its idea, a ripple; its colours,
  analogous blues into warm dawn on a light, airy ground; its world, soft water and fog; its signature transition,
  a ripple that spreads; its sound, soft water drops; its music, a gentle build.

---

## Part D: build notes and traps (how to execute any of the above here)
- **Build:**
  - One `film/index.html` with `window.seek(t)`: a canvas world (three.js where 3D is needed), flat cards drawn
    through the camera transform, then DOM type, cursor and logo in keyed wrappers.
  - Render with `node .claude/skills/motion-reel/scripts/render.mjs`. Heavy WebGL takes 3–4 s per frame on this
    CPU: run it in the background and report honest progress. Don't use the HyperFrames renderer for heavy WebGL
    (it stalled).
  - After a small fix, render only the changed span (`--from`/`--to`), splice with ffmpeg, mix again, and check the
    seam.
  - Mix with `mix.py` (−14 LUFS). Check with `flow_check.py --fps 30`; the measured whips read as jerks by design.
- **Traps:**
  - Brightness sweeps done in WebGL render targets lose tone mapping and go muddy. Do them in 2D on the finished
    frames.
  - Resetting `style.display = ''` wipes inline flex centring. Restore the stored mode.
  - A line kept on screen for the camera's exit can ghost into the next scene.
  - Opacity crossfades between states leak content.
  - Text on bright backgrounds needs a calm band behind it.
- **Delivery:** an Artifact player page (re-encode at CRF 20). Commit the 1080p file with `git add -f`. Captured
  brand files, music sources and renders stay git-ignored.
