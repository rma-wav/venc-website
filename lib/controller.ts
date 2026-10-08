/**
 * MorphController — the single source of truth for the particle scene.
 * DOM/scroll code talks to the 3D world only through this class.
 *
 * The site is a horizontal slide journey: each panel (100vw x 100vh) owns
 * one scene. Morphs are triggered ONLY when a panel becomes active —
 * nothing auto-plays.
 */

export type SceneName =
  | "V"
  | "E"
  | "N"
  | "C"
  | "VENC"
  | "rings"
  | "neural"
  | "bars"
  | "trend"
  | "hourglass"
  | "scatter";

export interface Ripple {
  x: number;
  y: number;
  z: number;
  start: number;
}

export class MorphController {
  targets = new Map<SceneName, Float32Array>();
  current: SceneName = "V";
  /** Pending morph request, consumed by ParticleField each frame. */
  requestMorph: SceneName | null = null;
  ripples: Ripple[] = [];
  /** Current clock time of the 3D scene (set by ParticleField). */
  now = 0;
  /** 0..1 progress across the whole horizontal journey (set by ScrollRig). */
  scrollProgress = 0;
  /** Index of the currently active panel (set by ScrollRig). */
  panelIndex = 0;

  setTargets(t: Map<SceneName, Float32Array>) {
    this.targets = t;
  }

  morphTo(name: SceneName) {
    if (name === this.current && this.requestMorph === null) return;
    this.requestMorph = name;
  }

  addRipple(x: number, y: number, z = 0) {
    this.ripples.push({ x, y, z, start: this.now });
    if (this.ripples.length > 6) this.ripples.shift();
  }
}
