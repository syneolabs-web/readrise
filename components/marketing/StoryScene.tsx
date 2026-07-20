"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Sparkles, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Suspense, useMemo, useRef } from "react";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getVibeColors } from "@/lib/vibe-colors";

/**
 * The brand story as one continuous WebGL scene, driven by scroll.
 *
 * The characters are the user's own AI-generated sculpt trilogy — one kid,
 * three life-stages — processed through the repo's Blender pipeline
 * (scripts/blender/build-characters.py) into clay GLBs:
 *
 *   /models/scroller.glb  standing, head bent into his phone   (Act I)
 *   /models/reader.glb    seated, absorbed in an open book     (Acts II-III)
 *   /models/pair.glb      two friends sharing one book         (Act IV)
 *
 * Acts, matched to the Overlay chapters (which own the words):
 *   I    THE FEED       the scroller in a rain of dead feed cards
 *   II   THE INTERRUPT  the feed stalls; the boy crossfades to the reader
 *   III  THE PAGE       a highlight sweeps his book; a margin note answers
 *   IV   THE CIRCLE     the friends fade in; threads arc between readers
 *   V    THE RISE       the camera lifts; a vault of books assembles
 *
 * Craft rules:
 * - Clay exports stay colourless on purpose: every tint comes from
 *   lib/vibe-colors.ts at runtime, so the scene obeys the vibe × theme
 *   matrix (D13) live, mid-scroll.
 * - No remote anything: models are local, lights are analytic.
 * - prefers-reduced-motion collapses damping and idle motion into stills.
 */

const ramp = (s: number, a: number, b: number) =>
  THREE.MathUtils.smoothstep(s, a, b);
const lerp = THREE.MathUtils.lerp;

/** Camera waypoints frame the subject opposite each chapter's text column. */
const CAMERA_KEYS = [
  { t: 0.0, pos: [-1.3, 1.5, 7.6], look: [-1.3, 1.05, 0] }, // hero: subject right
  { t: 0.14, pos: [1.5, 1.45, 6.6], look: [1.35, 1.05, 0] }, // feed: subject left
  { t: 0.24, pos: [0.0, 1.5, 5.9], look: [0, 1.15, 0] }, // interrupt: centered
  { t: 0.34, pos: [-1.4, 1.35, 4.9], look: [-1.25, 0.85, 0] }, // book: subject right
  { t: 0.46, pos: [1.35, 1.3, 4.2], look: [1.2, 0.8, 0] }, // highlight: close, left
  { t: 0.56, pos: [-1.2, 1.35, 5.4], look: [-1.05, 0.85, 0] }, // margin: subject right
  { t: 0.7, pos: [0.0, 2.0, 8.4], look: [0, 0.95, 0] }, // circle: wide
  { t: 0.84, pos: [0.0, 3.1, 9.4], look: [0, 1.25, 0] }, // rise begins
  { t: 1.0, pos: [0.0, 5.2, 11.2], look: [0, 1.7, 0] }, // the shelf below
] as const;

function cameraAt(s: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  let i = 0;
  while (i < CAMERA_KEYS.length - 2 && s > CAMERA_KEYS[i + 1]!.t) i++;
  const a = CAMERA_KEYS[i]!;
  const b = CAMERA_KEYS[i + 1]!;
  const f = THREE.MathUtils.smoothstep(s, a.t, b.t);
  outPos.set(
    lerp(a.pos[0], b.pos[0], f),
    lerp(a.pos[1], b.pos[1], f),
    lerp(a.pos[2], b.pos[2], f)
  );
  outLook.set(
    lerp(a.look[0], b.look[0], f),
    lerp(a.look[1], b.look[1], f),
    lerp(a.look[2], b.look[2], f)
  );
}

/** First mesh geometry inside a GLB scene — our exports hold exactly one. */
function firstGeometry(scene: THREE.Group): THREE.BufferGeometry | null {
  let geo: THREE.BufferGeometry | null = null;
  scene.traverse((o) => {
    if (!geo && (o as THREE.Mesh).isMesh) geo = (o as THREE.Mesh).geometry;
  });
  return geo;
}

// ── feed stream (Act I) ─────────────────────────────────────

const FEED_COUNT = 42;
const FEED_SPAN = 12;

function useFeedSeeds() {
  return useMemo(
    () =>
      Array.from({ length: FEED_COUNT }, (_, i) => ({
        x: (Math.random() - 0.5) * 4.2,
        z: -2.2 - Math.random() * 3.5,
        offset: (i / FEED_COUNT) * FEED_SPAN,
        speed: 1.6 + Math.random() * 1.4,
        rot: (Math.random() - 0.5) * 0.4,
      })),
    []
  );
}

// ── vault shelf (Act V) ─────────────────────────────────────

const VAULT_COUNT = 26;

function useVaultSeeds() {
  return useMemo(
    () =>
      Array.from({ length: VAULT_COUNT }, (_, i) => {
        const col = i % 13;
        const row = Math.floor(i / 13);
        return {
          x: (col - 6) * 0.52 + (Math.random() - 0.5) * 0.06,
          y: 0.25 + row * 0.62,
          z: -2.6 - row * 0.3,
          h: 0.44 + Math.random() * 0.14,
          delay: Math.random() * 0.5,
        };
      }),
    []
  );
}

// ── the scene ───────────────────────────────────────────────

function SceneContent() {
  const { theme, vibe } = useAppTheme();
  const colors = useMemo(() => getVibeColors(vibe, theme), [vibe, theme]);

  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // the sculpt trilogy
  const scrollerGltf = useGLTF("/models/scroller.glb");
  const readerGltf = useGLTF("/models/reader.glb");
  const pairGltf = useGLTF("/models/pair.glb");
  const scrollerGeo = useMemo(() => firstGeometry(scrollerGltf.scene), [scrollerGltf]);
  const readerGeo = useMemo(() => firstGeometry(readerGltf.scene), [readerGltf]);
  const pairGeo = useMemo(() => firstGeometry(pairGltf.scene), [pairGltf]);

  // One material per life-stage: opacity drives the crossfades. The models
  // carry the concept art baked as vertex colours (COLOR_0, from
  // scripts/blender/colorize-characters.py), so the material stays white and
  // reads the paint — the characters keep their outfits in every vibe, while
  // lighting still warms with the theme.
  const scrollerMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.85,
        transparent: true,
        vertexColors: true,
      }),
    []
  );
  const readerMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.85,
        transparent: true,
        vertexColors: true,
        opacity: 0,
      }),
    []
  );
  const pairMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.85,
        transparent: true,
        vertexColors: true,
        opacity: 0,
      }),
    []
  );

  // damped scroll
  const target = useRef(0);
  const s = useRef(0);

  const scrollerRef = useRef<THREE.Group>(null);
  const readerRef = useRef<THREE.Group>(null);
  const pairRef = useRef<THREE.Group>(null);

  const screenGlow = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null);
  const highlightRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null);
  const noteRef = useRef<THREE.Group>(null);
  const noteMat = useRef<THREE.MeshStandardMaterial>(null);

  const feedInst = useRef<THREE.InstancedMesh>(null);
  const feedMat = useRef<THREE.MeshStandardMaterial>(null);
  const vaultInst = useRef<THREE.InstancedMesh>(null);
  const vaultMat = useRef<THREE.MeshStandardMaterial>(null);

  const threadMatA = useRef<THREE.MeshStandardMaterial>(null);
  const threadMatB = useRef<THREE.MeshStandardMaterial>(null);

  const keyLight = useRef<THREE.DirectionalLight>(null);
  const bgColor = useRef(new THREE.Color(colors.bg));

  const feedSeeds = useFeedSeeds();
  const vaultSeeds = useVaultSeeds();

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const camLook = useMemo(() => new THREE.Vector3(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  // thread arcs: from the pair (left) to the reader (centre)
  const threadGeoA = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-2.5, 1.15, -0.2),
      new THREE.Vector3(-1.2, 2.2, 0.3),
      new THREE.Vector3(-0.1, 1.0, 0.35)
    );
    return new THREE.TubeGeometry(curve, 24, 0.014, 6);
  }, []);
  const threadGeoB = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-2.15, 1.1, 0.1),
      new THREE.Vector3(-0.9, 1.9, 0.5),
      new THREE.Vector3(0.15, 0.95, 0.4)
    );
    return new THREE.TubeGeometry(curve, 24, 0.014, 6);
  }, []);

  useFrame((state, delta) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0) target.current = window.scrollY / max;
    const damp = reduced ? 1 : 1 - Math.pow(0.0025, delta);
    s.current = lerp(s.current, target.current, damp);
    const t = s.current;
    const time = state.clock.elapsedTime;

    // act phases
    const feed = 1 - ramp(t, 0.14, 0.28);
    const warm = ramp(t, 0.24, 0.44);
    const toReader = ramp(t, 0.26, 0.4); // scroller → reader crossfade
    const page = ramp(t, 0.44, 0.56); // highlight sweep + note
    const circle = ramp(t, 0.56, 0.72); // friends + threads
    const rise = ramp(t, 0.78, 0.96); // vault assembles

    // ── camera ──────────────────────────────────────────────
    cameraAt(t, camPos, camLook);
    if (!reduced) {
      camPos.x += Math.sin(time * 0.4) * 0.05;
      camPos.y += Math.sin(time * 0.55) * 0.035;
    }
    state.camera.position.copy(camPos);
    state.camera.lookAt(camLook);

    // ── atmosphere ──────────────────────────────────────────
    bgColor.current.lerp(tmpColor.set(colors.bg), 0.08);
    if (state.scene.background instanceof THREE.Color) {
      state.scene.background.copy(bgColor.current);
    }
    if (state.scene.fog instanceof THREE.Fog) {
      state.scene.fog.color.copy(bgColor.current);
    }
    if (keyLight.current) {
      keyLight.current.color.lerpColors(
        tmpColor.set(colors.coldScreen),
        new THREE.Color(colors.accent),
        warm
      );
      keyLight.current.intensity = theme === "light" ? 1.7 : 1.15 + warm * 0.5;
    }

    // ── the life-stages ─────────────────────────────────────
    // material.color MULTIPLIES vertex colours — stay white or the baked
    // outfits turn muddy. The vibe reaches the characters through lighting.
    scrollerMat.opacity = 1 - toReader;
    readerMat.opacity = toReader;
    pairMat.opacity = circle;

    if (scrollerRef.current) {
      scrollerRef.current.visible = scrollerMat.opacity > 0.01;
      // restless doomscroll sway; stills under reduced motion
      scrollerRef.current.rotation.y =
        0.15 + (reduced ? 0 : Math.sin(time * 0.7) * 0.05 + Math.sin(time * 6.3) * 0.008);
    }
    if (readerRef.current) {
      readerRef.current.visible = readerMat.opacity > 0.01;
      // slow reading breath
      readerRef.current.position.y = reduced ? 0 : Math.sin(time * 1.4) * 0.012;
      readerRef.current.rotation.y = -0.12;
    }
    if (pairRef.current) {
      pairRef.current.visible = pairMat.opacity > 0.01;
    }
    if (threadMatA.current) threadMatA.current.opacity = circle * 0.85;
    if (threadMatB.current) threadMatB.current.opacity = circle * 0.85;

    // ── the scroller's phone glow ───────────────────────────
    if (screenGlow.current) {
      screenGlow.current.visible = scrollerMat.opacity > 0.01;
      screenGlow.current.material.opacity = scrollerMat.opacity * (0.35 + 0.65 * feed);
      screenGlow.current.material.emissive.set(colors.coldScreen);
      screenGlow.current.material.emissiveIntensity =
        (reduced ? 1.1 : 0.9 + Math.sin(time * 7) * 0.3) * Math.max(feed, 0.25);
    }

    // ── the highlight + margin note on the reader's book ────
    if (highlightRef.current) {
      const sweep = ramp(t, 0.46, 0.54);
      highlightRef.current.visible = page > 0.01 && toReader > 0.5;
      highlightRef.current.scale.x = Math.max(0.001, sweep);
      highlightRef.current.material.opacity = page * 0.95;
      highlightRef.current.material.color.set(colors.accent);
      highlightRef.current.material.emissive.set(colors.accent);
    }
    if (noteRef.current && noteMat.current) {
      noteRef.current.visible = page > 0.05;
      noteMat.current.opacity = ramp(t, 0.5, 0.58);
      noteRef.current.position.y = 1.0 + ramp(t, 0.5, 0.58) * 0.1;
    }

    // ── feed stream ─────────────────────────────────────────
    if (feedInst.current && feedMat.current) {
      feedInst.current.visible = feed > 0.01;
      feedMat.current.opacity = feed * 0.55;
      feedMat.current.color.set(colors.cold);
      feedMat.current.emissive.set(colors.coldScreen);
      const flow = reduced ? 40 : time * 1.0;
      feedSeeds.forEach((seed, i) => {
        const y = FEED_SPAN / 2 - ((seed.offset + flow * seed.speed * feed) % FEED_SPAN);
        dummy.position.set(seed.x, y + 1.2, seed.z);
        dummy.rotation.set(0, 0, seed.rot);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        feedInst.current!.setMatrixAt(i, dummy.matrix);
      });
      feedInst.current.instanceMatrix.needsUpdate = true;
    }

    // ── vault shelf ─────────────────────────────────────────
    if (vaultInst.current && vaultMat.current) {
      vaultInst.current.visible = rise > 0.01;
      vaultMat.current.opacity = Math.min(1, rise * 1.4);
      vaultMat.current.color.set(colors.paper);
      vaultSeeds.forEach((seed, i) => {
        const k = THREE.MathUtils.smoothstep(rise, seed.delay * 0.5, 0.6 + seed.delay * 0.4);
        dummy.position.set(seed.x, seed.y * k - (1 - k) * 1.5, seed.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, seed.h * k + 0.001, 1);
        dummy.updateMatrix();
        vaultInst.current!.setMatrixAt(i, dummy.matrix);
      });
      vaultInst.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <color attach="background" args={[colors.bg]} />
      <fog attach="fog" args={[colors.bg, 9, 22]} />

      <ambientLight intensity={theme === "light" ? 1.1 : 0.5} />
      <directionalLight ref={keyLight} position={[4, 6, 5]} intensity={1.2} />
      <directionalLight position={[-5, 3, -4]} intensity={0.35} color="#ffffff" />

      {/* Act I — the scroller, phone in hand */}
      {scrollerGeo && (
        <group ref={scrollerRef}>
          <mesh geometry={scrollerGeo} material={scrollerMat} />
          {/* cold glow ON the scan's floating phone slab — the glow is what
              makes the detached slab read as a lit screen, not debris */}
          <mesh ref={screenGlow} position={[-0.52, 1.16, 0.34]} rotation={[-0.3, 0.3, 0.05]}>
            <planeGeometry args={[0.34, 0.6]} />
            <meshStandardMaterial transparent />
          </mesh>
        </group>
      )}

      {/* Acts II-V — the reader */}
      {readerGeo && (
        <group ref={readerRef} visible={false}>
          <mesh geometry={readerGeo} material={readerMat} />
        </group>
      )}

      {/* Act IV — the friends, sharing one book */}
      {pairGeo && (
        <group ref={pairRef} position={[-2.55, 0, -0.35]} rotation={[0, 0.55, 0]} visible={false}>
          <mesh geometry={pairGeo} material={pairMat} />
        </group>
      )}

      {/* threads between the readers — the app's own avatar colours */}
      <mesh geometry={threadGeoA}>
        <meshStandardMaterial
          ref={threadMatA}
          color={colors.friendA}
          emissive={colors.friendA}
          emissiveIntensity={0.6}
          transparent
          opacity={0}
        />
      </mesh>
      <mesh geometry={threadGeoB}>
        <meshStandardMaterial
          ref={threadMatB}
          color={colors.friendB}
          emissive={colors.friendB}
          emissiveIntensity={0.6}
          transparent
          opacity={0}
        />
      </mesh>

      {/* the highlight sweeping a line of the reader's sculpted book */}
      <mesh ref={highlightRef} position={[-0.05, 0.88, 0.31]} rotation={[-0.45, -0.1, 0]} visible={false}>
        <planeGeometry args={[0.4, 0.05]} />
        <meshStandardMaterial emissiveIntensity={0.8} transparent opacity={0} />
      </mesh>

      {/* the margin note that answers it */}
      <group ref={noteRef} position={[0.58, 1.0, 0.42]} rotation={[0, -0.25, 0]} visible={false}>
        <mesh>
          <planeGeometry args={[0.7, 0.36]} />
          <meshStandardMaterial ref={noteMat} color={colors.paper} transparent opacity={0} />
        </mesh>
        <mesh position={[-0.32, 0, 0.002]}>
          <planeGeometry args={[0.045, 0.36]} />
          <meshStandardMaterial color={colors.friendA} transparent opacity={0.9} />
        </mesh>
        {[0.07, -0.02, -0.11].map((y) => (
          <mesh key={y} position={[0.03, y, 0.002]}>
            <planeGeometry args={[0.5, 0.024]} />
            <meshStandardMaterial color={colors.paperInk} transparent opacity={0.35} />
          </mesh>
        ))}
      </group>

      {/* the feed */}
      <instancedMesh ref={feedInst} args={[undefined, undefined, FEED_COUNT]}>
        <planeGeometry args={[0.95, 0.55]} />
        <meshStandardMaterial ref={feedMat} transparent emissiveIntensity={0.35} />
      </instancedMesh>

      {/* the vault */}
      <instancedMesh ref={vaultInst} args={[undefined, undefined, VAULT_COUNT]} visible={false}>
        <boxGeometry args={[0.36, 1, 0.26]} />
        <meshStandardMaterial ref={vaultMat} roughness={0.85} transparent />
      </instancedMesh>

      <ColdWarmSparkles colors={colors} />

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={theme === "light" ? 0.25 : 0.45}
        scale={14}
        blur={2.4}
        far={4}
        resolution={256}
        frames={1}
      />
    </>
  );
}

/** Two sparkle fields crossfaded by scroll: cold static → warm embers. */
function ColdWarmSparkles({ colors }: { colors: ReturnType<typeof getVibeColors> }) {
  const cold = useRef<THREE.Points>(null);
  const warmPts = useRef<THREE.Points>(null);

  useFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const t = max > 0 ? window.scrollY / max : 0;
    const w = ramp(t, 0.24, 0.44);
    if (cold.current) (cold.current.material as THREE.PointsMaterial).opacity = (1 - w) * 0.45;
    if (warmPts.current) (warmPts.current.material as THREE.PointsMaterial).opacity = w * 0.8;
  });

  return (
    <>
      <Sparkles ref={cold as never} count={90} scale={[10, 6, 6]} size={1.6} speed={0.9} color={colors.coldScreen} opacity={0.45} />
      <Sparkles ref={warmPts as never} count={140} scale={[9, 6, 6]} size={2.2} speed={0.25} color={colors.accent} opacity={0} />
    </>
  );
}

useGLTF.preload("/models/scroller.glb");
useGLTF.preload("/models/reader.glb");
useGLTF.preload("/models/pair.glb");

export function StoryScene() {
  return (
    // z-0, NOT a negative z-index: anything below z-0 renders behind the
    // body's own background paint and is silently invisible. The overlay
    // stacks above at z-10.
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1.5, 7.6], fov: 38 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
