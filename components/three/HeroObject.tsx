"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MorphController } from "@/lib/controller";

/**
 * A large chrome torus knot floating behind the particle letters.
 * It is interactive in two ways:
 *  1. Scroll — the knot keeps rotating, twists further and breathes
 *     (scale pulse) as the user travels through the slide journey.
 *  2. Cursor — the knot continuously motion-tracks the pointer: it tilts
 *     toward the cursor and drifts toward it, with smooth damping so it
 *     feels weighty rather than twitchy.
 */
export default function HeroObject({
  controller,
}: {
  controller: MorphController;
}) {
  const group = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.Mesh>(null!);
  const mouse = useRef({ x: 0, y: 0 });
  const cur = useRef({ rx: 0, ry: 0, px: 0, py: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = controller.scrollProgress; // 0..1 across the journey
    const g = group.current;
    if (!g) return;

    // Damped motion-tracking toward the cursor.
    const k = 1 - Math.exp(-3.4 * delta);
    cur.current.rx += (mouse.current.y * 0.5 - cur.current.rx) * k;
    cur.current.ry += (mouse.current.x * 0.65 - cur.current.ry) * k;
    cur.current.px += (mouse.current.x * 0.85 - cur.current.px) * k;
    cur.current.py += (-mouse.current.y * 0.5 - cur.current.py) * k;

    // Scroll-driven choreography layered on top of cursor tracking.
    g.rotation.x = cur.current.rx + p * Math.PI * 1.25;
    g.rotation.y = cur.current.ry + t * 0.1 + p * Math.PI * 2;
    g.position.x = cur.current.px;
    g.position.y = cur.current.py;

    // Breathe: swell mid-journey, plus a slow idle pulse.
    const s =
      1 + Math.sin(p * Math.PI) * 0.16 + Math.sin(t * 0.55) * 0.028;
    g.scale.setScalar(s);

    if (mesh.current) mesh.current.rotation.z = t * 0.06 + p * 1.2;
  });

  return (
    <group ref={group} position={[0, 0, -2.8]}>
      <mesh ref={mesh}>
        <torusKnotGeometry args={[1.85, 0.52, 260, 40]} />
        <meshStandardMaterial
          color="#d8dce3"
          metalness={1.0}
          roughness={0.16}
          envMapIntensity={1.5}
        />
      </mesh>
    </group>
  );
}
