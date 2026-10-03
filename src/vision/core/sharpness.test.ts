import { describe, expect, it } from "vitest";
import { laplacianVariance, rankFrames } from "./sharpness";

function checkerboard(w: number, h: number, cell: number): Float32Array {
  const g = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g[y * w + x] = (Math.floor(x / cell) + Math.floor(y / cell)) % 2 ? 255 : 0;
  return g;
}

function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      let n = 0;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const xx = Math.min(w - 1, Math.max(0, x + dx));
          const yy = Math.min(h - 1, Math.max(0, y + dy));
          s += src[yy * w + xx];
          n++;
        }
      }
      out[y * w + x] = s / n;
    }
  }
  return out;
}

describe("sharpness", () => {
  it("scores a sharp image above blurred copies, and more blur lower", () => {
    const w = 64;
    const h = 48;
    const sharp = checkerboard(w, h, 4);
    const s0 = laplacianVariance(sharp, w, h);
    const s1 = laplacianVariance(boxBlur(sharp, w, h, 1), w, h);
    const s2 = laplacianVariance(boxBlur(sharp, w, h, 3), w, h);
    expect(s0).toBeGreaterThan(s1);
    expect(s1).toBeGreaterThan(s2);
  });

  it("gives a flat image zero", () => {
    expect(laplacianVariance(new Float32Array(100).fill(128), 10, 10)).toBe(0);
  });

  it("ranks by sharpness minus weighted motion", () => {
    const ranked = rankFrames(
      [
        { item: "blurry", sharpness: 10, motion: 0 },
        { item: "sharp-moving", sharpness: 100, motion: 0.8 },
        { item: "sharp-still", sharpness: 90, motion: 0 },
      ],
      1
    );
    expect(ranked.map((r) => r.item)).toEqual(["sharp-still", "sharp-moving", "blurry"]);
  });
});
