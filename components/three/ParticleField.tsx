"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MorphController } from "@/lib/controller";

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface Props {
  controller: MorphController;
  count: number;
}

/**
 * ~15k metallic beads that melt & reform between letter/shape targets.
 * All motion is computed on the CPU into an InstancedMesh.
 */
export default function ParticleField({ controller, count }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  const geom = useMemo(() => new THREE.IcosahedronGeometry(0.024, 1), []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0b0b0d",
        metalness: 1.0,
        roughness: 0.2,
        envMapIntensity: 1.35,
      }),
    []
  );

  const data = useMemo(() => {
    const mk = () => new Float32Array(count * 3);
    return {
      cur: mk(),
      from: mk(),
      to: mk(),
      scat: mk(),
      delay: new Float32Array(count),
      dur: new Float32Array(count),
      start: new Float32Array(count).fill(-10),
      phase: new Float32Array(count),
      speed: new Float32Array(count),
      scale: new Float32Array(count),
    };
  }, [count]);

  const tmp = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      p: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      s: new THREE.Vector3(),
    }),
    []
  );

  const spin = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });
  const seeded = useRef(false);

  // Subtle black-chrome variation per bead.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const v = 0.05 + Math.random() * 0.09;
      c.setRGB(v, v * 0.99, Math.min(1, v * 1.05));
      mesh.setColorAt(i, c);
      data.phase[i] = Math.random() * Math.PI * 2;
      data.speed[i] = 0.5 + Math.random() * 1.1;
      data.scale[i] = 0.7 + Math.random() * 0.65;
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, data]);

  // Mouse parallax.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    controller.now = t;
    const mesh = meshRef.current;
    if (!mesh) return;

    // Seed once targets are available.
    if (!seeded.current) {
      if (controller.targets.size === 0) return;
      const v = controller.targets.get("V")!;
      data.cur.set(v);
      data.from.set(v);
      data.to.set(v);
      seeded.current = true;
      controller.current = "V";
    }

    // Begin a morph transition.
    const req = controller.requestMorph;
    if (req && controller.targets.has(req)) {
      const target = controller.targets.get(req)!;
      data.from.set(data.cur);
      data.to.set(target);
      for (let i = 0; i < count; i++) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const r = 0.45 + Math.random() * 0.85;
        data.scat[i * 3] = Math.sin(ph) * Math.cos(th) * r;
        data.scat[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * r;
        data.scat[i * 3 + 2] = Math.cos(ph) * r;
        data.delay[i] = Math.random() * 0.45;
        data.dur[i] = 1.0 + Math.random() * 0.6;
        data.start[i] = t;
      }
      controller.current = req;
      controller.requestMorph = null;
    }

    // Drop expired ripples.
    if (controller.ripples.length > 0) {
      controller.ripples = controller.ripples.filter(
        (rp) => t - rp.start <= 2.6
      );
    }

    const { m, p, q, s } = tmp;
    const ripples = controller.ripples;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const e = Math.min(
        1,
        Math.max(0, (t - data.start[i] - data.delay[i]) / data.dur[i])
      );
      const k = easeInOutCubic(e);
      const melt = Math.sin(Math.PI * k); // 0 → 1 → 0, the "melting" arc
      let x =
        data.from[i3] + (data.to[i3] - data.from[i3]) * k + data.scat[i3] * melt;
      let y =
        data.from[i3 + 1] +
        (data.to[i3 + 1] - data.from[i3 + 1]) * k +
        data.scat[i3 + 1] * melt;
      let z =
        data.from[i3 + 2] +
        (data.to[i3 + 2] - data.from[i3 + 2]) * k +
        data.scat[i3 + 2] * melt;

      // Gentle idle float so the sculpture always feels alive.
      x += Math.sin(t * data.speed[i] + data.phase[i]) * 0.035;
      y += Math.cos(t * data.speed[i] * 0.8 + data.phase[i]) * 0.035;

      // Click ripples — "one touch, wider waves".
      for (let ri = 0; ri < ripples.length; ri++) {
        const rp = ripples[ri];
        const age = t - rp.start;
        if (age < 0 || age > 2.6) continue;
        const dx = x - rp.x;
        const dy = y - rp.y;
        const dz = z - rp.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-4;
        const wave =
          Math.sin(d * 5.0 - age * 9.0) *
          0.22 *
          Math.exp(-d * 0.55) *
          Math.exp(-age * 1.6);
        x += (dx / d) * wave;
        y += (dy / d) * wave;
        z += (dz / d) * wave * 0.6;
      }

      data.cur[i3] = x;
      data.cur[i3 + 1] = y;
      data.cur[i3 + 2] = z;
      p.set(x, y, z);
      s.setScalar(data.scale[i]);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Slow cinematic drift + mouse parallax.
    const g = groupRef.current;
    spin.current += 0.0009;
    g.rotation.y = spin.current + mouse.current.x * 0.14;
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      mouse.current.y * 0.1,
      0.04
    );
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geom, mat, count]}
        frustumCulled={false}
      />
    </group>
  );
}
