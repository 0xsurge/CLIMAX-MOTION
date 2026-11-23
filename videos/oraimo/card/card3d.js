// The 3D SpaceBuds Neo+ for the product card: the case and buds fly in as the cluster, collapse into the card, sit in it
// and turn once on every colour swap (the reference turns its product on each swap), slide right for the spec sheet,
// and shrink away with the card. Pure function of t; one render per seek.
import * as THREE from 'three';
import { buildNeo } from '../neo/three/neo-model.js';

const host = document.getElementById('gl3');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(1080, 1080, false); renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
Object.assign(renderer.domElement.style, { position: 'absolute', left: '0', top: '0', width: '1080px', height: '1080px' });
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100); camera.position.set(0, 0, 6); camera.lookAt(0, 0, 0);
const PXU = 1080 / (2 * 6 * Math.tan(THREE.MathUtils.degToRad(12)));
const at = (px, py, z = 0) => new THREE.Vector3((px - 540) / PXU, (540 - py) / PXU, z);
scene.add(new THREE.HemisphereLight(0xffffff, 0x101010, 0.35));
const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(-2, 4, 5); scene.add(key);
const rim = new THREE.PointLight(0x9CFF2E, 0, 8, 1.4); rim.position.set(-2, 1.5, -1.8); scene.add(rim);
const neo = await buildNeo(THREE, renderer, scene, '../assets/neo/');
[neo.budL, neo.budR].forEach(b => scene.attach(b));
const { cardShape, stateAt, STATES } = window.CARD;
const mB = new THREE.Matrix4(), pS = new THREE.Vector3(), qS = new THREE.Quaternion(), sS = new THREE.Vector3(), pF = new THREE.Vector3(), qF = new THREE.Quaternion(), sF = new THREE.Vector3();
function pose(t) {
  const c = cardShape(t), fly = S(t - 1.65, { k: 70, c: 15 }), col = S(t - 2.4, { k: 200, c: 25 }), inCard = S(t - 2.7, { k: 120, c: 20 }), side = S(t - 6.43, { k: 160, c: 23 }) - S(t - 7.5, { k: 160, c: 23 });
  const vis = t >= 1.6 && t < 8.15;
  // turns: half a turn on every colour swap, each its own spring
  let turn = 0; STATES.forEach(s => { turn += Math.PI * S(t - s.t, { k: 110, c: 17 }); });
  // lid: closed in the cluster and most states; open for 30 h (charging) and game mode, and for the spec sheet
  const k = stateAt(t), openStates = [1, 4]; let lid = 0; STATES.forEach((s, i) => { const o = S(t - s.t, { k: 90, c: 15 }); lid += (openStates.includes(i) ? 1 : 0) * o - (i > 0 && openStates.includes(i - 1) ? 1 : 0) * o; });
  lid = Math.max(0, lid) + 1.6 * clamp(side) * (k === 4 ? 0 : 1);
  // the case: from below into the cluster -> the collapse -> the card centre -> right half of the spec sheet -> gone with the card
  let x = 540 + 40 * (1 - col), y = lerp(1200, 560, fly), s = lerp(.2, .95, clamp(fly)) * (1 - col * .85);
  if (t >= 2.6) { x = 540 + 255 * side; y = 540 - c.h * .1 * (1 - side) + 4 * Math.sin(t * 1.4); s = lerp(.14, .62, clamp(inCard)) * (1 + .16 * side) * (c.w / Math.max(1, lerp(430, 860, side) * (1 - c.sh * .95))) ; s = Math.min(s, .62 * (1 - .22 * side)) * (1 - c.sh); }
  // part two: the case sits in the pairing sheet, turning, its lid opening as it pairs; it rides the push into the button
  const inSheet = t >= 17.5 && t < 21.0;
  if (inSheet) { const rise = S(t - 17.55, { k: 110, c: 19 }), pu = window.PUSH2 || 0, k2 = 1 + 4 * pu; x = 540; y = 590 + (1 - rise) * 700; s = .5;
    y = 540 + (y - 540) * k2 - (811 - 540) * pu * 4; s = s * k2; }
  neo.case.visible = (vis || inSheet) && s > .005; neo.case.position.copy(at(x, y)); neo.case.scale.setScalar(Math.max(s, 1e-4));
  neo.case.rotation.set(.22 + .03 * Math.sin(t * .9), -.5 + (1 - fly) * -2.4 + turn + .06 * Math.sin(t * .6) + (t >= 6.43 ? -.3 * side : 0), .05 * Math.sin(t * .7) + (1 - fly) * .4);
  if (inSheet) { lid = S(t - 18.3, { k: 70, c: 14 }) * 1.15; neo.case.rotation.set(.3, -.4 + .35 * Math.sin((t - 17.5) * .9), 0); }
  neo.setLid(Math.min(1.85, inSheet ? lid * 1.6 : lid * 1.6)); neo.case.updateMatrixWorld(true);
  // the buds: two of them fly into the cluster beside the case, collapse with it, then sit in the case
  const bf = S(t - 1.75, { k: 80, c: 16 }), seat = t >= 2.6 ? 1 : 0, vis2 = vis || inSheet;
  [neo.budL, neo.budR].forEach((b, i) => { const sd = i ? 1 : -1; b.visible = vis2 && (seat ? lid > .02 || s > .005 : bf > .01);
    pF.copy(at(540 + sd * (190 + 120 * (1 - bf)) * (1 - col), lerp(-150, 420 + sd * 30, clamp(bf)) * (1 - col) + 540 * col)); qF.setFromEuler(new THREE.Euler(.2, -sd * .7 + t * .6 * sd, -sd * .3)); sF.setScalar(1.1 * (1 - col * .9) * clamp(bf * 1.5));
    mB.multiplyMatrices(neo.case.matrixWorld, neo.seatLocal(sd)); mB.decompose(pS, qS, sS);
    if (seat) { b.position.copy(pS); b.quaternion.copy(qS); b.scale.copy(sS); } else { b.position.copy(pF); b.quaternion.copy(qF); b.scale.copy(sF); } });
  // a lime rim on the dark colourway
  rim.intensity = k === 1 ? 2.4 : k === 2 ? 1.2 : .3;
  neo.update(); renderer.render(scene, camera);
}
const domSeek = window.seek;
window.seek = t => { domSeek(t); pose(t); };
const wait = () => new Promise(res => { const k = () => window.__domOK ? res() : setTimeout(k, 20); k(); });
await wait(); window.seek(0); window.__ready = true;
