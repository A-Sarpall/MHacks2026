import { describe, expect, it } from "vitest";
import {
  OnTargetDetector,
  aimPoint,
  aimZone,
  offsetFromSamples,
  rankCandidates,
  type Detection,
} from "./aim";

const W = 640;
const H = 480;
const det = (id: number, label: string, x: number, y: number, w: number, h: number): Detection => ({
  id,
  label,
  score: 0.8,
  box: { x, y, w, h },
});

describe("aim zone", () => {
  it("is centred by default and covers a quarter of the frame", () => {
    const z = aimZone(W, H, { zoneFrac: 0.5, offset: { dx: 0, dy: 0 } });
    expect(z).toEqual({ x: 160, y: 120, w: 320, h: 240 });
  });

  it("moves with the calibration offset but stays inside the frame", () => {
    expect(aimPoint(W, H, { dx: 0.1, dy: -0.1 })).toEqual({ x: 384, y: 192 });
    const z = aimZone(W, H, { zoneFrac: 0.5, offset: { dx: 0.45, dy: 0 } });
    expect(z.x + z.w).toBe(W);
  });
});

describe("candidate ranking", () => {
  const aim = { x: 320, y: 240 };

  it("puts the smallest box under the aim point first (apple held in front of a person)", () => {
    const ranked = rankCandidates(
      [det(1, "person", 100, 0, 440, 480), det(2, "apple", 290, 210, 60, 60), det(3, "chair", 500, 300, 100, 150)],
      W,
      H,
      aim
    );
    expect(ranked.map((c) => c.label)).toEqual(["apple", "person", "chair"]);
  });

  it("orders boxes that miss the aim point by distance and keeps at most N", () => {
    const ranked = rankCandidates(
      [det(1, "far", 0, 0, 40, 40), det(2, "near", 330, 240, 40, 40), det(3, "mid", 450, 240, 40, 40), det(4, "x", 600, 440, 30, 30)],
      W,
      H,
      aim,
      { maxCandidates: 3, aimCropFrac: 0.4 }
    );
    expect(ranked.map((c) => c.label ?? c.kind)).toEqual(["near", "mid", "aim"]);
  });

  it("puts the aim-point crop first when every detection is far from the aim point", () => {
    const ranked = rankCandidates([det(1, "tv", 0, 0, 60, 60), det(2, "chair", 560, 400, 60, 60)], W, H, aim);
    expect(ranked.map((c) => c.label ?? c.kind)).toEqual(["aim", "chair", "tv"]);
  });

  it("falls back to a crop around the aim point when nothing is detected", () => {
    const ranked = rankCandidates([], W, H, aim);
    expect(ranked).toHaveLength(1);
    expect(ranked[0].kind).toBe("aim");
    expect(ranked[0].box).toEqual({ x: 224, y: 144, w: 192, h: 192 });
  });

  it("does not add the aim crop when a detection already covers the aim point", () => {
    const ranked = rankCandidates([det(1, "cup", 300, 220, 40, 40)], W, H, aim);
    expect(ranked.map((c) => c.kind)).toEqual(["detection"]);
  });
});

describe("on-target cue", () => {
  it("fires once after the target has been steady in the zone for the hold time", () => {
    const d = new OnTargetDetector(300, 0.25, 3);
    const t = { id: 7, hits: 5, inZone: true };
    expect(d.update(t, 0.1, 0).fired).toBe(false);
    expect(d.update(t, 0.1, 200).fired).toBe(false);
    expect(d.update(t, 0.1, 320)).toEqual({ onTarget: true, fired: true });
    expect(d.update(t, 0.1, 400)).toEqual({ onTarget: true, fired: false });
  });

  it("resets when the hand moves or the target leaves the zone", () => {
    const d = new OnTargetDetector(300, 0.25, 3);
    const t = { id: 7, hits: 5, inZone: true };
    d.update(t, 0.1, 0);
    d.update(t, 0.9, 200);
    expect(d.update(t, 0.1, 400).onTarget).toBe(false);
    expect(d.update(t, 0.1, 750).fired).toBe(true);
  });
});

describe("calibration", () => {
  it("averages where the target appeared and reports the spread", () => {
    const { offset, spread } = offsetFromSamples([
      { x: 384, y: 192, w: W, h: H },
      { x: 384, y: 192, w: W, h: H },
      { x: 384, y: 192, w: W, h: H },
    ]);
    expect(offset.dx).toBeCloseTo(0.1);
    expect(offset.dy).toBeCloseTo(-0.1);
    expect(spread).toBeCloseTo(0);
  });
});

describe("calibration marker", () => {
  it("finds the centroid of the magenta target", async () => {
    const { findMarkerInRgba } = await import("./marker");
    const w = 40;
    const h = 30;
    const px = new Uint8ClampedArray(w * h * 4).fill(90);
    for (let y = 18; y < 24; y++) for (let x = 28; x < 34; x++) px.set([255, 20, 230, 255], (y * w + x) * 4);
    const p = findMarkerInRgba(px, w, h);
    expect(p?.x).toBeCloseTo(31 / 40);
    expect(p?.y).toBeCloseTo(21 / 30);
  });

  it("returns nothing when no target is visible", async () => {
    const { findMarkerInRgba } = await import("./marker");
    expect(findMarkerInRgba(new Uint8ClampedArray(40 * 30 * 4).fill(120), 40, 30)).toBeNull();
  });
});
