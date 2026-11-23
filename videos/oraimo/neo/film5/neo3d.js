// Storyboard B 3D layer: the SpaceBuds Neo+ case and buds (../three/neo-model.js) and the lime glass drops (the film's
// recurring motif, our version of the reference's glass shards), on a transparent canvas over the travelling world.
// Each object belongs to a place (pl) and is drawn through the camera (window.NEO.w2s), so it arrives and leaves with the
// world. Every value is a spring of t (K, S from the page). One render per seek.
import * as THREE from 'three';
import { buildNeo } from '../three/neo-model.js';

const host = document.getElementById('gl3');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(1920, 1080, false); renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
Object.assign(renderer.domElement.style, { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px' });
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(24, 1920 / 1080, 0.1, 100); camera.position.set(0, 0, 6); camera.lookAt(0, 0, 0);
const PXU = 1080 / (2 * 6 * Math.tan(THREE.MathUtils.degToRad(12)));
const at = (px, py, z = 0) => new THREE.Vector3((px - 960) / PXU, (540 - py) / PXU, z);
scene.add(new THREE.HemisphereLight(0xffffff, 0x101010, 0.35));
const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(-2, 4, 5); scene.add(key);
const rim = new THREE.PointLight(0x9CFF2E, 0, 9, 1.4); rim.position.set(-2.2, 1.6, -2.0); scene.add(rim);
const neo = await buildNeo(THREE, renderer, scene, '../../assets/neo/');
[neo.budL, neo.budR].forEach(b => scene.attach(b));
// the motif: glossy lime glass drops drifting in depth
const dropMat = new THREE.MeshPhysicalMaterial({ color: 0xF2FFE0, transmission: 1, thickness: .35, roughness: .02, ior: 1.33, clearcoat: 1, attenuationColor: new THREE.Color(0xB6FF4D), attenuationDistance: 2.2, envMapIntensity: 1.6, transparent: true, opacity: .9 });
const rnd = (() => { let a = 11; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
const DROPS = Array.from({ length: 6 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), dropMat); m.scale.set(1, 1.18, 1); scene.add(m);
  return { m, x: [140, 1780][Math.floor(rnd() * 2)] + (rnd() - .5) * 360, y: 140 + rnd() * 800, z: -1.5 + rnd() * 2.0, r: .045 + rnd() * .07, ph: rnd() * 6.28, sp: .2 + rnd() * .3 }; });
const DROP_ON = [[6.0, 12.1], [32.0, 36.1], [40.2, 41.25]];
// ---- tracks: x, y are place-local px; pl is the place; s in case widths ----
const CASE = K([[0, { pl: 0, x: 1460, y: 560, s: 0, rx: .2, ry: -2.6, rz: .1, lid: 0 }],
  [.2, { s: 1.05, ry: -.5, rx: .22, rz: .06 }, { k: 32, c: 9.6 }], [1.4, { ry: -.3 }, GLIDE],
  [15.9, { pl: 4, x: 960, y: 560, s: .2, ry: -.45, rx: .3, lid: 1.9 }, 'cut'], [16.2, { s: .78 }, SOFT],
  [31.9, { pl: 9, x: 960, y: 640, s: .001, ry: -.3, rx: .32, lid: 1.9 }, 'cut'], [33.3, { s: 1.15 }, SOFT], [34.75, { lid: 0, rx: .16 }, { k: 90, c: 14 }],
  [35.9, { pl: 10, x: 760, y: 1500, s: .8, ry: .35, rx: .2, lid: 0 }, 'cut'], [36.2, { y: 800 }, { k: 70, c: 15 }], [37.2, { lid: 1.7 }, { k: 60, c: 11.5 }]]);
const CASE_ON = [[0, 2.6], [15.9, 20.2], [31.9, 40.8]];
const PAIR = K([[0, { pl: 2, x: 1380, y: 470, s: 1.7, d: 360, rx: .1, ry: 0, rz: 0, w: 0 }],
  [6.05, { s: 1.7 }, 'cut'], [9.65, { ry: .5 }, { k: 40, c: 11 }],
  [15.9, { w: 1 }, 'cut'],
  [27.9, { pl: 8, x: 1380, y: 520, s: 2.5, d: 560, rx: .15, ry: 0, w: 0 }, 'cut'], [29.5, { ry: .4 }, GLIDE]]);
const BUDS_ON = [[6.0, 12.1], [15.9, 20.2], [27.9, 32.1], [31.9, 36.0]];
const RIM = [[0, .6], [6.0, .6], [15.9, .6], [26.0, 3.2], [27.9, 3.6], [31.9, .6], [36.0, 1.6], [40.6, 3.4]];
const inAny = (t, L) => L.some(([a, b]) => t >= a && t < b);
const wpos = (pl, x, y) => { const [wx, wy] = window.NEO.W(Math.round(pl), x, y); return window.NEO.w2s(wx, wy); };
const mB = new THREE.Matrix4(), pS = new THREE.Vector3(), qS = new THREE.Quaternion(), sS = new THREE.Vector3(), pF = new THREE.Vector3(), qF = new THREE.Quaternion(), sF = new THREE.Vector3();
function pose(t) {
  const z = window.NEO.cam()[2], c = CASE(t), p = PAIR(t);
  { const [sx, sy] = wpos(c.pl, c.x, c.y); neo.case.visible = inAny(t, CASE_ON) && c.s > .003; neo.case.position.copy(at(sx, sy)); neo.case.position.y += .025 * Math.sin(t * 1.3);
    neo.case.rotation.set(c.rx + .03 * Math.sin(t * .7), c.ry + .05 * Math.sin(t * .45), c.rz); neo.case.scale.setScalar(Math.max(c.s, 1e-4) * z); neo.setLid(c.lid); neo.case.updateMatrixWorld(true); }
  { const [sx, sy] = wpos(p.pl, p.x, p.y);
    [neo.budL, neo.budR].forEach((b, i) => { const side = i ? 1 : -1; b.visible = inAny(t, BUDS_ON);
      pF.copy(at(sx + side * p.d / 2 * z, sy + 12 * Math.sin(t * 1.5 + i)));
      qF.setFromEuler(new THREE.Euler(p.rx + .08 * Math.sin(t * .9 + i), -side * .6 + side * p.ry, -side * .25 + .05 * Math.sin(t * .8 + i * 2))); sF.setScalar(p.s * 1.12 * z);
      mB.multiplyMatrices(neo.case.matrixWorld, neo.seatLocal(side)); mB.decompose(pS, qS, sS); const w = clamp(p.w);
      b.position.lerpVectors(pF, pS, w); b.quaternion.slerpQuaternions(qF, qS, w); b.scale.lerpVectors(sF, sS, w); }); }
  const dOn = inAny(t, DROP_ON);
  DROPS.forEach((d, i) => { d.m.visible = dOn; if (!dOn) return; const g = S(t - DROP_ON.find(([a, b]) => t >= a && t < b)[0] - .2 - i * .06, SOFT);
    const gx = t > 40.2 ? sm((t - 40.4) / .8) : 0, [lx, ly] = window.NEO.w2s(...window.NEO.W(11, 960, 440)); d.m.position.copy(at(lerp(d.x + 40 * Math.sin(t * d.sp + d.ph), lx, gx), lerp(d.y + 30 * Math.cos(t * d.sp * .8 + d.ph), ly, gx), d.z * (1 - gx))); d.m.scale.set(d.r * g, d.r * 1.18 * g, d.r * g); if (gx > 0) d.m.scale.multiplyScalar(1 - .7 * gx); d.m.rotation.z = Math.sin(t * .3 + d.ph) * .3; });
  let r = 0; for (const [ti, v] of RIM) if (t >= ti) r = v; rim.intensity = r;
  neo.update(); renderer.render(scene, camera);
}
const domSeek = window.seek;
window.seek = t => { domSeek(t); pose(t); };
const wait = () => new Promise(res => { const k = () => window.__domOK ? res() : setTimeout(k, 20); k(); });
await wait(); window.seek(0); window.__ready = true;
