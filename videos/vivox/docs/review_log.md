# Vivox "Carrier" film: review log
Final: 1930 frames, 32.17 s (60 beats at 112.01 BPM + a short hold), 1920x1080 @60 fps, H.264 yuv420p CRF 16, 4-subframe motion blur,
8 chunks joined losslessly (seams checked). Pop scan: 0 isolated spikes. Near-blank frames: only 0-0.3 s (the orb alone before "Every" rises).
Audio: Mixkit #440 "Infinity", edited so its first low hit lands on beat 15 ("Meet Rachel", 8.03 s); 51 downloaded Mixkit effects whose times
are read from the film's TIMELINE (const B in film.js). -14.4 LUFS integrated, -2.5 dBTP.

## Round 1 problems found and fixed
1. The big orb's glow drew a square haze: glow size capped.
2. The orb sat on Rachel's face in the "Superpower" scene: moved beside the word.
3. A 1.5 s near-empty gap before the logo formed: split, logo and CTA pulled earlier.
4. The ring grazed "Explainable.": ring and orb moved right.
## Round 2
1. The first half second was pure white (orb started above the frame): the orb is in frame from frame 0, first word at beat 0.5.
2. Camera moves passed through empty space and the move into "Superpower" was abrupt: all camera moves on the heavy spring, the move into "Meet Rachel" starts later, the ring appears half a beat earlier.

## Scores (self-review from contact sheets, not by listening)
hook 8 | readability 8 (dashboard detail is small by nature) | motion quality 8 | variety 8 | brand accuracy 9 (real logo, colours, font, Rachel and dashboard from vivox.ai) | sound sync 8 (by measurement)

## Content notes
- Copy: "Meet Rachel*", "Your AI compliance analyst", the skill names, "Superpower for compliance teams" and "Book a Demo" are the site's own words.
  "Every alert. Every entity. Every check.", "Explainable. Audited." and "Every decision, explained." are my lines built from the site's terms
  (explainable AI, audit trails, alerts, entities); check them before publishing.
- Left out on purpose: the site's statistics, customer and regulator logos, customer photos.
- The song and effects are not committed (licence); ids in ../dripverse/audio/sfx_manifest.json and audio/song_grid.json.

## Round 3: constant motion (user feedback: "it just feels still")
Measured with a frame-difference pass (frames whose mean change is under 0.05/255 count as frozen):
- Before: 46.5% of frames frozen, 16 frozen stretches of 0.25 s or more, the longest 1.62 s.
- After: 2.5% near-still frames (isolated), 0 frozen stretches.
What changed: the canvas sits inside an always-moving camera (slow push about 0.4-0.75% zoom per second plus a 3.5-7 px/s drift,
direction alternating scene to scene, each scene's motion handed to the next through a heavy spring); the orb, cursor and click ring
go through the same camera transform; landed cards and portraits keep a small float; the orb moves from frame 0.
The rule is now in CLAUDE.md and reference/RULES.md for every future film.
