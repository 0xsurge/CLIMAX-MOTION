// three-stage.js: a three.js stage that obeys the render contract (window.seek(t) paints frame t, nothing runs on its own).
// ES module. The page needs an import map that points "three" at lib/three/three.module.js and "three/addons/" at lib/three/addons/.
//   import { createStage } from './lib/three-stage.js';
//   const st = await createStage({ parent: document.getElementById('stage'), width: 1920, height: 1080 });
//   window.seek = t => { /* set positions from springs of t */ st.render(); };   // returns nothing
// No animation loop, no clock, no mixers driven by delta time: every transform is computed from t, then one render() per seek.
// preserveDrawingBuffer keeps the frame in the canvas until the renderer's screenshot reads it.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

export async function createStage({ parent, width = 1920, height = 1080, background = '#EFE6D6', fov = 30, hdr = null, exposure = 1 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  Object.assign(renderer.domElement.style, { position: 'absolute', left: '0', top: '0', width: width + 'px', height: height + 'px' });
  parent.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 200);

  // Image-based light: a real HDR (e.g. a Poly Haven studio, saved in the film's assets) when given, else three's built-in studio room.
  const pmrem = new THREE.PMREMGenerator(renderer);
  if (hdr) {
    const tex = await new HDRLoader().loadAsync(hdr);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = pmrem.fromEquirectangular(tex).texture;
    tex.dispose();
  } else {
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  }
  pmrem.dispose();

  return { THREE, renderer, scene, camera, render: () => { renderer.render(scene, camera); } };
}
