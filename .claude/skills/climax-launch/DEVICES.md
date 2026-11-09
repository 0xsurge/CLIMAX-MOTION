# The device library (part of /climax-launch)

A **device** is a reusable piece of visual grammar: a move that says something. Each one below has:
- **Says:** the idea it expresses
- **Use when:** the story moment that calls for it
- **Make it:** how to build it in our pipeline
- **Numbers:** measured timings
- **Make it yours:** how to adapt it so it's unique to the brand

Pick devices because the line or story moment *means* what the device says, never for decoration. A film usually uses
5–8 devices, each once or twice. The signature device carries the story's turn.

Sources:
- `videos/reference/device-study/STUDY.md`: TalkSign (D1) and HeyClicky (D2)
- `videos/reference/launch-study/STUDY.md`
- `videos/reference/camera-study/STUDY.md`
- the Sterling film, `videos/sterling-v3`

---

## A. Type devices (the sentence is the scene)

### A1. Live caption (narration typed as spoken)
- **Says:** the film is thinking out loud.
- **Use when:** there's a voiceover, or the copy is a running thought.
- **Make it:**
  - Words appear as they are spoken. Get word timings from `transcribe.py`, or from the beat grid if there's no voice.
  - Lines build down the screen; each word springs in from blur.
  - The current line is full white, older lines dim to about 50%.
- **Numbers (D1, D2):** a word appears on its spoken onset, ±1 frame. Lines are 2–7 words, at caption size.
- **Make it yours:** the build style (blur, slide, letter-by-letter) follows the brand's voice. The same goes for
  which words get the accent.

### A2. Image between words (inline media in a sentence)
- **Says:** the word *is* this thing. It shows and tells at the same time.
- **Use when:** a line names something concrete (a gesture, a person, a product, an avatar, a city).
- **Make it:**
  - The sentence is a flex row. One slot is a rounded media pill the height of a cap, at 1.4–2× the line height.
  - The pill opens from a thin slit (width 0 to full) as its moment is spoken. Its image can swap every 4 frames, or
    hold a short loop.
  - Multiple faces become an overlapping avatar stack.
- **Numbers (D1 14–18 s):** the pill opens over about 6 frames; the next word follows 2–4 frames later.
- **Make it yours:** use the brand's real imagery or UI crops. The pill takes the brand's corner radius and border
  style.

### A3. Living slot (fixed sentence, swapping middle)
- **Says:** one system handles infinite variety.
- **Use when:** "for X", "every Y", the range of inputs or users.
- **Make it:** the fixed text holds, and the centre slot swaps its content every 4 frames for 1–3 s, with corner tick
  marks on the slot.
- **Numbers (D1 0–4 s):** 4 frames per swap, about 30 swaps, and then the slot explodes into a collage.
- **Make it yours:** the bookends are the brand's own concepts (Sterling might be "[model name] → Verified"; TalkSign
  is "binary → Expression").

### A4. Word swap with a highlight
- **Says:** it adapts to *your* thing.
- **Use when:** listing what the product fits into (apps, workflows, teams).
- **Make it:**
  - "your ___": the swapped word arrives in the accent colour, then a text-selection highlight sweeps over it before
    the next one replaces it.
  - The last swap is the payoff, and it settles.
- **Numbers (D2 29–33 s):** about 0.7–1.2 s per word.
- **Make it yours:** the highlight colour and the cursor are the brand's, and the words come from the customer's world.

### A5. Typed name with a caret over a changing world
- **Says:** hello, I'm new.
- **Use when:** the opening or the close.
- **Make it:** the name types at display size with a blinking caret, while the ground behind cycles through the
  palette (a sky gradient, a light wash). The subline types underneath, and the brand mark sits above.
- **Numbers (D2 0–3.5 s):** about 0.07 s per character. The ground shifts hue over the whole typing.
- **Make it yours:** the ground is the brand's world: its sky, its material, its light.

### A6. Visualised sentence
- **Says:** the meaning, drawn.
- **Use when:** any line with a measurable or visual idea (a lot of data, growth, a voice, a route, time).
- **Make it:** build a graphic that grows while the line is spoken: a waveform, a bar, a map route, a counter. Pin the
  words as small boxed tags around it.
- **Numbers (D1 8–13 s):** the graphic grows across the whole line (3–5 s), with tags stacking as words are said.
- **Make it yours:** the graphic is drawn in the brand's own shapes and colours.

### A7. The script as the scene
- **Says:** it understands what you're reading.
- **Use when:** the product reads, understands or summarises.
- **Make it:** the narration paragraph is shown as a document. The current sentence gets a highlighter as it's read,
  and the camera glides along it.
- **Make it yours:** use the product's own document or UI chrome.

## B. Many-and-one devices

### B1. Swarm to form (particles orbit and merge)
- **Says:** many small parts become one whole.
- **Use when:** the product unifies, aggregates or scales (community, data, a network, "every X helps").
- **Make it:**
  - Seeded particles (the brand's shapes: squares, dots, tags) drift.
  - Then each one spirals on its own path (an angle that grows with time, a radius shrinking on a spring) into a
    target point sampled from the final form: a globe, the logo, a word, a product silhouette.
  - Settle it with a slow rotation, and let the last line type beside it.
- **Numbers (D1 41–47 s):** drift for about 2 s, converge for about 1.5 s (most particles land in 1 s), then hold and
  rotate for about 2 s.
- **Make it yours:** the particle shape comes from the brand, the final form is the brand's own symbol, and the
  palette is the chapter's.

### B2. Ring orbit around a line
- **Says:** this sentence is the centre of everything.
- **Use when:** the key promise line.
- **Make it:** 20–40 dots on a large ellipse around the line, rotating slowly (about 10° per second) and breathing
  (radius ±4%), in the brand's colours.
- **Numbers (D2 15.5–19.8 s):** the ring fills about 70% of the frame, and the line sits at caption size in the centre.
- **Make it yours:** the dot shapes and colours follow the brand.

### B3. Burst to many
- **Says:** it scales, it's everywhere, it's a whole catalogue.
- **Use when:** range, the number of use cases, categories.
- **Make it:**
  - A stack of real UI cards grows.
  - Then it explodes into many category tags flying outward in depth, with different sizes for parallax.
  - Most fly past the camera. Clear the frame for the next line.
- **Numbers (D1 33–38 s):** the stack takes about 1.5 s, the burst about 1.2 s.

### B4. Collage burst into a mosaic world
- **Says:** the raw stuff, collected.
- **Use when:** "collecting", "all your…", the input side.
- **Make it:** the slot images throw out into an overlapping collage, which floods into a pixel or mosaic ground in the
  chapter colour with labels floating.
- **Numbers (D1 4–8 s).**

## C. Frame devices (fixed frame, living content)

### C1. Brand chip on many worlds
- **Says:** one product across many lives.
- **Use when:** listing benefits or verbs (Contribute, Earn, Build).
- **Make it:** a centred chip (the brand icon plus a word) holds still while the world behind it cuts on the beat
  (footage, UI, a landscape). The word re-types each time.
- **Numbers (D1 29–33 s):** about 1.3 s per world.

### C2. Colour-block frames
- **Says:** design, energy, the brand as a system.
- **Use when:** a montage of people or use cases.
- **Make it:**
  - Footage sits inside nested flat-colour rectangles of the brand palette.
  - The rectangles rearrange on every beat (scale, swap, slide), and each new photo lands in the same geometry.
  - No camera move: the frames dance.
- **Numbers (D1 21–27 s):** a rearrangement every 0.4–0.8 s, five or six colours.

### C3. Montage burst inside a fixed card
- **Says:** the same structure, endless variety.
- **Make it:** the card is fixed, and its content swaps every 4 frames (the Sterling response card, the V6 plugin card).

### C4. Feature toasts on a calm world
- **Says:** small, friendly capabilities.
- **Use when:** a list of features after the big moments.
- **Make it:** one glass toast at a time (icon, title and one line), centred on a big, slow ground (sky, fog). Each
  rises in and the previous one leaves.
- **Numbers (D2 23.5–29 s):** about 1.8 s per toast.

## D. Portal and transformation devices

### D1. Lens portal
- **Says:** look inside, it lives in your world.
- **Make it:** a glass sphere or lens grows around the hero (with refraction and a rim highlight) until it fills the
  frame and becomes the next world.
- **Numbers (D2 5–6 s):** about 0.6 s from the hero to filling the frame.

### D2. Click becomes the world
- **Make it:** the cursor presses a button, and the button grows into the next ground (V3; the Sterling steps).

### D3. Slit opening
- **Make it:** a thin dark slit opens into a card or frame that becomes the next scene (D1 14 s, from a black bar to
  the orange card).

### D4. Pixel-sort or mosaic reveal
- **Says:** data is the substance of the picture.
- **Use when:** data, AI, the digital side.
- **Make it:** footage is shown as big pixel blocks, and the blocks sort or resolve into the next shot through a
  colour wash.
- **Numbers (D1 18–21 s).**

### D5. Luma colour sweep (Sterling)
- **Make it:** the next shot floods in through its brightness, painted by a moving ramp. Details are in SKILL.md B3
  and the Sterling build.

### D6. Object becomes the logo (V2 flower, V1 symbol slam, D1 mark)
- **Make it:** the hero object folds or shrinks into the mark, or the mark slams in and shrinks to size.

## E. Character devices
- **E1. Mascot with a speech bubble:** if the brand has a mascot, it greets in a typed bubble and travels between UI
  windows as the guide (D2).
- **E2. Notched-dart cursor:** clicks, drags and highlights. See SKILL.md B8.

## F. Structure devices
- **F1. Reprise:** the close repeats the opening line or device (D2 "Meet heyclicky|" at the start and the end), so
  the film feels whole.
- **F2. Recurring motif:** one small element returns across chapters (a binary string, a chip, a dart, a caret).
- **F3. One palette, many grounds:** each chapter gets its own ground, but all are built from the same 5–6 brand
  colours.

## G. Devices from the Resend concept ad (videos/reference/music-ref/STUDY.md)
- **G1. The problem shown as the product's own failure states.**
  - **Says:** "this is what happens to you now".
  - **Use when:** the product fixes a measurable failure.
  - **Make it:** show the real UI failing (0 opens, a Spam badge, an error, a red metric) before the fix. Then show the
    same UI succeeding (Delivered, 98%).
- **G2. Light into caret.**
  - **Says:** something is about to be written.
  - **Use when:** the first frame of a film that starts by typing.
  - **Make it:** a blurred light bar flares, then sharpens and shrinks into the caret, about 0.4 s, and the typing
    starts.
- **G3. Button glow on press.**
  - **Make it:** the button lights in the accent with a few edge sparks, then presses down. Only the pressed element
    glows (motivated light).
- **G4. Pull-out to consequence.**
  - **Says:** zoom out, look what happened.
  - **Make it:** after an action, a fast pull-out (about ×0.5 in under 1 s) reveals the result in a wider context,
    such as an inbox row or a dashboard.
- **G5. Button into orb into status (carrier).**
  - **Make it:** the pressed button collapses into a glowing sphere. The sphere becomes a loader dot ("Sending…"),
    then lands as the status of the next element.
- **G6. Burst then assemble.**
  - **Make it:** many items fly out in depth, then assemble into one final card with status chips orbiting it.
- **G7. A traveling accent.**
  - **Make it:** while a line builds, the accent colour moves along the words. It lands on the key word last.
- **G8. A keyword CTA.**
  - **Make it:** close on a question ("Want this for your launch?") and a pill with a comment keyword
    ("DM me · LAUNCH"). This works with LinkedIn comment-to-DM funnels.
