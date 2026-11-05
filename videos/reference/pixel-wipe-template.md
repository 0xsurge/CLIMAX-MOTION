# "Pixel Wipe" style: reverse-engineered from the HyperFrames "/reverse-any-video + skills update" launch film
Source: 60.9 s, 1920x1080, 30 fps, AAC 44.1 kHz. Music measured at 112 BPM (beat 0.535 s, first beat 0.63 s); loud from ~4 s to ~50 s,
then drops for the end card. 12 detected scene changes in 61 s: long stretches are carried by in-frame moves, only a few real cuts.
Measured motion: bursts of fast movement (12-16 mean change/frame) on every transition, then calm reading holds; 26% of frames are
near-still, because the type is given time to be read. (Our house rule "never hold still" would add a slow drift to those holds.)

## The look in one line
A cream studio page that keeps getting taken over by colour: mint, ice blue, ink black and a deep teal gradient, each swap carried by a
pixel-block wipe, a card that grows to full frame, or a word that lands and morphs. Clean grotesk type, real product UI, a cute mascot.

## Palette (sampled)
| Role | Hex |
|---|---|
| Paper (base) | #F1EFEA cream, #F8F8F2 white |
| Brand accent | #3FE8A8 mint (fills, highlight words, buttons) |
| Ink | #16130E warm near-black (cards, editor, terminal) |
| Cool panel | #D9F3F5 ice blue |
| Hero gradient | deep teal #0E7FA0 → cyan #22C6D6 → mint, soft and blurred, often behind giant type |
One accent (mint) carries the whole film; the teal gradient is its deeper shade, never a second brand colour.

## Type
- One grotesk family (a geometric sans, Inter / Graphik class), three sizes with big jumps: giant display (a single word filling the
  frame, ~500 px), statement lines (~110-130 px, two lines, centred or set left inside a card), small UI/body (~22-28 px).
- Highlight by colour, not weight: the key word turns mint ("your style.", "update", "explained").
- Code and commands in a monospace on ink ("/reverse-any-video", "npx hyperframes skills update"), typed in a word at a time.
- Lists as a rolling stack: the current item large and dark, neighbours smaller and faded, the stack scrolls ("Motion graphics /
  Talking heads / Any video / Live action / AI footage").

## Signature moves (the grammar)
1. **Collage scatter opening** (0-4 s): a dozen real thumbnails and UI cards scattered on cream, sliding diagonally across at different
   speeds (parallax), then cleared as one card takes the centre.
2. **Card to frame**: a small card (a pill, a tile, a button) grows until it becomes the next scene's background. Mint card → mint
   full-frame list; ink card → the dark "Any video, now in your style." chapter card.
3. **Pixel-block wipe**: the scene is replaced by a grid of square blocks (~60-120 px) in the next scene's colours, stepping in and out
   in a staggered, stepped pattern (sharp edges, no fades). Used for the cream ↔ teal "Free" swaps. It is the film's main transition.
4. **Giant word behind a product**: one huge word ("Free") set in pale gradient type, a real product cutout (headphones, a microphone)
   sitting over it with a small tag ("10,000+ TRACKS", "LOCAL TTS"); the object floats and turns slightly.
5. **Kinetic word sequence**: one word at a time, large, tilted, landing with a bounce and leaving ("skills / are / out / of / date"),
   letters morph into shapes (the "o" of "out" grows into a ring that fills the frame, then shrinks back into the letter).
6. **Prompt-box demo**: a real chat input; the command highlights in mint, the prompt types out, an attachment drops in, the cursor
   clicks send, the camera rides in on the send button.
7. **Real UI in perspective**: the product's editor tilted in 3D on dark, glowing, the preview inside it changes; the camera dollies along it.
8. **Chapter card**: ink background, giant two-line statement (white + mint), a big chapter number (01, 02) bottom right, an arrow,
   a tiny breadcrumb top right ("HyperFrames / reverse-any-video"), an underline that draws under the key words.
9. **Floating chips around one word**: "every [model]": small UI chips with model names fly in on arcs around a sentence and settle.
10. **Mascot lockup**: the mascot (a rounded triangle character) bounces in big, squashes, flaps its side wings, settles beside the
    logo; the end card adds the install command in a small pill under the logo.

## Motion
- Fast, springy moves with visible overshoot on the playful beats (words, mascot), tight snaps on UI.
- Transitions are short (8-14 frames), holds are long enough to read (1-2 s). Cuts land on beats.
- Blur is only used as depth (background cards out of focus behind the hero), never as a transition.

## Structure (61 s)
| Time | Section | What happens |
|---|---|---|
| 0-4 s | Hook | Collage scatter of real work; one card wins the centre |
| 4-7.5 s | Promise | Mint takeover; rolling list "Motion graphics / Talking heads / Any video / ..."; "Any video can be reversed." |
| 7.5-9.5 s | Product | Mascot + "with HyperFrames Pro" on mint |
| 9.5-12.5 s | Demo | The chat prompt: /reverse-any-video, attachment, send |
| 12.5-16 s | Reveal | "Introducing /reverse-any-video", "Now available in HyperFrames / OSS" |
| 16-22 s | How it works | Feature chips, the editor in perspective, "Every layer editable", "Rebuilding the motion" with a step list |
| 22-24 s | Pivot | Pixel grid, "Reverse" type stack |
| 24-26 s | Chapter | "Any video, now in your style." chapter cards 01 / 02 |
| 26-31 s | Breadth | "Pro doesn't just rebuild videos", "every [model]" with chips |
| 31-38 s | Offer | "Free with sign-in" card: 10,000+ tracks, 75,000+ images, voice minutes |
| 38-44 s | Free | Pixel wipes between cream scenes and giant "Free" + headphones / microphone |
| 44-48 s | Turn | Kinetic words "skills are out of date", "It's time for an upgrade" |
| 48-54 s | CTA | Pixel collage, "SKILLS UPDATE", "npx hyperframes skills update" typing |
| 54-61 s | End | Mascot bounces in, HyperFrames logo, install command pill |

## Sound
112 BPM electronic track, hits on scene changes; typing ticks on the commands; pops on chips; quiet tail under the end card.

---

# Prompt template (fill the [BRACKETS])
<inputs>
Brand: [name]. URL: [site] (capture the real logo, mascot or mark, colours, font, product UI, product cutouts).
Song: one Mixkit track, 105-120 BPM, energetic electronic, with a quieter tail for the end card. Sound effects: downloaded Mixkit SFX.
</inputs>
<direction>
Style: "Pixel Wipe" (videos/reference/pixel-wipe-template.md).
Base: cream paper; one brand accent [hex] for fills and highlighted words; ink [hex] for chapter cards and code; a deep gradient of
the accent for the "giant word" scenes.
Story in one line: [what the product does].
Moves to use: collage scatter hook, card to frame, pixel-block wipes on the big swaps, giant word behind a real product cutout,
a kinetic word sequence with one letter morphing into a shape, a real prompt or UI demo, chapter cards 01 / 02, chips around one word,
the mascot or logo lockup with the install command or CTA.
Never: fake UI, invented numbers, crossfades, film grain, glitches, light leaks.
</direction>
<motion>
House rules win: springs only (snappy on UI, playful only on the mascot and the kinetic words), one camera that never fully stops
(a slow drift through the reading holds), pixel wipes stepped on the beat grid, centred lockups.
</motion>
<structure>
[length, default 45-60 s, 16:9]; hook in the first 2 s; something new every 2-4 s; CTA in the last 6 s.
</structure>
<checks>
Contact sheet per beat, flow_check.py (no pops except intended wipes, no still stretch of 0.25 s, centre within 8 px), -14 LUFS.
</checks>
