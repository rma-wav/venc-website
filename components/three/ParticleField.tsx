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
  theme: "dark" | "light";
}

/**
 * ~15k metallic beads that melt & reform between letter/shape targets.
 * All motion is computed on the CPU into an InstancedMesh.
 */
export default function ParticleField({ controller, count, theme }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const shadowRef = useRef<THREE.InstancedMesh>(null!);
  const glossRef = useRef<THREE.InstancedMesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  const geom = useMemo(() => new THREE.IcosahedronGeometry(0.024, 1), []);
  // Chrome metallic black beads. In light mode the env reflection is
  // dimmed so the beads stay dark against the light background.
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0b0b0d",
        metalness: 1.0,
        roughness: 0.2,
        envMapIntensity: theme === "light" ? 0.35 : 1.35,
      }),
    [theme]
  );

  // Thin white "flow shadow": a faint ghost of each bead trailing along its
  // velocity, so the black-chrome beads stay readable on the black background.
  const shadowGeom = useMemo(() => new THREE.IcosahedronGeometry(0.024, 0), []);
  const shadowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.13,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  // Glossy highlight: a tight white sheen sitting right on each bead,
  // like a specular dot on polished chrome.
  const glossGeom = useMemo(() => new THREE.IcosahedronGeometry(0.024, 0), []);
  const glossMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
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
      m2: new THREE.Matrix4(),
      p2: new THREE.Vector3(),
      s2: new THREE.Vector3(),
      m3: new THREE.Matrix4(),
      p3: new THREE.Vector3(),
      s3: new THREE.Vector3(),
    }),
    []
  );

  const spin = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });
  const seeded = useRef(false);

  // Tri-chrome beads: black, silver, white. In light mode the palette
  // shifts darker so every bead stays readable on the light background.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const c = new THREE.Color();
    const palette =
      theme === "light"
        ? ["#0b0b0d", "#7d838c", "#a9adb4"]
        : ["#0b0b0d", "#9aa0a8", "#f2f3f5"];
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      const pick = r < 0.6 ? palette[0] : r < 0.82 ? palette[1] : palette[2];
      const v = 0.88 + Math.random() * 0.12;
      c.set(pick).multiplyScalar(v);
      mesh.setColorAt(i, c);
      data.phase[i] = Math.random() * Math.PI * 2;
      data.speed[i] = 0.5 + Math.random() * 1.1;
      data.scale[i] = 0.7 + Math.random() * 0.65;
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, data, theme]);

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
    const shadow = shadowRef.current;
    const gloss = glossRef.current;
    if (!mesh || !shadow || !gloss) return;

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

    const { m, p, q, s, m2, p2, s2, m3, p3, s3 } = tmp;
    const ripples = controller.ripples;
    const TRAIL = 5.0; // how far the white shadow lags behind each bead

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

      // White flow shadow: trail a thin ghost behind each bead along its
      // per-frame velocity, so it flows with the particle current.
      const vx = x - data.cur[i3];
      const vy = y - data.cur[i3 + 1];
      const vz = z - data.cur[i3 + 2];
      p2.set(x - vx * TRAIL, y - vy * TRAIL, z - vz * TRAIL);
      s2.setScalar(data.scale[i] * 0.78);
      m2.compose(p2, q, s2);
      shadow.setMatrixAt(i, m2);

      // Glossy highlight: a tight white sheen sitting right on each bead.
      p3.set(x, y, z);
      s3.setScalar(data.scale[i] * 0.52);
      m3.compose(p3, q, s3);
      gloss.setMatrixAt(i, m3);

      data.cur[i3] = x;
      data.cur[i3 + 1] = y;
      data.cur[i3 + 2] = z;
      p.set(x, y, z);
      s.setScalar(data.scale[i]);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    shadow.instanceMatrix.needsUpdate = true;
    gloss.instanceMatrix.needsUpdate = true;

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
        ref={shadowRef}
        args={[shadowGeom, shadowMat, count]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={glossRef}
        args={[glossGeom, glossMat, count]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={meshRef}
        args={[geom, mat, count]}
        frustumCulled={false}
      />
    </group>
  );
}
