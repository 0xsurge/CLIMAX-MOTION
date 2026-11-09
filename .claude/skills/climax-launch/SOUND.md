# Sound design (part of /climax-launch)

These rules were approved on the Obi Igwe reel, and they come from the Notion concept-ad study
(`videos/reference/sfx-study/STUDY.md`). The build is `videos/obi-reel/sound/make_audio.py`.

## Layers, from the bottom up
1. **Music.** It is always a licensed or royalty-free track. The user picks it by ear, and often supplies their own.
   - **Never** a copyrighted commercial song (a label artist such as Rihanna), and never music lifted from someone
     else's video, even with the beat removed. Explain why (platform muting, copyright claims) and offer royalty-free
     tracks in the same style instead.
   - **Choose it by the user's taste, not by measurement alone.** A Mixkit piano that matched a reference on tempo and
     brightness was still rejected ("I hate the song"). Offer options with previews, or wait for the user's track.
   - Cut it so its lift lands on the hero moment (in the Obi reel, the name), with a 1.6–1.8 s fade-out.
2. **Drone bed.** A low, sustained drone under the whole film, from the SFX pack. Fade it in over 2.5 s and out over
   2 s, at a low gain (about 0.22 in make_audio), so it is felt, not heard.
3. **The motion layer, the SaaS sound.** "Most of the movements should have sound", softly:
   - **A soft pop on every word that lands:** a short sine drop from about 850 Hz in 50 ms, plus a tiny noise tick, at
     about 0.07 gain. Pan it slightly per word.
   - **A soft air pass on every carrier transition:** a short sweep, low-passed at about 5.2 kHz and high-passed at
     about 180 Hz, with its peak placed on the transition frame, at about 0.09–0.11 gain. Use a lighter one (about 0.06)
     for each whip inside a frame.
   - **A subtle whoosh on every camera whip:** the same air pass at about 0.16 gain, panned with the direction.
     Whooshes are welcome only in this soft, low-passed form, on real whips and transitions. A loud "shh" swish on
     every movement is still banned.
   - **A quiet sub-thump on each landing:** a pitch drop from 95 Hz to 55 Hz over about 0.35 s, at about 0.1 gain.
     Use it on steps, cards and key moments.
   - **Leave some small moves silent** so it never feels like a sound on every frame (the Notion ad does this too).
4. **Hits.**
   - A soft impact on the big landings: the name, the screen opening, the ring bursting, the closing name.
   - A riser into the hero moment and into the close, with the riser's peak aligned to the moment.
   - Clicks on the product swap.
   - Taps while text is typed.
5. **Voiceover**, on top, with the music ducked under it (`mix.py --vo`).

**Never:** tonal, chime or melodic notes that follow motion or light.

**Loudness:** `mix.py` normalises the mix to −14 LUFS. The motion layer must stay under the music and the voice.

## Voiceover rules (approved)
- **Voice:** a warm female voice by default. Use Kokoro (Apache 2.0) with `af_heart`; the alternatives are `af_bella`
  (smooth) and `af_nicole` (soft, breathy). Chatterbox's default voice reads as male to the user, so don't use it for
  female narration. Install with `.claude/skills/motion-reel/scripts/install_kokoro.sh`, generate with
  `tts_kokoro.py`, and use speed 0.94–1.0.
- **Who she talks to:** the narrator speaks **to the viewer**, never about the client.
  - No "Meet [name]", no "He turns…", and no reading out the client's name or "open to work" lines.
  - The name lives on screen only.
- **Sentences:** short, and placed at their scenes. Lay them out with `build_vo.py` (a line starts at its scene and
  never overlaps the previous one).
- **The close:** end on the call to action in the voice too ("Book a call today.").
- **Names:** respell them phonetically so the voice says them right. Check with the phonemizer, e.g. "Obi Igwe" →
  "Obee Eegway".

## The SFX pack
- **Contents:** `videos/obi-reel/sound/sfxpack/`. It holds 152 Mixkit sounds (free for commercial use, no
  attribution), sorted by measurement into drone, impact, riser, sweep and ui, and loudness-matched.
  - The pack's `PACK.json` lists every file's source.
  - The sound files are git-ignored: refetch them from the Mixkit sound-effect tag pages.
- **Other sources:**
  - **Freesound:** needs an API key, and only its CC0 sounds are safe.
  - **Pixabay:** blocks automated downloads.
