# Craft rules approved on the Obi Igwe reel (part of /climax-launch)

The reel is a 34 s portfolio film that the user called "lovely", reached after many rounds of feedback. The build is
`videos/obi-reel/film/index.html` and its storyboard is `videos/obi-reel/STORYBOARD.md`. These are the rules that came
out of the feedback. Apply them as principles for every brand, not as a template.

## Pace (user-approved)
- **The base pace is fast:** transitions take 3–10 frames, words come in every half beat, and holds are short.
- **Slow down only the one statement that must be read in full**, about 1.6× (the Obi reel's "I turn complex products
  into clear stories"). Everything else stays fast. Slowing the whole film was rejected as too slow.
- **The product swap is split-second:** about 6 frames per item, a quarter to a fifth of a second each.
- The time-warp approach in the film page does this: insert a hold for the swap, stretch one span, and keep the rest
  as it is.

## Type and text
- **No tiny text, ever.** Small labels are bold, large (36–52 px at 1080p) and in a real designer face. The Obi reel
  used **Satoshi** from Fontshare, which is free for commercial use. Never use small spaced-out monospace caps; they
  read as AI filler.
- **No filler captions or counters:** no "1 of 6", no "Selected work", no "Brand · Product film" lines under the frames.
- **Make key small lines stand out with highlight boxes:** bold italic white on a bright contrasting box (orange
  #F26A1B on the light-blue ground).
- **Switch type colour with the ground:** white on dark; dark navy (#0B1B3F) on light. On a photo, use navy plus a
  soft white glow. Never put an accent colour on a ground of the same hue.
- **Buttons and slots:** no step numbers; centre the text in the button.

## Grounds and colour
- **Avoid big fields of thick saturated colour:** the full #3D7BFF flood was "too much". Use light gradients instead,
  taken from the brand's own imagery (the light blue behind the client's portrait: white centre, #A9C6F0 edges).
- **Mix grounds across chapters:** dark rooms, light gradient sections, and **one live photographic world**. The user
  loves a bright green meadow under a blue sky (a reference from the astronaut film). Use a slow push and reveal it
  through the carrier (a circle opening out of a dot).
- **Put a real picture behind every UI card or slot:** a big, softly blurred still (blur about 26 px), changing with
  the content.

## Real imagery everywhere
- **Every frame, box, pill or orbit item holds a real image:** scenes, products, UI. Never an empty outline or plain
  dots.
  - The focus frame shows a real scene sharpening inside it.
  - The orbiting dots became 22 scene thumbnails.
- **The product swap (a living slot):** "Your [product]" becomes a card that flips through real products and brands.
  - **Physical products:** real photos with the background removed (rembg `isnet-general-use`), on a light card, each
    with a light sweep and a soft click.
  - **Logos:** flat, the real artwork (Wikimedia / Simple Icons). Don't make logos 3D.
  - **The hero product can be a 3D render** that turns about 45°, with the next item taking over the turn. A
    rotationally symmetric object needs a printed stripe or mark so the turn is visible.
- **Where to get images:**
  - **Search:** web search scoped to unsplash.com to find photo pages, then read the `images.unsplash.com/photo-…`
    address from the page with the web-fetch agent and download it. Unsplash's own search and download endpoints
    refuse automated requests.
  - **Licence:** everything used must be free for commercial use (Unsplash License, Mixkit, Fontshare, brand logos for
    portfolio display).

## Carrier, camera and transitions
- **Carrier transitions everywhere** (TRANSITIONS.md), and the **travelling flat camera** (camMove) between places.
  Keep both: handovers with a fixed camera read as static.
- **The camera ride must keep moving:** with a time warp, the swarm and the sway run on real time, so the world never
  freezes during an inserted hold.

## Motion feel: subtle and intentional, never bouncy (user law, from the Resend study)
The user's words: quick bounces, "a sudden increase in scale and a tiny reduce in scale", make a film "look AI generated".
- **Slow, fast, slow.** Every move eases in, speeds through the middle and settles slowly. Moves last 0.5–1.2 s (Resend
  measured 0.5–1.6 s), not 0.1–0.3 s.
- **No pop-and-settle.** Springs are critically damped (c = 2·√k, zeta ≥ 1). Overshoot is at most about 3%, and none on
  type, images or cards. Never a scale that jumps past its size and snaps back.
- **Starting presets:** FAST {k 300, c 35}, MORPH {k 160, c 26}, POP {k 400, c 40}, WORD {k 300, c 35}. Before using a
  spring, check that c ≥ 2·√k.
- **Scale changes stay small.** An element arriving grows from about 0.9–0.96, not from 0.5 with a kick.
- **Nothing sudden (second user law).** "Smooth and buttery, smooth and calm." Nothing appears in a split second.
  - **Enters:** every text, image, card or chip arrives as a soft fade-up over 0.5–0.9 s, combining opacity, blur and a
    small 15–25 px drift. Nothing pops in at full opacity, and nothing grows from scale 0.
  - **Exits:** they fade and blur out over about 0.4 s and finish before the camera leaves.
  - **Swaps:** a swapped word, step, film or product crossfades. The old one leaves before the new one lands. A hard
    change of text or image is never allowed.
  - **No pulses:** no breathing or wobble on landed objects.
  - **Camera moves:** tau is at least 0.3 s, so no whips. Anything riding the camera (a carrier, a card) follows the
    camera's own progress so it never lags behind or jumps.
  - **Starting presets:** FAST {k 150, c 25}, MORPH {k 90, c 19}, POP {k 160, c 26}, WORD {k 110, c 21},
    SOFT {k 60, c 16}.
  - **Punch-zooms:** none, unless the user asks for one.
- **Punch-zooms are soft.** Each has a peak of about 2–5%, a rise of about 0.1 s and a decay of about 0.35 s. This
  replaces the 4-frame ±8–15% kick in TRANSITIONS.md.

## Close
- Portrait, name, a short line ("Work with me"), and a big solid CTA pill ("Book a call today"), with the voice saying
  the CTA.

## Process lessons
- **Load the skill files and write the storyboard before building.** Working from memory produced slow, fade-based,
  "basic, AI-looking" transitions.
- **Save rules to the skills only after the user approves them.** Unapproved rules get deleted (the 17 characters
  per second reading-speed rule was removed at the user's request).
- **Report honestly what can't be done.** Tell the user about copyright limits and blocked sources, and offer the legal
  alternative.
