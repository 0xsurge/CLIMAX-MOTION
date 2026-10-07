---
name: motion-reel
description: Make a beat-synced motion graphics film in code (launch reel, product film, teaser) from a product URL or brief. Captures the real brand, writes a style guide and shotlist, waits for OK, builds a window.seek(t) film with closed-form springs, synthesizes music and UI sounds on a measured beat grid, critiques its own render until every score is 8+, then exports H.264 in 16:9, 1:1, 4:5 and 9:16. Use for "/motion-reel", "make a launch video", "motion reel", "product film".
---

# /motion-reel

Everything lives next to this file. `S` = `.claude/skills/motion-reel`. Follow `CLAUDE.md` (the house rules); `reference/RULES.md` is the detailed version.

## 0. Intake (one round of questions, only what's missing)
Product + URL, duration, formats, brand colors + fonts (or measure them), reference film (optional), music (file or synthesize), voiceover (Fish Audio MCP or none). If the user names a preset, read `presets/<name>/preset.jsonc` (project `presets/` first, then `S/presets/`) and ask only what it doesn't answer. Start from `presets/blank` otherwise.

## 1. Scaffold the film
`node S/scripts/scaffold.mjs videos/<name> --preset presets/<brand>` creates `index.html`, `film.js`, `tokens.js`, `engine/lib/motion.js` and `assets/ audio/ renders/ docs/ review/`. Edit `film.js`; never edit the engine copy.

## 2. Assets (the real brand)
Visit the URL with Playwright. Save real screenshots, logo, favicon and the computed fonts/colors to `assets/`. List what you found before animating. Measure the accent from the logo. **Never redraw UI that exists; crop and animate the real thing.** If the site can't be reached, say so and ask for screenshots instead of inventing UI.

## 3. Style guide, beat grid, shotlist
- `docs/style_guide.md`: palette (hex), type (family, weight, tracking), shot lengths, transitions, camera, how text enters and exits. From a reference film take its grammar (rhythm, transitions, camera, type), never its content, logos or characters. Download with yt-dlp, extract a frame every 0.5 s with ffmpeg, study them.
- Beat grid: `python3 S/scripts/music.py --bpm 120 --dur <s> --out audio/music.wav` (or the user's track), then `python3 S/scripts/beats.py audio/music.wav --out beats.json`. State changes land on beats, big moments (logo, CTA) on downbeats, SFX on hits. Start on a downbeat.
- `docs/shotlist.md`: every shot with beat, frames, camera, text, SFX cue. **Show it and STOP for the user's OK** before building.

## 4. Build
In `film.js`: one container, `window.seek(t)`, springs from `Motion` (`track`, `indicator`, `swapAlpha`, `loopT`, `mulberry32`). Presets: snappy (UI, leading edges), default (cards, camera), heavy (type, logos), playful (mascots only). Respect the banned list. Last frame equals first when the film loops. Check `Motion` with `node S/engine/lib/motion.test.mjs`.

## 5. Critique loop (at least 3 rounds, until every score is 8+)
1. `node S/scripts/render.mjs <film> --fmt=16x9 --fps=30 --dur=<s> --out=renders/draft.mp4` (draft), or `--sheet=<one time per beat>` for a quick look.
2. `python3 S/scripts/review.py renders/draft.mp4 --round N --strip-at <fastest action>`; LOOK at `contact.png`, `strip.png`, `phone.png`, `loop.mp4`, `blank_frames.txt`.
3. Spawn a fresh critic subagent with `reference/CRITIQUE.md` and those files. It scores from the pictures, not the code.
4. Log scores and the 3 worst problems in `docs/review_log.md`, fix those 3, repeat. Show the log after each round.

## 6. Finals
- Video: `node S/scripts/render.mjs <film> --fmt=16x9 --fps=60 --sub=4 --dur=<s> --out=renders/16x9.mp4` for each format (`16x9 1x1 4x5 9x16`). Re-block per format in `film.js` (it reads `FORMAT.w/h`); never just crop.
- Sound: write `cues.json` from the shotlist (`click pop thump whoosh`, on measured hits, about 30-45 ms before the visual lands), `node S/scripts/sfx.mjs cues.json --dur <s>`.
- Mix: `python3 S/scripts/mix.py --video renders/16x9.mp4 --music audio/music.wav --sfx audio/sfx.wav [--vo audio/vo.wav] --out out/final_16x9.mp4` (-14 LUFS, true peak <= -1 dBTP; music ducks under a voice).
- Deliver `out/final_*.mp4`, `out/loop_check.mp4`, `out/poster.png`, `out/contact.png`, and say what you could not verify.

## Voiceover
Fish Audio MCP, the user's own cloned voice if they have one. Natural spoken sentences; never read the on-screen gag words or captions aloud. Time each line to the cut it belongs to.

## Smoke test
`sh S/scripts/test-render.sh [seconds]` scaffolds a film in a temp folder and renders a 5 s test with sound.
