// DRIP VERSE 3D test shot (6 s, 16:9): a warm, light set; a champagne tablet showing the DRIP VERSE product page;
// a chrome cursor flies in on an arc and presses a glass key with a gold drop inside; the press opens the "Send us a DM" pill.
// Everything is driven by useCurrentFrame(); no useFrame, no self-running animation.
import { ThreeCanvas } from "@remotion/three";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P, bump, sp, track } from "./motion";

const GOLD = "#C49A55";

// ---------- camera: spring keys + a sway that returns to centre ----------
const CamRig: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { camera } = useThree();
  const t = frame / fps;
  const x = track(frame, fps, [{ t: 0, v: -3.4 }, { t: 0, v: -0.6, s: P.glide }, { t: 1.9, v: 1.4, s: P.glide }, { t: 3.6, v: 0.35, s: P.glide }]);
  const y = track(frame, fps, [{ t: 0, v: 2.6 }, { t: 0, v: 1.9, s: P.glide }, { t: 1.9, v: 1.45, s: P.glide }, { t: 3.6, v: 2.05, s: P.glide }]);
  const z = track(frame, fps, [{ t: 0, v: 8.2 }, { t: 0, v: 6.4, s: P.glide }, { t: 1.9, v: 4.4, s: P.glide }, { t: 3.6, v: 7.9, s: P.glide }]);
  const lx = track(frame, fps, [{ t: 0, v: -0.7 }, { t: 1.9, v: 1.5, s: P.glide }, { t: 3.6, v: 0.45, s: P.glide }]);
  const ly = track(frame, fps, [{ t: 0, v: 1.15 }, { t: 1.9, v: 0.55, s: P.glide }, { t: 3.6, v: 0.6, s: P.glide }]);
  const sw = 1 - 0.6 * sp(frame, fps, 4.6, P.heavy);
  useLayoutEffect(() => {
    camera.position.set(x + sw * 0.08 * Math.sin(t * 1.1), y + sw * 0.04 * Math.sin(t * 1.5 + 1), z);
    camera.lookAt(lx, ly, 0);
    camera.updateProjectionMatrix();
  });
  return null;
};

// ---------- the tablet: champagne metal body, real DRIP VERSE UI on the screen ----------
const Tablet: React.FC<{ tex: THREE.Texture | null; frame: number; fps: number }> = ({ tex, frame, fps }) => {
  const t = frame / fps;
  const settle = sp(frame, fps, 0.05, P.heavy);
  return (
    <group position={[-0.75, 1.2 + 0.03 * Math.sin(t * 1.3), -0.2]} rotation={[-0.2 + 0.12 * (1 - settle), 0.42 - 0.08 * settle, 0]}>
      <RoundedBox args={[3.3, 1.95, 0.12]} radius={0.06} smoothness={6} castShadow>
        <meshPhysicalMaterial color="#D8C4A0" metalness={0.92} roughness={0.28} clearcoat={0.6} clearcoatRoughness={0.2} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0625]}>
        <planeGeometry args={[3.14, 1.79]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0, 0.064]}>
        <planeGeometry args={[3.06, 1.71]} />
        <meshBasicMaterial map={tex ?? undefined} toneMapped={false} />
      </mesh>
      {/* a thin glass layer over the screen picks up the moving light */}
      <mesh position={[0, 0, 0.066]}>
        <planeGeometry args={[3.14, 1.79]} />
        <meshPhysicalMaterial transparent opacity={0.12} roughness={0.05} metalness={0} clearcoat={1} color="#ffffff" />
      </mesh>
      {/* stand */}
      <mesh position={[0, -1.15, -0.35]} rotation={[0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.06]} />
        <meshPhysicalMaterial color="#CDB894" metalness={0.9} roughness={0.32} />
      </mesh>
    </group>
  );
};

// ---------- the brass drop (extruded) ----------
const useDropGeometry = () =>
  useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.5);
    s.bezierCurveTo(-0.06, 0.24, -0.26, 0.06, -0.26, -0.12);
    s.absarc(0, -0.12, 0.26, Math.PI, 0, false);
    s.bezierCurveTo(0.26, 0.06, 0.06, 0.24, 0, 0.5);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 6, curveSegments: 32 });
    g.center();
    return g;
  }, []);

// ---------- the glass key ----------
const GlassKey: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const drop = useDropGeometry();
  const press = sp(frame, fps, 2.62, P.snappy) - sp(frame, fps, 2.78, P.default);
  const glow = bump(frame, fps, 2.62, 0.7);
  const enter = sp(frame, fps, 0.5, P.default);
  return (
    <group position={[2.05, 0.22 - 0.07 * press, 0.95]} rotation={[0, -0.35, 0]} scale={0.85 + 0.15 * enter}>
      <RoundedBox args={[1.0, 0.42, 1.0]} radius={0.16} smoothness={8} castShadow>
        <meshPhysicalMaterial transmission={1} thickness={0.2} roughness={0.04} ior={1.25} color="#FFFFFF" attenuationColor="#FFF6E8" attenuationDistance={6} clearcoat={1} specularIntensity={1} />
      </RoundedBox>
      <mesh geometry={drop} position={[0, 0.0, 0]} rotation={[0, 0.35, 0]} scale={0.27}>
        <meshPhysicalMaterial color={GOLD} metalness={1} roughness={0.22} emissive="#E8B868" emissiveIntensity={0.25 + 1.6 * glow} />
      </mesh>
      <pointLight position={[0, 0.5, 0]} color="#FFC873" intensity={6 * glow} distance={3} decay={2} />
    </group>
  );
};

// ---------- the chrome cursor: flies in on an arc, stretches with speed, presses ----------
const Cursor: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const pts: [number, number][] = [[0, 0], [0, -1.0], [0.25, -0.78], [0.44, -1.18], [0.6, -1.1], [0.42, -0.72], [0.74, -0.72]];
    s.moveTo(...pts[0]);
    pts.slice(1).forEach((p) => s.lineTo(...p));
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.045, bevelSegments: 8 });
    return g;
  }, []);
  const k = sp(frame, fps, 1.25, P.glide);
  // quadratic bezier arc from off-frame right to just above the key
  const a = new THREE.Vector3(4.6, 3.2, 2.4), c = new THREE.Vector3(3.2, 2.6, 2.8), b = new THREE.Vector3(2.16, 0.95, 1.15);
  const p = new THREE.Vector3().copy(a).multiplyScalar((1 - k) ** 2).add(c.clone().multiplyScalar(2 * k * (1 - k))).add(b.clone().multiplyScalar(k * k));
  const press = sp(frame, fps, 2.55, P.snappy) - sp(frame, fps, 2.78, P.default);
  const out = sp(frame, fps, 3.4, P.default);
  const t = frame / fps;
  return (
    <group position={[p.x - 0.2 * out, p.y - 0.12 * press + 0.3 * out + 0.03 * Math.sin(t * 2.2) * k, p.z + 0.2 * out]} rotation={[-0.5, -0.55, 0.42 - 0.2 * k]} scale={0.42 * (1 - 0.06 * press)}>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial color="#F4F4F6" metalness={1} roughness={0.07} clearcoat={1} />
      </mesh>
    </group>
  );
};

const Scene: React.FC<{ tex: THREE.Texture | null }> = ({ tex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // the moving gold light: it travels across the set three times and dies away each time
  const passes = [0.35, 2.55, 3.9];
  let li = 0, lx = 0;
  for (const p0 of passes) {
    const b = bump(frame, fps, p0, 0.9);
    if (b > li) { li = b; lx = -5 + 10 * sp(frame, fps, p0, { stiffness: 10, damping: 6 }); }
  }
  return (
    <>
      <CamRig />
      <color attach="background" args={["#EFE6D6"]} />
      <fog attach="fog" args={["#EFE6D6", 7, 15]} />
      <ambientLight intensity={0.35} color="#FFF4E4" />
      <spotLight position={[-4, 7, 5]} angle={0.55} penumbra={0.9} intensity={160} color="#FFE2B8" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
      <directionalLight position={[5, 3, -4]} intensity={1.2} color="#FFFFFF" />
      <pointLight position={[lx, 2.2, 2.6]} intensity={70 * li} color="#FFC46A" distance={9} decay={2} />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#2A2520"]} />
        <Lightformer form="rect" intensity={3} color="#FFE7C2" position={[-3, 4, 3]} scale={[5, 1.2, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#FFFFFF" position={[4, 2, 2]} scale={[0.6, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#FFFFFF" position={[-4, 1, -2]} scale={[0.4, 5, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#E9C27C" position={[0, 3, -5]} scale={3} />
        <Lightformer form="rect" intensity={1.1} color="#F3E6D0" position={[0, -3, 0]} rotation-x={Math.PI / 2} scale={[6, 2, 1]} />
      </Environment>
      {/* seamless floor that curves up into the backdrop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#EFE6D6" roughness={0.95} />
      </mesh>
      {/* the warm light pool under the key */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.05, 0.005, 0.95]}>
        <circleGeometry args={[1.4, 64]} />
        <meshBasicMaterial transparent opacity={0.35 + 0.3 * bump(frame, fps, 2.62, 0.7)} color="#F3C77D" alphaMap={useRadial()} depthWrite={false} />
      </mesh>
      <Tablet tex={tex} frame={frame} fps={fps} />
      <GlassKey frame={frame} fps={fps} />
      <Cursor frame={frame} fps={fps} />
    </>
  );
};

let radialTex: THREE.Texture | null = null;
function useRadial() {
  return useMemo(() => {
    if (radialTex) return radialTex;
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d")!; const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "#fff"); gr.addColorStop(0.5, "#777"); gr.addColorStop(1, "#000");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    radialTex = new THREE.CanvasTexture(c); return radialTex;
  }, []);
}

// ---------- the pill (HTML over the canvas): rises out of the press, with a travelling rim light ----------
const Pill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = sp(frame, fps, 3.75, P.snappy);
  const lab = sp(frame, fps, 4.05, P.heavy);
  const rim = Math.max(bump(frame, fps, 4.0, 0.7), bump(frame, fps, 5.2, 0.7));
  const ang = (frame / fps) * 160;
  const conic = `conic-gradient(from ${ang}deg, rgba(226,182,98,0) 0deg, rgba(226,182,98,0) 200deg, #D9B26A 280deg, #FFF1D2 305deg, #D9B26A 330deg, rgba(226,182,98,0) 360deg)`;
  const fl = 4 * Math.sin((frame / fps) * 1.6) * lab;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 120, pointerEvents: "none" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, transform: `translateY(${fl}px)` }}>
        <div style={{ overflow: "hidden", height: 34 }}>
          <div style={{ font: "600 24px/34px Geist", letterSpacing: ".3em", paddingLeft: ".3em", color: "#121214", transform: `translateY(${(1 - lab) * 40}px)` }}>DRIP VERSE</div>
        </div>
        <div style={{ position: "relative", width: 480, height: 108, transform: `translateY(${(1 - e) * 90}px) scale(${0.6 + 0.4 * e})`, visibility: e < 0.01 ? "hidden" : "visible" }}>
          <div style={{ position: "absolute", inset: -10, borderRadius: 64, background: conic, filter: "blur(14px)", opacity: rim }} />
          <div style={{ position: "absolute", inset: -3, borderRadius: 57, background: conic, opacity: rim }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 54, background: "linear-gradient(135deg,#E2C48A 0%,#B8904F 55%,#8E6A31 100%)", boxShadow: "0 24px 50px rgba(120,90,40,.3)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", font: "600 36px/1 Geist", color: "#FFF9EE" }}>Send us a DM</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Shot: React.FC = () => {
  const { width, height } = useVideoConfig();
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender("assets"));
  useEffect(() => {
    const font = new FontFace("Geist", `url(${staticFile("geist.woff2")})`, { weight: "100 900" });
    const fontP = font.load().then((f) => document.fonts.add(f));
    const texP = new THREE.TextureLoader().loadAsync(staticFile("ui.png")).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; setTex(t); });
    Promise.all([fontP, texP]).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#EFE6D6" }}>
      <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }} camera={{ fov: 30, position: [0, 2, 8] }}>
        <Scene tex={tex} />
      </ThreeCanvas>
      <Pill />
    </AbsoluteFill>
  );
};
