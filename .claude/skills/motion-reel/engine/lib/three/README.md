# three.js 0.187.0 (vendored)
From the `three` npm package (github.com/mrdoob/three.js, MIT licence, see LICENSE), files copied unchanged: build/three.module.js,
build/three.core.js, and three add-ons: geometries/RoundedBoxGeometry.js, environments/RoomEnvironment.js, loaders/HDRLoader.js.
three.js ships only as ES modules now (no UMD build), so a film that uses it needs:
- an import map: `{ "imports": { "three": "<path>/lib/three/three.module.js", "three/addons/": "<path>/lib/three/addons/" } }`
- `<script type="module">` for the scene code (classic scripts such as motion.js load first and stay global: `Motion`)
- render.mjs launches Chromium with --allow-file-access-from-files, which lets a file:// page import those modules.

## Render contract
- `createStage()` from ../three-stage.js: WebGL renderer with preserveDrawingBuffer, ACES tone mapping, soft shadows, and image-based
  light (three's built-in studio room, or a real HDR such as a Poly Haven studio saved in the film's assets: `createStage({ hdr })`).
- No animation loop, no THREE.Clock, no mixers stepped by delta time. In window.seek(t), set every transform from springs of t, then call
  `st.render()` once. window.seek returns nothing.
- DOM layers over the canvas (type, pills, UI) need a z-index above it.
- Checked: frames rendered out of order are pixel-identical (max difference 0). About 2 s per 1080p frame on 4 CPU cores (SwiftShader).
A working example is ../../templates/three-example/index.html.
