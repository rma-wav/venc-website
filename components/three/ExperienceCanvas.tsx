"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import ParticleField from "./ParticleField";
import type { MorphController, SceneName } from "@/lib/controller";
import {
  sampleText,
  shapeNeural,
  shapeBars,
  shapeTrend,
  shapeHourglass,
  shapeRings,
  shapeScatter,
} from "@/lib/targets";

/** Procedural studio environment so chrome beads reflect something. */
function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    return () => {
      scene.environment = null;
      tex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** Pull the camera back on narrow screens so wide shapes still fit. */
function FitCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const pc = camera as THREE.PerspectiveCamera;
    pc.position.z = aspect < 0.75 ? 12 : aspect < 1.1 ? 9.2 : 7.6;
    pc.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

/** Any click/tap anywhere sends a ripple through the beads. */
function PointerRipples({ controller }: { controller: MorphController }) {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3();
    const onDown = (e: PointerEvent) => {
      ndc.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        controller.addRipple(hit.x, hit.y, 0);
      }
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [camera, controller]);
  return null;
}

/** Build all morph targets once fonts are ready, then signal readiness. */
function Boot({
  controller,
  count,
  onReady,
}: {
  controller: MorphController;
  count: number;
  onReady: () => void;
}) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.race([
          document.fonts.load('700 100px "Space Grotesk"'),
          new Promise((r) => setTimeout(r, 2500)),
        ]);
      } catch {
        /* fall back to system font sampling */
      }
      if (cancelled) return;
      const map = new Map<SceneName, Float32Array>();
      map.set("V", sampleText("V", count, { targetHeight: 3.4 }));
      map.set("E", sampleText("E", count, { targetHeight: 3.4 }));
      map.set("N", sampleText("N", count, { targetHeight: 3.4 }));
      map.set("C", sampleText("C", count, { targetHeight: 3.4 }));
      map.set(
        "VENC",
        sampleText("VENC", count, { targetHeight: 2.4, maxWidth: 4.2 })
      );
      map.set("rings", shapeRings(count));
      map.set("neural", shapeNeural(count));
      map.set("bars", shapeBars(count));
      map.set("trend", shapeTrend(count));
      map.set("hourglass", shapeHourglass(count));
      map.set("scatter", shapeScatter(count));
      controller.setTargets(map);
      onReady();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

interface Props {
  controller: MorphController;
  count: number;
  onReady: () => void;
}

export default function ExperienceCanvas({ controller, count, onReady }: Props) {
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 7.6], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 6, 8]} intensity={1.4} />
        <directionalLight position={[-6, -3, 4]} intensity={0.45} color="#dfe6ff" />
        <Env />
        <FitCamera />
        <Boot controller={controller} count={count} onReady={onReady} />
        <ParticleField controller={controller} count={count} />
        <PointerRipples controller={controller} />
      </Canvas>
      {/* Cinematic vignette + top/bottom readability gradients */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
        }}
      />
    </div>
  );
}
