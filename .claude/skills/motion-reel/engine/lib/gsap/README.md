# GSAP 3.15.1 (vendored)
From the `gsap` npm package (github.com/greensock/GSAP), files copied unchanged: gsap, SplitText, MorphSVGPlugin, DrawSVGPlugin,
MotionPathPlugin, CustomEase, Flip (`.min.js`). Licence: GSAP Standard "no charge" license (https://gsap.com/standard-license):
free, including commercial work; it may not be used in a tool that competes with Webflow (a visual, no-code animation builder).

## Using it in a window.seek(t) film
- Build ONE master timeline, paused: `const tl = gsap.timeline({ paused: true });` and add every tween to it at an absolute time.
- After building it, call `primeTimeline(tl)` once (gsap-spring.js). GSAP records some start values (DrawSVG lengths, from() values) on
  a tween's first render; priming runs the timeline to the end and back so every frame paints the same whatever order frames are visited in.
  Checked: frames rendered out of order are pixel-identical (max difference 0) with priming, and differ without it.
- `window.seek = t => { tl.seek(t, false); };` (false: callbacks don't fire). The braces matter: seek must return nothing. `tl.seek()`
  returns the timeline, and the renderer would try to serialise GSAP's whole object graph every frame and hang.
  Never let GSAP's ticker play anything; nothing runs on its own.
- Eases: house rules are springs only. Use `springEase('snappy' | 'default' | 'heavy' | 'playful')` from gsap-spring.js; it returns
  the closed-form spring from motion.js and the duration over which it settles: `tl.to(el, { x: 300, ...springEase('default') }, 1.2)`.
- Good fits: MorphSVGPlugin (intentional shape-to-shape morphs), DrawSVGPlugin (lines that draw), MotionPathPlugin (flights on arcs),
  SplitText (per-letter and per-word type animation), Flip (layout morphs).

A working example (MorphSVG drop to circle, DrawSVG line, MotionPath arc, SplitText letters, all on house springs) is in
../../../templates/gsap-example/index.html.
