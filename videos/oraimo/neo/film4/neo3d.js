// The 3D product layer of the v3 film: the SpaceBuds Neo+ case and buds as real 3D objects (../three/neo-model.js) on a
// transparent WebGL canvas inside the world layer, so the flat 2D camera of the film moves it with everything else.
// Every value is a spring of t (K, S from the page's classic script). One render per seek, nothing runs on its own.
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
const PXU = 1080 / (2 * 6 * Math.tan(THREE.MathUtils.degToRad(12)));        // screen px per world unit at z = 0
const at = (px, py, z = 0) => new THREE.Vector3((px - 960) / PXU, (540 - py) / PXU, z);

scene.add(new THREE.HemisphereLight(0xffffff, 0x101010, 0.35));
const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(-2, 4, 5); scene.add(key);
const rim = new THREE.PointLight(0x9CFF2E, 0, 9, 1.4); rim.position.set(-2.2, 1.6, -2.0); scene.add(rim);
const rim2 = new THREE.PointLight(0xB8FF6A, 0, 9, 1.4); rim2.position.set(2.4, -1.2, -1.6); scene.add(rim2);

const neo = await buildNeo(THREE, renderer, scene, '../../assets/neo/');
[neo.budL, neo.budR].forEach(b => scene.attach(b));

// water drops for IPX4: small clear spheres that cling to the buds and slide a little
const dropMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: .04, roughness: 0, ior: 1.33, clearcoat: 1, envMapIntensity: 1.6 });
const rnd = (() => { let a = 7; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
const drops = [];
[neo.budL, neo.budR].forEach((b, bi) => { for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(.012 + .014 * rnd(), 20, 14), dropMat);
  const y = -.3 + .38 * rnd(), side = bi ? 1 : -1; d.userData = { y, x: (rnd() - .5) * .06, z: .055 + (y > 0 ? .05 : 0), sp: .02 + .05 * rnd() }; d.scale.set(1, 1.15, .6); b.add(d); drops.push(d); } });

// ---- tracks (screen px, scale in case widths, rotations in radians) ----
// ww = 1: the key's x, y are place-local and the object belongs to that place (it arrives and leaves with the camera)
const CASE = K([[0, { x: 960, y: 540, s: 0, rx: .3, ry: -4.2, rz: .35, lid: 0, ww: 0, pl: 0 }],
  [4.32, { s: 1.0, ry: -.55, rx: .25, rz: .16 }, { k: 30, c: 9.5 }],
  [5.85, { y: 470, s: 1.25, rx: .1, ry: -.26, rz: 0 }, { k: 55, c: 12.5 }],
  [8.15, { rx: .42, ry: -.12, lid: 1.95 }, { k: 60, c: 11.5 }],
  [9.9, { y: 1650, rz: .55, rx: .9 }, { k: 55, c: 10.5 }],
  [21.6, { x: 1260, y: 610, s: 1.05, rx: .38, ry: -.32, rz: 0, lid: 1.95, ww: 1, pl: 5 }, 'cut'],
  [27.0, { y: 1600, rz: -.4 }, { k: 60, c: 13 }],
  [36.1, { x: 860, y: 1500, s: .8, rx: .22, ry: .38, rz: 0, lid: 0, pl: 8 }, 'cut'], [36.2, { y: 800 }, { k: 70, c: 15 }],
  [36.9, { lid: 1.75 }, { k: 60, c: 11.5 }]]);
const CASE_ON = [[4.32, 11.3], [21.6, 28.4], [36.1, 40.0]];
const PAIR = K([[0, { x: 960, y: 400, s: 1.3, d: 260, rx: 0, ry: 0, rz: 0, w: 1 }],
  [8.85, { w: 0, y: 250, d: 520, s: 1.35 }, { k: 70, c: 14.5 }],
  [9.95, { y: 450, d: 330, s: 1.6 }, FLY], [12.3, { ry: .45 }, { k: 40, c: 11 }], [14.6, { ry: .2, s: 1.7 }, GLIDE],
  [15.5, { x: 960, y: 520, s: .3, d: 160, ry: 0 }, 'cut'], [15.6, { s: 1.5, d: 330 }, SOFT],
  [21.8, { x: 1260, y: 610, s: 1.0, d: 200 }, FLY], [21.98, { w: 1 }, { k: 90, c: 19 }],
  [27.0, { w: 0, x: 960, y: 520, s: 2.0, d: 540, rx: .1 }, { k: 80, c: 16 }], [29.4, { ry: .35 }, GLIDE],
  [31.75, { x: 1640, y: 900, s: .5, d: 120, rz: .4 }, FLY],
  [36.1, { w: 1, ry: 0, rz: 0, rx: 0 }, 'cut'],
  [40.0, { w: 0, x: 960, y: 1350, s: 2.35, d: 600, rx: .15 }, 'cut'], [40.05, { y: 615 }, { k: 55, c: 12.5 }], [42.55, { s: 0, y: 560, d: 0 }, { k: 200, c: 28.3 }]]);
const BUDS_ON = [[4.32, 34.6], [36.1, 43.2]];
const SWEEPS = [[4.6, 1.3], [6.0, 1.0], [8.4, 1.1], [17.2, 1.5], [22.1, 1.1], [27.3, 1.1], [37.1, 1.1], [40.6, 1.3]];
// lime rim on the dark scenes, softer on paper
const RIM = [[0, 0], [4.32, 3.2], [6.05, .5], [15.5, 3.6], [21.8, .5], [31.85, 3], [35.45, .5], [40.0, 3.6]];

const inAny = (t, L) => L.some(([a, b]) => t >= a && t < b);
const mCase = new THREE.Matrix4(), mBud = new THREE.Matrix4(), pS = new THREE.Vector3(), qS = new THREE.Quaternion(), sS = new THREE.Vector3(), pF = new THREE.Vector3(), qF = new THREE.Quaternion(), sF = new THREE.Vector3();
let lastSweep = null;
function pose3d(t) {
  const c = CASE(t), p = PAIR(t), caseOn = inAny(t, CASE_ON), budsOn = inAny(t, BUDS_ON);
  // the case: screen position and scale, its own turn, a float that never stops
  neo.case.visible = caseOn && c.s > .002;
  let sx = c.x, sy = c.y, zf = 1; if (c.ww > .5) { const [wx, wy] = window.NEO.W(Math.round(c.pl), c.x, c.y); [sx, sy] = window.NEO.w2s(wx, wy); zf = window.NEO.cam()[2]; }
  neo.case.position.copy(at(sx, sy)); neo.case.position.y += .025 * Math.sin(t * 1.3);
  neo.case.rotation.set(c.rx + .03 * Math.sin(t * .7), c.ry + .05 * Math.sin(t * .45), c.rz); neo.case.scale.setScalar(Math.max(c.s, 1e-4) * zf);
  neo.setLid(c.lid); neo.case.updateMatrixWorld(true);
  // the buds: blend between their seat in the case and their free flight (one spring weight, never a swap)
  const orb = t >= 15.72 && t < 22.2 ? (t - 15.72) * .42 : 0;
  [neo.budL, neo.budR].forEach((b, i) => { const side = i ? 1 : -1; b.visible = budsOn && p.s > .002;
    const a = orb + (side < 0 ? Math.PI : 0), half = p.d / 2;
    pF.copy(at(p.x + Math.cos(a) * half, p.y + 10 * Math.sin(t * 1.5 + i))); pF.z = Math.sin(a) * half / PXU;
    qF.setFromEuler(new THREE.Euler(p.rx + .08 * Math.sin(t * .9 + i), -side * .6 + side * p.ry + -orb, -side * .25 + p.rz + .05 * Math.sin(t * .8 + i * 2)));
    sF.setScalar(Math.max(p.s, 1e-4) * 1.12);
    mBud.multiplyMatrices(neo.case.matrixWorld, neo.seatLocal(side)); mBud.decompose(pS, qS, sS);
    const w = clamp(p.w, 0, 1.2);
    b.position.lerpVectors(pF, pS, w); b.quaternion.slerpQuaternions(qF, qS, clamp(w)); b.scale.lerpVectors(sF, sS, clamp(w)); });
  // drops: only for IPX4, clinging and sliding slowly
  const dOn = t >= 40.0 && t < 43.2; drops.forEach(d => { d.visible = dOn; const u = d.userData; d.position.set(u.x, u.y - u.sp * Math.max(0, t - 40.6), u.z); });
  // light: lime rims on dark grounds, a moving light strip across the gloss during each change
  let r = 0; for (const [ti, v] of RIM) if (t >= ti) r = v; rim.intensity = r; rim2.intensity = r * .6;
  const sw = SWEEPS.find(([a, d]) => t >= a && t < a + d), u = sw ? sm((t - sw[0]) / sw[1]) : -1, key2 = sw ? u.toFixed(3) : 'none';
  if (key2 !== lastSweep) { neo.setSweep(u); lastSweep = key2; }
  neo.update();
  // shadow and glow on the canvas itself: a soft shadow on paper, a faint lime halo on black
  const darkG = r > 2; host.style.filter = darkG ? 'drop-shadow(0 0 30px rgba(130,230,0,.18))' : 'drop-shadow(0 50px 60px rgba(17,19,24,.28))';
  renderer.render(scene, camera);
}
const domSeek = window.seek;
window.seek = t => { domSeek(t); pose3d(t); };
const wait = () => new Promise(res => { const k = () => window.__domOK ? res() : setTimeout(k, 20); k(); });
await wait(); window.seek(0); window.__ready = true;
