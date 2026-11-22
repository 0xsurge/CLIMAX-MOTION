// SpaceBuds Neo+ (oraimo x Zehan) modelled in three.js from oraimo's own renders (../../assets/neo/*.jpg).
// Units: the case is 1.0 wide. buildNeo returns { case, lid, budL, budR, setLid(angle), seatBuds(), update(), setSweep(u) }.
// Pure: nothing animates on its own; the film sets transforms from springs of t, then calls update() and one render.
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const W = 1.0, H = 0.88, D = 0.5, R = 0.19, SEAM = -H / 2 + 0.36 * H, GAP = 0.0035;

const loadTex = (THREE, url) => new Promise(res => new THREE.TextureLoader().load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }));
const canvasTex = (THREE, w, h, draw, srgb = false) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const roundRect = (THREE, w, h, r) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };

// studio light for reflections: softboxes in a black room; u (0..1) moves one extra strip across for a light pass
function studio(THREE, sweepU = -1) {
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x000000);
  const box = (w, h, inten, pos, look, col = 0xffffff) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(inten), side: THREE.DoubleSide });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(...pos); p.lookAt(...look); sc.add(p); };
  box(8, 3, 3.0, [0, 6, 1.5], [0, 0, 0]);              // top softbox: the long highlight along the lid
  box(1.6, 7, 5.0, [-6, 1, 2], [0, 0, 0]);             // left strip: the edge line
  box(1.2, 6, 2.6, [5.5, 0.5, 3], [0, 0, 0]);          // right fill strip
  box(8, 1.0, 3.0, [0, 0.6, -6], [0, 0, 0]);           // back rim
  box(9, 5, 0.9, [0, 1.5, 6.5], [0, 0, 0]);            // big soft front panel: the grey sheen across the front face
  box(12, 12, 0.12, [0, -6, 0], [0, 0, 0]);            // dim floor bounce
  if (sweepU >= 0 && sweepU <= 1) { const a = -1.2 + 2.4 * sweepU; box(0.9, 8, 6, [6 * Math.sin(a), 1, 6 * Math.cos(a)], [0, 0, 0]); }
  return sc;
}

export async function buildNeo(THREE, renderer, scene, base = '../../assets/neo/') {
  renderer.localClippingEnabled = true;
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envRT = pmrem.fromScene(studio(THREE), 0.02); scene.environment = envRT.texture;
  const setSweep = u => { if (envRT) envRT.dispose(); envRT = pmrem.fromScene(studio(THREE, u), 0.02); scene.environment = envRT.texture; };

  // materials: piano-black lid, a touch satin on the body, silicone tips, chrome stem rings
  const lidMat = new THREE.MeshPhysicalMaterial({ color: 0x08080a, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.1 });
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x101012, roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.3, envMapIntensity: 1.0 });
  const capMat = new THREE.MeshPhysicalMaterial({ color: 0x0c0c0e, roughness: 0.35, clearcoat: .5, side: THREE.DoubleSide });
  // the inner lid's feather-wave pattern (soft chevron ripples), as a bump map
  const ribs = canvasTex(THREE, 1024, 512, (g, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    for (let row = -2; row < 18; row++) { const y0 = row * 34; const gr = g.createLinearGradient(0, y0 - 14, 0, y0 + 14); gr.addColorStop(0, '#808080'); gr.addColorStop(.5, '#e8e8e8'); gr.addColorStop(1, '#808080');
      g.strokeStyle = gr; g.lineWidth = 18; g.beginPath(); for (let x = 0; x <= w; x += 8) { const y = y0 + 22 * Math.abs(((x / 120) % 2) - 1) + 6 * Math.sin(x / 37 + row); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } });
  ribs.wrapS = ribs.wrapT = THREE.RepeatWrapping; ribs.repeat.set(1, 1);
  const innerMat = new THREE.MeshPhysicalMaterial({ color: 0x1c1d20, metalness: 0.5, roughness: 0.22, clearcoat: .6, bumpMap: ribs, bumpScale: 1.2, side: THREE.DoubleSide });
  const tipMat = new THREE.MeshPhysicalMaterial({ color: 0x2c2f33, roughness: 0.5, sheen: 0.6, sheenColor: new THREE.Color(0x777777) });
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xdedede, metalness: 1, roughness: 0.12 });

  const geo = new RoundedBoxGeometry(W, H, D, 10, R);
  const cs = new THREE.Group(); scene.add(cs);
  // body: the rounded box clipped below the seam, closed by a matte tray with two bud wells
  const body = new THREE.Mesh(geo, bodyMat.clone()); body.castShadow = true; cs.add(body);
  const tray = new THREE.Mesh(new THREE.ShapeGeometry(roundRect(THREE, W - .03, D - .03, R - .015), 24), capMat); tray.rotation.x = -Math.PI / 2; tray.position.y = SEAM - GAP; cs.add(tray);
  [-1, 1].forEach(s => { const well = new THREE.Mesh(new THREE.CircleGeometry(.085, 40), new THREE.MeshBasicMaterial({ color: 0x000000 })); well.rotation.x = -Math.PI / 2; well.scale.set(1.15, 1, 1); well.position.set(s * .2, SEAM - GAP + .001, .02); cs.add(well); });
  const led = new THREE.Mesh(new THREE.CircleGeometry(.009, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.6) })); led.position.set(0, -H / 2 + .1, D / 2 + .0015); cs.add(led);
  // lid: same box clipped above the seam, hinged at the back edge of the seam; ribbed inner face; the real gold print on its front
  const hinge = new THREE.Group(); hinge.position.set(0, SEAM, -D / 2); cs.add(hinge);
  const lid = new THREE.Mesh(geo, lidMat); lid.position.set(0, -SEAM, D / 2); lid.castShadow = true; hinge.add(lid);
  const inner = new THREE.Mesh(new THREE.ShapeGeometry(roundRect(THREE, W - .03, D - .03, R - .015), 24), innerMat); inner.rotation.x = Math.PI / 2; inner.position.y = SEAM + GAP; lid.add(inner);
  const printTex = await loadTex(THREE, base + 'print_gold.png');
  const pw = .44, ph = pw * 245 / 270;
  const print = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshPhysicalMaterial({ map: printTex, transparent: true, metalness: 0.6, roughness: 0.3, color: 0xffffff, emissive: 0xE8D08A, emissiveMap: printTex, emissiveIntensity: 0.35, polygonOffset: true, polygonOffsetFactor: -2 }));
  print.position.set(pw * (0.5 - 111 / 270), 0.06, D / 2 + 0.0012); lid.add(print);
  const clipBody = new THREE.Plane(), clipLid = new THREE.Plane();
  body.material.clippingPlanes = [clipBody]; lidMat.clippingPlanes = [clipLid];

  // a bud: angled head, silicone tip, long stem with diagonal ribs near the head and a chrome ring at the foot
  const stemBump = canvasTex(THREE, 256, 1024, (g, w, h) => { g.fillStyle = '#7a7a7a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff';
    for (let k = 0; k < 4; k++) { const y0 = h * (.12 + k * .07); g.beginPath(); g.moveTo(0, y0); g.lineTo(w, y0 - h * .05); g.lineTo(w, y0 - h * .05 + 22); g.lineTo(0, y0 + 22); g.fill(); } });
  const budMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0c, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06, bumpMap: stemBump, bumpScale: .35 });
  const headMat = new THREE.MeshPhysicalMaterial({ color: 0x09090b, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.05 });
  // signature strip for the stem: the real gold "Zehan" from the case print, turned to run along the stem, plus the debossed wordmark
  const sigImg = printTex.image;
  const stemArt = canvasTex(THREE, 256, 1024, (g, w, h) => { g.clearRect(0, 0, w, h); g.save(); g.translate(w / 2, h * .5); g.rotate(-Math.PI / 2);
    g.drawImage(sigImg, 0, sigImg.height * .42, sigImg.width, sigImg.height * .58, -h * .32, -w * .42, h * .5, w * .62); g.restore(); }, true);
  // one bud body: a circle swept along a bent path, thin along the stem and swelling into the head, closed at both ends
  const budPathFor = side => new THREE.CatmullRomCurve3([[0, -.36, 0], [0, -.2, 0], [0, -.07, .0], [side * .03, .03, .015], [side * .09, .075, .03], [side * .145, .085, .035]].map(p => new THREE.Vector3(...p)));
  const rad = u => { const stem = .056, headR = .108; let r = u < .55 ? stem : u < .78 ? stem + (headR - stem) * Math.sin(Math.PI / 2 * (u - .55) / .23) : headR;
    if (u < .04) r *= Math.sqrt(u / .04); if (u > .86) r *= Math.sqrt(Math.max(0, (1 - u) / .14)); return Math.max(r, 1e-4); };
  const sweep = (path, rf, nu = 160, nv = 48) => { const fr = path.computeFrenetFrames(nu, false), pos = [], uv = [], idx = [];
    for (let i = 0; i <= nu; i++) { const u = i / nu, c = path.getPointAt(u), N = fr.normals[i], B = fr.binormals[i], r = rf(u);
      for (let j = 0; j <= nv; j++) { const a = j / nv * Math.PI * 2, cx = Math.cos(a), sy = Math.sin(a); const sq = u < .6 ? .88 : 1;
        pos.push(c.x + r * (cx * N.x * sq + sy * B.x), c.y + r * (cx * N.y * sq + sy * B.y), c.z + r * (cx * N.z * sq + sy * B.z)); uv.push(j / nv, u); } }
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; };
  const makeBud = side => { const g = new THREE.Group();
    const budPath = budPathFor(side); const bodyM = new THREE.Mesh(sweep(budPath, rad), budMat); bodyM.castShadow = true; g.add(bodyM);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(.0565, .0565, .028, 48, 1, true), chrome); ring.position.y = -.322; ring.scale.set(.89, 1, 1); g.add(ring);
    // the sound nozzle and silicone tip leave the inner side of the head
    const end = budPath.getPointAt(.97), dir = budPath.getTangentAt(.97).normalize(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(.034, .045, .06, 32), headMat); nozzle.quaternion.copy(q); nozzle.position.copy(end).addScaledVector(dir, .02); g.add(nozzle);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(.07, 40, 28), tipMat); tip.scale.set(1, .72, 1); tip.quaternion.copy(q); tip.position.copy(end).addScaledVector(dir, .06); g.add(tip);
    const art = new THREE.Mesh(new THREE.PlaneGeometry(.075, .24), new THREE.MeshPhysicalMaterial({ map: stemArt, transparent: true, metalness: .6, roughness: .3, emissive: 0xE8D08A, emissiveMap: stemArt, emissiveIntensity: .35, polygonOffset: true, polygonOffsetFactor: -2 }));
    art.position.set(0, -.17, .0565); g.add(art);
    return g; };
  const budL = makeBud(-1), budR = makeBud(1); cs.add(budL, budR);
  const seatBuds = () => { [budL, budR].forEach((b, i) => { if (b.parent !== cs) cs.add(b); const s = i ? 1 : -1; b.position.set(s * .2, SEAM + .2, .02); b.rotation.set(0, s * .3, -s * .08); b.scale.setScalar(1.12); }); };
  seatBuds();

  const setLid = a => { hinge.rotation.x = -a; };
  const update = () => { scene.updateMatrixWorld(true);
    clipBody.set(new THREE.Vector3(0, -1, 0), SEAM - GAP).applyMatrix4(body.matrixWorld);
    clipLid.set(new THREE.Vector3(0, 1, 0), -(SEAM + GAP)).applyMatrix4(lid.matrixWorld); };
  const seatLocal = side => { const m = new THREE.Matrix4(); m.compose(new THREE.Vector3(side * .2, SEAM + .2, .02), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, side * .3, -side * .08)), new THREE.Vector3(1.12, 1.12, 1.12)); return m; };
  return { seatLocal, case: cs, lid: hinge, budL, budR, setLid, seatBuds, update, setSweep, dims: { W, H, D, SEAM } };
}
