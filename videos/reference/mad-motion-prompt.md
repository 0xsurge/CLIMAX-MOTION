# "Mad motion" prompt: the recipe behind the Nyangu film
There was no single prompt. The film came from your ask ("mad, fast, visible motion, the 12 principles, intentional morphs, transitions
from all my references"), the house rules in CLAUDE.md, and the decisions I made while building. This is that recipe written as one
prompt, so it can be reused for any brand. Replace the [BRACKETS]; the values in (parentheses) are what Nyangu used.

---

<inputs>
Brand: [name] (Nyangu)
URL: [site] (nyangu.com). Capture the real brand from it: logo mark and wordmark (pull the mark out of the logo file), colours from the
CSS variables, the font, full-size originals of the site photos, and the real UI as transparent images (cards, buttons, panels, pills).
Never redraw UI that exists. Copy comes from the site's own words.
Song: one Mixkit track, 120-130 BPM, with a clear bass entry or drop (Mixkit #218 "Africa", 124 BPM). Match the brand's world.
Sound effects: downloaded Mixkit SFX only (pops, whooshes, clicks, impacts, sweeps), never synthesized.
</inputs>

<direction>
Story in one line: [what the product does for people] (find a trusted home, in 6 steps, verified).
Energy: mad, fast, loud motion. Nothing is ever still and every move is big enough to notice. No slow pace.
Carrier: the brand's own mark is the one object that carries the whole film. It lands, opens into the hero photo, collapses back,
bursts into the product UI on the drop, floods the frame in the brand colour, and returns for the lockup.
Look: the brand's real palette (deep green #003E30, lime #DFE123 from the mark, off-white #F7F7F7), the brand font (Plus Jakarta Sans 800
for big type), real photos and real UI only.
Morphs: every transition is intentional, one object becoming the next with a reason, never a generic crossfade or wipe:
mark -> photo window -> card -> mark; counter -> sucked into the mark; mark -> colour flood + UI cards bursting out; focused card ->
the next stage; panel -> photo strips; pill -> photo window; everything -> the mark -> the lockup.
Grammar borrowed from the references (never their brands): one carrier object (Kinso), one continuous take (Pulse), element-to-element
morphs on the drop (Musixquare), lit lists and design-tool framing (ServiceUp), scattered type and objects (Reception), ring bursts and
a rolling counter (showreel energy).
Never: still photos, frozen holds, fades as enters or exits, glow on UI, spins, glitches, generic particle bursts, invented numbers.
Loop: no.
</direction>

<motion>
Apply all 12 principles, in code:
1. Squash and stretch: every flying object stretches along its velocity (scale 1+k by 1-0.55k, k from speed); objects squash when they land
   (a short damped spring).
2. Anticipation: a dip or pull-back 0.15-0.45 s before every big move; the carrier pulses and wobbles while it charges before the drop.
3. Staging: one focal action per beat; the focused card takes the centre and grows while the rest recede.
4. Straight ahead and pose to pose: letters are thrown one by one on their own arcs; cards and windows move between keyed poses.
5. Follow through and overlapping action: letters 0.012-0.035 s apart, cards 0.035 s, rows and strips half a beat; nothing lands at once.
6. Slow in and slow out: closed-form springs only (fast: k 900 c 48; whip: k 520 c 38; heavy for camera and logo).
7. Arcs: every flight is a bezier arc, never a straight line.
8. Secondary action: camera kicks and a short shake on hits, lime rings and pings, rolling counters, a giant outline number behind the
   focused card.
9. Timing: snaps of 4-8 frames, holds of 3-6 frames, a new idea every 1-2 beats.
10. Exaggeration: punch scales on hits (the drop, the most important card), a word that stretches its own letter spacing ("space").
11. Solid drawing: one light direction, consistent drop shadows.
12. Appeal: the real brand, clean shapes, readable type.
Camera: always moving. A push of about 1% zoom per second plus a 6-12 px/s drift whose direction changes every act, handed over with
a heavy spring; scale kicks on hits; photos always pan and push inside their windows.
</motion>

<structure>
Length: 64 beats (about 31 s at 124 BPM). Aspect: 16:9. Drop on beat 16.
1. Beats 0-6: the mark lands with a squash; "Find your / perfect space / in Lagos." is thrown out of it letter by letter.
2. Beats 6-10: anticipation, then the mark opens into the hero photo window (photo keeps panning); "Find trusted properties."
3. Beats 10-14: the window shrinks to a card; "Just 6 steps. But who's counting?"; a counter rolls 01 -> 06.
4. Beats 14-16: everything is sucked into the mark; the mark charges (pulse + wobble).
5. Beat 16, DROP: the mark floods the frame green and bursts into the six real step cards on arcs; camera kick and shake.
6. Beats 18-30: each card takes the stage on its beat (two beats each) with a giant rolling outline number behind; the most important
   card gets the biggest hit.
7. Beats 30-36: the last card blows up into a white stage; the real search panel lands; a cursor clicks "Apply Filters"; the panel splits
   into three photo strips panning at different speeds.
8. Beats 36-44: "Rent with Confidence." with the trust cards dealt in on arcs; whipped off; verified rows slam in with lime pings; the
   verified pill stamps.
9. Beats 46-54: the pill opens into the family photo window; "Built for a market that needs proof."
10. Beats 54-64: everything is pulled into the mark; it charges, lands in the lockup; wordmark wipes in; the real CTA button pops; URL.
</structure>

<sound>
Measure the song's grid (fit the onset strength to a tempo and a downbeat) and edit it so its bass entry lands on the drop.
One effect per meaningful action, placed by its measured peak: pops on letters and chips, whooshes on throws and camera moves, a click on
the cursor, an impact plus a riser into the drop, sweeps on the suctions, a bell on the lockup.
Read every cue time from the film's own timeline so picture and sound can never drift.
Mix: -14 LUFS integrated, true peak under -1 dBTP.
</sound>

<build>
window.seek(t) paints frame t, a pure function of time; 2D transforms only; one TIMELINE object in beats.
Render with Playwright and Chromium at 60 fps with 4 motion-blur subframes, in parallel chunks joined losslessly; H.264 yuv420p CRF 16.
</build>

<checks>
Run them, do not claim them:
- contact sheet, one frame per beat; fix the 3 worst problems; repeat until every score is 8+;
- pop scan: no isolated one-frame spikes (no one-frame flashes, no layer popping on or off);
- frozen scan: no stretch of 0.25 s or more without visible change;
- blank-frame scan: no empty frames, including frame 0;
- every chunk seam checked;
- loudness and true peak measured on the final file.
</checks>

<start>
Capture the brand first, then build. Show the film with an honest list of what is real, what was written, and what could not be verified.
</start>
