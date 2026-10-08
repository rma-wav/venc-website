import * as THREE from "three";

/**
 * Point-cloud target generators.
 * Every generator returns EXACTLY `count` points as a Float32Array,
 * so the particle engine can lerp 1:1 between any two shapes.
 */

type Pt = [number, number, number];

function toFixedCount(pts: Pt[], count: number, spread = 0.05): Float32Array {
  const out = new Float32Array(count * 3);
  if (pts.length === 0) {
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      v.randomDirection().multiplyScalar(2.2 * Math.cbrt(Math.random()));
      out[i * 3] = v.x;
      out[i * 3 + 1] = v.y;
      out[i * 3 + 2] = v.z;
    }
    return out;
  }
  if (pts.length >= count) {
    const step = pts.length / count;
    for (let i = 0; i < count; i++) {
      const p = pts[Math.floor(i * step) % pts.length];
      out[i * 3] = p[0];
      out[i * 3 + 1] = p[1];
      out[i * 3 + 2] = p[2];
    }
  } else {
    for (let i = 0; i < count; i++) {
      const p = pts[(Math.random() * pts.length) | 0];
      out[i * 3] = p[0] + (Math.random() - 0.5) * spread;
      out[i * 3 + 1] = p[1] + (Math.random() - 0.5) * spread;
      out[i * 3 + 2] = p[2] + (Math.random() - 0.5) * spread;
    }
  }
  return out;
}

export interface TextOpts {
  targetHeight?: number;
  maxWidth?: number;
  weight?: number;
  family?: string;
}

/** Sample a text glyph into a centered point cloud. */
export function sampleText(text: string, count: number, opts: TextOpts = {}): Float32Array {
  const {
    targetHeight = 3.2,
    maxWidth,
    weight = 700,
    family = '"Space Grotesk", Arial, sans-serif',
  } = opts;
  const size = 320;
  const pad = 60;
  const cv = document.createElement("canvas");
  let cx = cv.getContext("2d", { willReadFrequently: true })!;
  const font = `${weight} ${size}px ${family}`;
  cx.font = font;
  const w = Math.ceil(cx.measureText(text).width) + pad * 2;
  const h = size + pad * 2;
  cv.width = w;
  cv.height = h;
  cx = cv.getContext("2d", { willReadFrequently: true })!;
  cx.font = font;
  cx.textBaseline = "middle";
  cx.textAlign = "center";
  cx.fillStyle = "#ffffff";
  cx.fillText(text, w / 2, h / 2);

  const data = cx.getImageData(0, 0, w, h).data;
  const pts: Pt[] = [];
  const step = 3;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 128) {
        pts.push([x, y, (Math.random() - 0.5) * 0.16]);
      }
    }
  }
  if (pts.length === 0) return toFixedCount([], count);

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of pts) {
    if (p[0] < minX) minX = p[0];
    if (p[0] > maxX) maxX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[1] > maxY) maxY = p[1];
  }
  let scale = targetHeight / Math.max(1, maxY - minY);
  if (maxWidth !== undefined) {
    const wScale = maxWidth / Math.max(1, (maxX - minX) * scale);
    if (wScale < 1) scale *= wScale;
  }
  const cx0 = (minX + maxX) / 2;
  const cy0 = (minY + maxY) / 2;
  const norm: Pt[] = pts.map(([x, y, z]) => [
    (x - cx0) * scale,
    -(y - cy0) * scale,
    z,
  ]);
  return toFixedCount(norm, count);
}

/** Neural-network-ish node graph (AI). */
export function shapeNeural(count: number): Float32Array {
  const pts: Pt[] = [];
  const layers = [4, 6, 6, 4];
  const xs = [-2.7, -0.9, 0.9, 2.7];
  const layerNodes: Pt[][] = [];
  layers.forEach((n, li) => {
    const nodes: Pt[] = [];
    for (let k = 0; k < n; k++) {
      const y = (k - (n - 1) / 2) * 0.92;
      nodes.push([xs[li], y, 0]);
      for (let s = 0; s < 34; s++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 0.17;
        pts.push([
          xs[li] + Math.cos(a) * r,
          y + Math.sin(a) * r,
          (Math.random() - 0.5) * 0.12,
        ]);
      }
    }
    layerNodes.push(nodes);
  });
  const edges: Array<[Pt, Pt]> = [];
  for (let li = 0; li < layers.length - 1; li++) {
    for (const a of layerNodes[li]) {
      for (const b of layerNodes[li + 1]) edges.push([a, b]);
    }
  }
  const edgeBudget = Math.max(0, count - pts.length);
  const per = Math.max(1, Math.floor(edgeBudget / edges.length));
  for (const [a, b] of edges) {
    for (let s = 0; s < per; s++) {
      const t = Math.random();
      pts.push([
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        (Math.random() - 0.5) * 0.08,
      ]);
    }
  }
  return toFixedCount(pts, count, 0.03);
}

/** Ascending bar chart (Data). */
export function shapeBars(count: number): Float32Array {
  const pts: Pt[] = [];
  const heights = [0.9, 1.5, 1.15, 2.0, 1.7, 2.5];
  const bw = 0.52;
  const gap = 0.22;
  const total = heights.length * (bw + gap);
  const per = Math.floor(count / heights.length);
  heights.forEach((hh, i) => {
    const x0 = -total / 2 + i * (bw + gap) + bw / 2;
    for (let s = 0; s < per; s++) {
      pts.push([
        x0 + (Math.random() - 0.5) * bw,
        -1.5 + Math.random() * hh,
        (Math.random() - 0.5) * 0.5,
      ]);
    }
  });
  return toFixedCount(pts, count, 0.03);
}

/** Rising staircase + trend line (Bisnis). */
export function shapeTrend(count: number): Float32Array {
  const pts: Pt[] = [];
  const n = 7;
  const bw = 0.42;
  const per = Math.floor(count * 0.72 / n);
  for (let i = 0; i < n; i++) {
    const x0 = -2.6 + i * (5.2 / (n - 1));
    const hh = 0.5 + (i / (n - 1)) * 2.3;
    for (let s = 0; s < per; s++) {
      pts.push([
        x0 + (Math.random() - 0.5) * bw,
        -1.6 + Math.random() * hh,
        (Math.random() - 0.5) * 0.4,
      ]);
    }
  }
  const lineBudget = count - pts.length;
  for (let s = 0; s < lineBudget; s++) {
    const t = Math.random();
    const x = -2.6 + t * 5.2;
    const y = -1.35 + t * 2.55 + (Math.random() - 0.5) * 0.22;
    pts.push([x, y, (Math.random() - 0.5) * 0.2]);
  }
  return toFixedCount(pts, count, 0.03);
}

/** Hourglass (Produktivitas). */
export function shapeHourglass(count: number): Float32Array {
  const pts: Pt[] = [];
  const H = 1.6;
  const bodyBudget = Math.floor(count * 0.86);
  for (let s = 0; s < bodyBudget; s++) {
    const y = (Math.random() - 0.5) * 2 * H;
    const w = 1.35 * Math.pow(Math.abs(y) / H, 0.85) + 0.07;
    pts.push([
      (Math.random() - 0.5) * 2 * w,
      y,
      (Math.random() - 0.5) * 0.5 * (w / 1.4),
    ]);
  }
  const streamBudget = count - pts.length;
  for (let s = 0; s < streamBudget; s++) {
    pts.push([
      (Math.random() - 0.5) * 0.09,
      (Math.random() - 0.5) * 2 * H,
      (Math.random() - 0.5) * 0.09,
    ]);
  }
  return toFixedCount(pts, count, 0.03);
}

/** Concentric ripple rings — the "wider waves" motif. */
export function shapeRings(count: number): Float32Array {
  const pts: Pt[] = [];
  const radii = [0.55, 1.05, 1.55, 2.05, 2.55];
  const per = Math.floor(count / radii.length);
  radii.forEach((r) => {
    for (let s = 0; s < per; s++) {
      const a = Math.random() * Math.PI * 2;
      pts.push([
        Math.cos(a) * r,
        Math.sin(a) * r,
        Math.sin(a * 3 + r * 2) * 0.06,
      ]);
    }
  });
  return toFixedCount(pts, count, 0.03);
}

/** Scattered field — particles dispersing outward. */
export function shapeScatter(count: number): Float32Array {
  const pts: Pt[] = [];
  const v = new THREE.Vector3();
  for (let s = 0; s < count; s++) {
    v.randomDirection().multiplyScalar(0.6 + 2.3 * Math.cbrt(Math.random()));
    pts.push([v.x, v.y * 0.8, v.z * 0.5]);
  }
  return toFixedCount(pts, count, 0.02);
}
