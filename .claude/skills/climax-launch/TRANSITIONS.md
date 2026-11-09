# Transitions, hierarchy and motion logic (part of /climax-launch)

Learned by stepping through every transition at full frame rate in the TalkSign (D1) and HeyClicky (D2) films, and by
measuring their cameras with `camflow.py`. The strips are in `videos/reference/device-study/tr/`, and the camera graphs
are in `graphs_D.png`.

## The core law: nothing cuts; something carries
In these films a transition is almost never "shot A, then shot B". **The last element of one scene becomes the first
element of the next.** A shape, a box, a colour, an icon or a word survives the change and turns into something else.
- The eye never loses its anchor, so the film feels like one continuous thought.
- Panning and zooming the camera are not the transition. **The objects are.**

For every transition, plan it in three parts:
1. **The carrier:** what survives from the old scene (a rectangle, the chart's bars, a chip, the hero object, a text
   cursor, a dot pattern, a colour field).
2. **The transformation:** what the carrier does (grows, collapses, splits, morphs shape, changes material, bursts,
   gathers).
3. **The arrival:** what it becomes in the new scene, and on which word or beat it lands.

## The transitions seen frame by frame (each is a reusable pattern)

| # | pattern | what happens (measured) | carrier |
|---|---|---|---|
| T1 | **Photos dissolve into pixels** | the last photo collage breaks into square pixel blocks, which become a plum pixel-mosaic world (D1 4.5 s, about 3 frames) | the images' own pixels |
| T2 | **Block morphs into the graphic** | the mosaic clears to black, a solid orange rectangle appears, then squashes and ripples into the audio waveform (D1 7.8 s, about 5 frames) | a flat colour block |
| T3 | **The graphic's bars become the wipe** | the waveform's bars widen into tall slabs that slide across like blinds, revealing footage, which arrives **duotone** (orange and pink) and resolves into true colour (D1 11.6 s, about 8 frames) | the chart's own bars |
| T4 | **Matte box** | a flat rectangle grows over part of the footage, new content swaps inside it, then the box collapses to a thin dark slit, and the slit opens into the next scene's card (D1 13.4–14.6 s) | a rectangle |
| T5 | **Slit opens into a card** | the dark bar on orange widens into the caption card; the words type inside it (D1 14.6 s) | the slit |
| T6 | **Pixelated subject, scattered words** | the next speaker appears as large pixel blocks, and the words of the line are placed one by one in empty space around the person, not in one row (D1 18 s) | pixels |
| T7 | **Frames collapse into the logo** | the colour-block frame montage shrinks to a small box in the centre of a white frame, and the box becomes the logo icon, then the wordmark types beside it (D1 27 s) | the frame's shape |
| T8 | **Logo icon becomes the product chip** | the logo shrinks away; its icon reappears as the bullet of a "● Contribute" chip on footage. The chip stays and its word swaps (Contribute, Annotate…) while the world behind changes (D1 29–33 s) | the icon |
| T9 | **Chip grows into a card** | the "● Build better AI" chip expands into a big peach card, the icon stays pinned in the corner, and the card fills with real UI (D1 34–35 s) | the chip |
| T10 | **Stack flies to camera, bursts to many** | one card from a stack scales past the lens while the stack explodes into dozens of tags in depth (D1 37.6 s, about 0.4 s) | the card |
| T11 | **Particles into a form, and back to empty** | the drifting squares converge into the globe; the globe vanishes to an empty orange field, and the next line types alone (D1 41–47 s) | the particles |
| T12 | **Smash-scale on type** | the small typed title jumps to display size in 1–2 frames with motion blur, as the caret blinks (D2 1.4 s) | the title |
| T13 | **Lens portal** | a glass sphere grows around the mascot, refracting the world, and fills the frame as the desktop (D2 5.3–5.6 s, about 8 frames) | the mascot |
| T14 | **The background drops away** | the desktop wallpaper vanishes and the camera pulls out, leaving one app window floating on white (D2 8.3 s) | the window |
| T15 | **Layout reflow** | windows and chat bubbles swap places sideways on the beat, so the composition rearranges itself, not the camera (D2 10.6 s and 12 s) | the windows |
| T16 | **Window to script** | the camera dives into the window and lands on the narration paragraph, where the current sentence gets highlighted (D2 12.7 s) | the text |
| T17 | **Dot grid becomes a ring** | the "Give it a Goal" dots in a neat square grid spread out into a large orbiting ring as the next line types (D2 16.5 s) | the dots |
| T18 | **Edit the text as the transition** | "your ai buddy": the word is selected, then deleted letter by letter ("youddy"), then the frame clears to "Meet he|" typing again. The text editor is the cut (D2 32.4 s) | the caret and selection |

Use T1–T18 as the menu. For a new brand, invent new carriers from the brand's own shapes. Ask what in this frame can
**become** the next thing.

## Hierarchy (why it reads so clearly)
1. **One reading point at a time.** At every frame there is exactly one place the eye goes: the word being typed,
   the object transforming, or the card opening. Everything else is still, small or faint.
2. **A small voice against big pictures.**
   - Captions are small and precise: about 2.5–4% of frame height in D1, regular or light weight.
   - The visuals are huge.
   - Hierarchy comes from that contrast, not from huge type everywhere. Large display type is kept for the name
     only (about 8% in D2).
3. **Text sits beside the subject, never on top of it.** Words are placed in empty space around a person, beside the
   chart, or under the mascot. Composition goes subject on one side and words in the clear space.
4. **Labels as a third level.**
   - Tiny boxed tags ("from | hundreds | of | thousands", "Expression", "sign language models") pin meaning to things.
   - These are the label level of the three-level hierarchy (display, support, label).
5. **A quiet structural grid.** A faint grid (orange-on-orange in D1, a pale wireframe in D2) sits behind the content.
   It gives order and a sense of system, and it carries the motion (things snap to it).
6. **One palette, flat colour fields.**
   - **TalkSign:** orange, plum, lilac, peach, black and white.
   - **HeyClicky:** sky blue and white.
   - Both use flat fields with no gradients on UI. Colour fields themselves are used as shapes (blocks, slabs, frames).

## Motion and camera logic (measured)
- **The camera mostly holds still and the objects move.** The camera is nearly still 57% of the time in D1 and 72% in
  D2. Roll is almost zero.
- **Punch-zooms on the transition frame.**
  - D1's camera moves are short snaps: 4-frame (0.13 s) zoom pulses of ±5–30%, landing exactly on cuts, on morph
    moments and on the burst. They give each transition a physical kick.
  - D2 uses a few longer, smoother zooms (0.5–0.8 s, ×0.65) at the opening and the lens.
- **The animation lives in shape changes:** scale, squash, split, collapse, open, burst, gather, reflow. Position
  moves are short and direct.
- **Timing:** each transition takes 3–10 frames, and the new scene's first word lands on the next spoken phrase.
  Holds are filled by typing.

## How this combines with our camera (camera-style)
Both work together. Use the travelling flat camera (camMove, holds, zoom dives) for the **film's spine**, and use
**carrier transitions** for the scene changes.
- When the camera arrives somewhere, something there transforms into the next thing.
- Add a 4-frame punch-zoom (±8–15%) on the exact frame of a morph or burst to give it weight.
- When the camera holds, the objects should be doing the work.

## Storyboard rule (add to every storyboard)
For each cut between beats, write the **carrier, transformation and arrival**. If a transition has no carrier, it's a
plain cut: allowed at most two or three times per film, and only on big beats.

## More carriers (from the Resend concept ad)
| # | pattern | carrier |
|---|---|---|
| T19 | **Light flare into caret:** a blurred light bar sharpens into the typing caret (0.4 s) | light |
| T20 | **Click into pull-out:** the press is followed by a fast ×0.5 pull-out, and the composer becomes one inbox row | the UI element |
| T21 | **Button into orb into loader dot:** a pressed button collapses into a glowing sphere, which becomes the "Sending…" dot | the button |
| T22 | **Burst into assembled card:** items fly out, then assemble into one card with orbiting status chips | the items |
| T23 | **Number into light pool into caption:** a huge number lands on a glow, shrinks and lifts, and the caption builds beneath | the number |
Note: Resend's camera rolls and tilts its planes in 3D. The user's flat-camera rule (camera-style) still applies by default.
