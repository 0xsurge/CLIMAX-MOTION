# Reference film → structured brief (revest, "One sale. A complete ripple.")

Source: user upload, 71.27 s, 1276x720 (16:9), 29.97 fps, H.264 + AAC stereo. Measured: -14.1 LUFS integrated.
Method: contact sheet at 1 frame / 2 s, scene-change detection (ffmpeg scene > 0.3), librosa tempo + RMS per 4 s.
Confidence: timings and format are measured. Look, fonts, effect names and motion type are read by eye from sampled frames (medium confidence).
This is a reference for structure and craft. Do not copy the brand's logo, UI or footage into another client's film.

<inputs>
- Brand: name, logo (vector), one accent colour (reference uses a single electric blue on cool white-blue).
- Real product UI captures: catalogue/POS, product page, sales dashboard, loyalty, reconciliation, stock chart, order flow, payment-complete card.
- Footage / photography: electronics store interior (staff at counter), store entrance (customer walking in), warehouse with racking, desert road + city skyline at golden hour, phone-in-hand on a POS counter.
- Partner/integration logos (about 15) for the ecosystem beat.
- 3D or illustrated assets: a floating glowing store on a grid, glass-style blue triangles, a glass cube collage.
- Song: about 76 or 152 BPM (librosa says 152; confirm half-time). Any track works if it has a steady pulse and a calm tail.
- Copy: short labels only ("Online stock 7x refrigerators left", "Stockout Risk", "Restock Order", "Payment completed", "One store", "Scales with you.", "Unified Retail Platform").
</inputs>

<direction>
- Story: one sale triggers everything. One order ripples through stock, POS, loyalty, sales reports, reconciliation, restock and payment, all inside one system. The film closes on "One store → Scales with you" and the integrations ring.
- Look: cool white-to-blue gradient world, glass-style UI cards with soft shadows, floating 3D blue triangles as the recurring brand shape, real product UI shown tilted in perspective, photographic inserts for realism.
- Type: one geometric sans for headline words and UI labels; large display words ("Sales", "Scale", "One") sit over the imagery and are partially cropped or masked by the scene.
- Motion language: continuous, not cut-based. Only 19 hard cuts in 71 s; most beats morph into the next (card → dashboard → tilted plane, triangles sweep through as wipes, UI cards fly across scenes).
- Camera: slow push-ins and tilts on UI planes, 3D fly-over for the store/skyline scenes.
- Sound: roughly -14 LUFS, steady bed at -15 to -19 dB RMS, builds in the first 8 s, long calm tail (-26 dB from 64 s, silent after 68 s).
</direction>

<structure>
Measured hard cuts (s): 2.5, 3.6, 4.9, 6.9, 8.0, 10.0, 11.9, 13.1, 15.2, 25.0, 27.8, 30.1, 33.8, 35.6, 44.5, 49.2, 56.0, 58.4, 62.5.
Beats (read from the 2 s sheet; times approximate):
1. 0-2   Cold open: "One … Sale" with a small gavel-like object on light grey.
2. 2-6   The shop floor (staff at counter), catalogue/POS UI tilted in, then the desert road and delivery van with a blue map pin.
3. 6-14  Warehouse and fridge with a glass "Remaining stock" chip; product page; "Online stock 7x refrigerators left" card; POS terminal with floating stat cards.
4. 14-24 Triangle-wipe world: Loyalty points, Sales dashboard in 3D, "Sales reports reached", "Financial reconciliation" (bank + terminal).
5. 24-30 Stock decline chart, "Stockout Risk" with fridge, "Restock Order" on a warehouse pallet, "Payment completed" card.
6. 30-36 Glass collage of the pieces, then "in one second" over a multi-panel board; revest logo lands on the gradient.
7. 36-48 Order UI, then a stylised skyline, "One store" on a glowing 3D store, "Scale with" → "Scales with you." over a grid of stores.
8. 48-56 Integrations: Microsoft Dynamics 365, odoo, SAP, many partner logos orbiting the revest hub.
9. 56-62 Human close: phone notification on a POS counter, customer walking into the store, "one second" over the entrance.
10. 62-71 Triangles resolve into the logo, end card "Unified Retail Platform", calm tail.
Pacing: something new roughly every 2-4 s, with a 10 s quieter run (15-25 s) built on one continuous UI morph.
</structure>

<build>
- Format: 16:9, 1276x720 source; a rebuild should render 1920x1080 or 2560x1440 and also deliver 1:1 and 9:16.
- Rate: 30 fps source; render 60 fps with subframe motion blur and downconvert if matching.
- Engine: window.seek(t) pure function of time, closed-form springs, one continuous camera, glass cards by displacement/backdrop approximation, 3D triangles as CSS 3D or canvas with seeded noise.
- Audio: place hits on a measured grid from the chosen song; downloaded SFX only if the brief says so; loudnorm -14 LUFS, true peak under -1 dBTP (same chain as videos/keynote).
- Checks: contact sheet per beat, pop scan, loop/seam check if it loops, frame-level review before the full render.
</build>

<gotchas>
- The 3D store, skyline and glass cube are rendered 3D/illustration; they need supplied assets or a simplified code-built substitute.
- Real UI must come from captures of the real product, not a redraw.
- Fonts and the exact UI typeface were not identified; ask the client or pick one display and one UI face.
- Many transitions are morphs, so a slideshow-style rebuild would miss the point; design each beat's exit as the next beat's entrance.
- Tempo could be read as 76 or 152 BPM; check against the cut times (cuts cluster at roughly 1.0-1.5 s early on) before building the grid.
- Photographic and partner-logo material carries licensing; get permission before reuse.
</gotchas>

<start>
Ask for the inputs above, then show the beat map and 4 stills for approval before writing the full film.
</start>
