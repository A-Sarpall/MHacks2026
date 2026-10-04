import { describe, expect, it } from "vitest";
import { DEFAULT_ENHANCE, applyLut, averageEmbeddings, edgeColor, levelsLut, lumaStats, squareBox } from "./enhance";
import { addNoise } from "./degrade";

const flat = (n: number, v: number) => {
  const d = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  return d;
};

const ramp = (n: number, lo: number, hi: number) => {
  const d = new Uint8ClampedArray(n * 4);
  for (let k = 0; k < n; k++) {
    const v = Math.round(lo + ((hi - lo) * k) / (n - 1));
    d[k * 4] = d[k * 4 + 1] = d[k * 4 + 2] = v;
    d[k * 4 + 3] = 255;
  }
  return d;
};

describe("crop enhancement", () => {
  it("measures luma mean and percentiles", () => {
    const s = lumaStats(ramp(1000, 0, 255));
    expect(s.mean).toBeCloseTo(127.5, 0);
    expect(s.low).toBeLessThanOrEqual(3);
    expect(s.high).toBeGreaterThanOrEqual(252);
  });

  it("leaves a well-exposed crop alone", () => {
    expect(levelsLut(lumaStats(ramp(1000, 20, 235)))).toBeNull();
  });

  it("brightens a dark crop without clipping the top", () => {
    const lut = levelsLut({ mean: 40, low: 5, high: 110 })!;
    expect(lut).not.toBeNull();
    expect(lut[40]).toBeGreaterThan(40);
    expect(lut[110]).toBe(255);
    expect(lut[255]).toBe(255);
    expect(lut[5]).toBe(0);
    for (let v = 1; v < 256; v++) expect(lut[v]).toBeGreaterThanOrEqual(lut[v - 1]);
  });

  it("stretches a flat, low-contrast crop", () => {
    const lut = levelsLut({ mean: 128, low: 100, high: 150 })!;
    expect(lut[100]).toBe(0);
    expect(lut[150]).toBe(255);
    expect(lut[125]).toBeCloseTo(128, -1);
  });

  it("caps the gamma so very dark crops don't turn to noise", () => {
    const lut = levelsLut({ mean: 10, low: 0, high: 40 })!;
    const mid = lut[20];
    expect(mid).toBeCloseTo(255 * Math.pow(0.5, DEFAULT_ENHANCE.maxGamma), -1);
  });

  it("applies a lookup table to colour channels only", () => {
    const d = flat(4, 50);
    const lut = new Uint8ClampedArray(256).map((_, v) => Math.min(255, v * 2));
    applyLut(d, lut);
    expect(Array.from(d.slice(0, 4))).toEqual([100, 100, 100, 255]);
  });

  it("pads to a centred square", () => {
    expect(squareBox(100, 40)).toEqual({ size: 100, x: 0, y: 30 });
    expect(squareBox(40, 100)).toEqual({ size: 100, x: 30, y: 0 });
    expect(squareBox(50, 50)).toEqual({ size: 50, x: 0, y: 0 });
  });

  it("uses the average border colour as padding", () => {
    const d = flat(9, 0);
    for (const k of [0, 1, 2, 3, 5, 6, 7, 8]) d[k * 4] = 200;
    d[4 * 4] = d[4 * 4 + 1] = d[4 * 4 + 2] = 255;
    expect(edgeColor(d, 3, 3)).toBe("rgb(200, 0, 0)");
  });

  it("adds zero-mean noise deterministically", () => {
    const a = flat(20000, 128);
    const b = flat(20000, 128);
    addNoise(a, 20, 7);
    addNoise(b, 20, 7);
    expect(Array.from(a.slice(0, 40))).toEqual(Array.from(b.slice(0, 40)));
    const s = lumaStats(a);
    expect(s.mean).toBeCloseTo(128, -1);
    expect(s.high - s.low).toBeGreaterThan(60);
  });

  it("averages embeddings back onto the unit sphere", () => {
    const v = averageEmbeddings([new Float32Array([1, 0]), new Float32Array([0, 1])]);
    expect(v[0]).toBeCloseTo(Math.SQRT1_2);
    expect(v[1]).toBeCloseTo(Math.SQRT1_2);
    const same = averageEmbeddings([new Float32Array([0, 1]), new Float32Array([0, 1])]);
    expect(Array.from(same)).toEqual([0, 1]);
  });
});
