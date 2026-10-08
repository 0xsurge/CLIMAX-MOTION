# Blend of 5 reference films → one new style ("Carrier")
Sources: 5 uploads (all 16:9, 1276x720, 30 fps). Measured with ffmpeg scene detection, librosa tempo/RMS and EBU R128; looked at 36 frames per film.
Reconstruction, not the original projects. The new style takes grammar only (how things move and are composed), never logos, UI,
characters, claims or footage from these films.

## 1. What each film does best (trait table)
| # | Film (as read from frames) | Length, cuts, tempo, loudness | Best traits to borrow | Leave behind |
|---|---|---|---|---|
| 1 | Kinso (AI inbox) | 46 s, 12 cuts (16/min), ~112 BPM, -15.1 LUFS | Soft two-hue gradient world (peach to teal); words that slide in with motion blur; **a glowing orb that travels through every scene** and becomes UI dots; kinetic phrase stacked beside UI ("It learns / that matters / to you") | The dark hex-grid interlude; "Join 27,300 others" style claims |
| 2 | Nour Aldin showreel | 74 s, 49 cuts (40/min), ~129 BPM, -14.2 LUFS | **Text ring rotating around an icon** ("Stories in every frame"); confident logo build with glow; energy on the beat | Montage of unrelated styles (the opposite of seamless); 3D chrome type; illustration switches |
| 3 | Reception.ai | 32 s, 14 cuts (26/min), ~103 BPM, -14.3 LUFS | **A sentence scattered across the frame with real objects between the words**; dot-matrix (halftone) light fields as backgrounds; the sentence's last word lands inside a glowing sphere ("Until now."); chat bubbles over a soft blur | Pixel-block wipes (read as glitch); long dark ending |
| 4 | ServiceUp | 141 s, 29 cuts (12/min), ~96 BPM, -14.2 LUFS | **Design-tool selection handles** framing objects; a vertical list where the active line lights up with an arrow ("Intake. Shop routing. **Approval.**"); a toggle pill; an orbit of spheres; one accent word per line | Price/percentage claims; frequent switching between light and dark |
| 5 | Pulse | 52 s, **2 cuts**, ~112 BPM, -14.3 LUFS | **One continuous camera gliding over one big canvas**; inline pill chips inside sentences ("**Track** your leads"); a chain of chips that turns into the result; cursor-driven UI; one accent colour on black and white | Dark opening; numeric claims |

What they share: one accent (or one two-hue gradient), short phrases of 2-5 words, UI shown as real screens, ~100-130 BPM, -14 LUFS.

## 2. The new style: "Carrier"
One idea from each film, held together by rules that none of them uses alone:
- **The carrier (1, 3):** a single glowing orb is the guide. It opens the film, becomes the dot on an i, a cursor halo, a chip, a sphere, and the logo mark. Every transition is the orb moving, growing or splitting. This is what stops it looking cut and joined.
- **The canvas (5):** the whole film is one large canvas with one camera. Scenes are places on that canvas; the camera glides between them on springs. No hard cuts.
- **Sentences in space (3) + inline chips (5):** each beat is a short sentence spread across the frame; real objects or product shots sit between the words; the key word becomes a pill chip in the accent.
- **Selection handles (4):** when the film points at something (a product, a screen), it frames it with thin design-tool handles that snap on, then the frame grows into the next scene.
- **Lists that light up (4):** for processes, a vertical list where the active line takes the accent and an arrow; the camera rides down the list.
- **The ring (2):** once, at the turn of the film, a line of text rotates in a ring around the orb or logo.
- **Light fields (1, 3):** backgrounds are a soft two-hue gradient, and once a dot-matrix field of the same hues (as texture, never a glitch).

## 3. Shared rules (what keeps it seamless)
1. One canvas, one camera, one light direction. Hard cuts: zero, except one optional real-photo moment.
2. One carrier object (the orb). Every scene change is the orb moving, growing, splitting or becoming something.
3. Three spring presets only: snappy for chips and handles, default for camera and cards, heavy for big type. No other easing.
4. One ground (light, warm grey), one two-hue accent gradient, ink type. Dark is allowed for one beat at most.
5. One display face + one UI face; 2-5 words per line; one accent word per line.
6. Everything lands on one beat grid; the orb's moves land on downbeats.
7. One continuous music bed with a motif that returns when the orb returns; SFX only on actions (chip snap, handle snap, orb landing).
8. Exits become entrances: whatever leaves a scene carries into the next (text becomes a chip, a chip becomes a list line, a frame becomes a screen).

## 4. Template (fill in per brand)
<inputs>
Brand: [name]   URL: [site or "none"]   Logo: [file / placeholder]
Product UI / product shots: [screens or photos]
Song: [file / pick one, ~100-130 BPM]
Copy: [3-6 short sentences of 2-5 words, each with one key word for a chip], [call to action]
</inputs>
<direction>
Story in one line: [...]
Look: light warm-grey ground, two-hue accent gradient [hue A → hue B], ink type
Type: [display face] + [UI face]
Carrier: glowing orb in the accent gradient
Motion language: one canvas, one camera, continuous morphs, zero hard cuts
Effects: sentence-in-space with objects, inline chips, selection handles, lit list, one text ring, one dot-matrix field
Never: montage of unrelated styles, more than one dark beat, glitch/pixel wipes, invented numbers
Loop: [yes / no]
</direction>
<structure>
Length: [30-45 s]   Aspect: [16:9 / 1:1 / 9:16]   Tempo: [BPM]
1. Orb lands; the opening sentence assembles in space around it (problem).
2. The camera glides; objects/products sit between the words; key word becomes a chip.
3. A selection frame snaps onto the product and grows into the product screen.
4. Lit list: the steps of how it works, camera riding down it.
5. The turn: a text ring rotates around the orb (the promise), on the drop.
6. Product moments: cursor-driven UI, chips chaining into the result.
7. One dot-matrix light field (or one real photo) for the emotional beat.
8. Orb becomes the logo mark; call to action as a chip.
</structure>
<build>
Sound: [downloaded SFX / synthesized], one bed, motif on orb returns
(fixed: Playwright, 60 fps, H.264 CRF 16, -14 LUFS, true peak under -1 dBTP, seam and pop checks, 8+ scores)
</build>
<start>
Show 3 directions as stills (different accent pairs and carrier behaviours), then the beat map and 4 stills of the chosen one for OK.
</start>

## 5. Three starting directions to show as stills
- **A, Warm carrier:** bone ground, brass to rose gradient orb, Bodoni + Geist. Quiet, luxury; fits DRIP VERSE.
- **B, Field:** light grey ground, dot-matrix fields in two cool hues, orb in coral; Geist only. Techy, airy.
- **C, Ink and chip:** white ground, black type, one saturated accent for orb and chips (Pulse-like), selection handles everywhere. Crisp, product-led.
