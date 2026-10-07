# Review log: Armab Agency launch film

Scores come from rendered frames, the contact/phone/strip sheets and numeric checks. One reviewer (the builder) looked at every sheet; no separate critic agent was used.

## Round 1 (first full pass, beat sheet + key frames)
| Criterion | Score | Evidence |
|---|---|---|
| Hook | 7 | Frame 0 reads (real wordmark + logo), but 1-4 s is static apart from one line of type |
| Readability at 360 px | 7 | Headlines read; proof-row copy and the CTA button/URL are small |
| Motion | 8 | Panels, rail and rows move on springs; nav underline stretches between sections |
| Variety | 7 | Hero and proof feel sparse |
| Brand accuracy | 9 | Real wordmark, nav pill, buttons, service rows, proof rows, logos, fonts and copy |
| Composition | 7 | Proof rows small and dim |
| Polish | 6 | "Our Work" label and "01 / 04" counter in the corners (banned), keyword text touching a service title |

3 worst: (1) corner labels, (2) static hero, (3) small/dim proof scene.
Fixes: corner labels removed; hero line becomes three beats of the site's own copy ("Roadblocks, removed." / "Strategic brands." / "Digital experiences."); proof rows enlarged and brightened; sublines, button and URL enlarged.

## Round 2 (draft with sound, strip around the 14 s push)
- Loop seam (first vs last frame): 0.1/255. Blank-frame scan: none. Loudness -14.1 LUFS, true peak -2.2 dBTP.
- Phone sheet at 360 px: every headline reads; service-row names and proof-row titles are legible; body copy inside the proof rows is not (it is the site's own small text).
- Strip: no pops; the underline stretches from SERVICES to WORK during the push.
- Defect found in the strip: the keyword "SCALABILITY" touched the "Web Design & Development" title. Moved the keywords outward.

## Round 3 (final render, 60 fps, 8 subframes, four parallel chunks joined losslessly)
- Output: 1800 frames, 30.000 s, H.264 yuv420p, -14.1 LUFS, true peak -2.2 dBTP, no blank frames, first-vs-last frame difference 0.2/255.
- Chunk joins (frames 450, 900, 1350): frame-to-frame change across each join 0.06, 0.11 and 2.79 (out of 255) against neighbours of 0.00, 0.00 and 2.79: no visible seam.
- Strip around the 14 s push: continuous motion blur, no pops; the nav underline stretches from SERVICES to WORK.
- Final scores (builder's judgement from the sheets): hook 8, readability at 360 px 8 (headlines and row titles; the proof rows' body copy stays small), motion 8, variety 8, brand accuracy 9, composition 8, polish 8. Sound sync not scored: cues are placed from measured spring timings and were not measured against the finished audio.

## Not done / limits
- 16:9 only.
- Services rows, proof rows, nav pill and buttons are real crops of the live site; the hero wordmark and the headlines are typeset in the site's own fonts (PP Neue Montreal, Aileron) because they are plain type. Project images are the site's own images; Kitty and Opus use the site's cover photograph, because the cards on the live site are driven by a video that headless Chromium cannot decode, and the video itself is client footage (Brikken+Co) that was not used.
- The proof rows' body copy is small at phone size. Sound sync is placed from measured spring timings, not measured against the finished audio.
- PP Neue Montreal is a commercial typeface; its files are used for this render only and are not committed to the repo.
- Testimonial notes were not used (the site animates them in a moving marquee).
