# Storyboarding and mood boards (part of /climax-launch)

How to turn a brand and a script into a unique storyboard, using the formula in SKILL.md and the devices in
DEVICES.md. The storyboard is where the film is decided. Building is execution.

## 1. Read a reference intelligently (for every new reference the user sends)
1. **Overview:** a 1 fps contact sheet of the whole film, plus scene-cut detection
   (`select='gt(scene,0.3)'`). Write the film as a list of scenes with timings.
2. **Device strips:** 5–15 fps strips through every distinct moment. For each one, write down what moves, from where
   to where, how long it takes, what triggers it, and what it means.
3. **Measure:**
   - the beat and tempo, and how cuts line up with the beat (cut-to-beat median against chance)
   - loudness
   - a transcript (`transcribe.py`), to see whether visuals follow the voice
   - optical-flow camera curves if the camera moves (the camera-study method)
   - spectrograms for any signature sound
   - the dominant colours
4. **Extract devices, not shots.** For each moment, write the device card (says, use when, make it, numbers, make it
   yours) into DEVICES.md if it's new. Never store a shot to copy; store the idea that made it work.
5. **Write the study** into `videos/reference/<name>/STUDY.md`, with the sheets in a git-ignored folder.

## 2. Build a storyboard for a new brand
1. **Script first.**
   - Use the brand's own words. Split them into lines of 2–7 words. Mark each line's job: hook, problem, turn,
     promise, proof, range, how, close.
   - If there's a voiceover, the lines are its phrases. If there isn't, they are what the type says.
2. **Find the spine.** The tension (SKILL.md B1), the hero object (B2), and the colour story (B3). Name the
   **signature device** that will carry the turn.
3. **Give each line a device by meaning.** Ask what the line *says*, then pick the device that says the same thing:
   - something concrete named: an image between words (A2)
   - a quantity or a process: a visualised sentence (A6)
   - "many become one": swarm to form (B1)
   - "it fits your X": a word swap with a highlight (A4)
   - a range of uses: burst to many (B3), a montage inside a fixed card (C3), a brand chip on many worlds (C1)
   - the key promise: a slam word, or a ring orbit (B2)
   - entering the product: a lens portal (D1), or a click that becomes the world (D2)
   - the turn: the signature device
   - the close: the logo built from its pieces, plus a reprise (F1)
4. **Vary the rhythm.** Alternate dense and calm, type-led and image-led, fast and slow. No device three beats in a
   row. Something new every 0.5–1 s in dense parts.
5. **Plan the grounds.** One palette across chapters (F3); the ground changes as the chapter changes.
6. **Plan the camera route** (SKILL.md B9) through the beats, and where it holds.
7. **Time it to the music or voiceover.** Cuts and device starts land on phrase starts (with a voiceover) or on
   beats (without).
8. **Recurring motifs (F2) and a reprise (F1)** stitch the film together.
8a. **Write each transition as carrier, transformation and arrival** (TRANSITIONS.md). A beat change with no carrier is
    a plain cut: two or three per film at most.
9. **The uniqueness test.** For every beat, ask: would this beat make sense for a different brand? If yes, it's
   generic. Change the image, the object or the words until it only fits this brand.

## 3. The storyboard page (what the user sees)
- **Idea:** the one-sentence truth, the tension and the hero object.
- **Colour:** each chapter's ground rendered as a still, the palette with what each colour means, and the bridge.
- **Motion test:** a few seconds of the signature device or effect.
- **Type and cursor:** samples.
- **Sound:** the reference clips next to our sketches. The user picks by ear.
- **Beats:**
  - **Each beat:** a full-size 1920×1080 still from the real assets, plus its timecode, the line, the device used,
    the motion, the camera and the sound.
  - **A device legend:** which devices the film uses and why each one fits its line.
- **The ask:** close with the exact questions the user needs to answer (look, order, sound, music).

## 4. Mood board principles
- Show the film's own world, rendered from our pipeline, not a collage of other people's images. References appear
  only as small "inspired by" notes beside our version.
- Every swatch says what it means. Every still shows real brand assets.
- Show motion wherever motion is the point. A still of a sweep is weaker than a 5-second clip of it.
