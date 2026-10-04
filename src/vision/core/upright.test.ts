import { describe, expect, it } from "vitest";
import { detectionEvidence, pickUpright, rotatePoint, rotatedSize } from "./upright";

describe("upright frame selection", () => {
  it("rotates points with the frame, and four quarter-turns return to the start", () => {
    const w = 640;
    const h = 480;
    const p = { x: 100, y: 50 };
    expect(rotatePoint(p, w, h, 1)).toEqual({ x: 430, y: 100 });
    expect(rotatePoint(p, w, h, 2)).toEqual({ x: 540, y: 430 });
    expect(rotatePoint(p, w, h, 3)).toEqual({ x: 50, y: 540 });
    let q = p;
    let size = { w, h };
    for (let i = 0; i < 4; i++) {
      q = rotatePoint(q, size.w, size.h, 1);
      size = rotatedSize(size.w, size.h, 1);
    }
    expect(q).toEqual(p);
    expect(size).toEqual({ w, h });
  });

  it("swaps the frame size on odd turns", () => {
    expect(rotatedSize(640, 480, 1)).toEqual({ w: 480, h: 640 });
    expect(rotatedSize(640, 480, 2)).toEqual({ w: 640, h: 480 });
  });

  it("weighs confident detections more than many weak ones", () => {
    expect(detectionEvidence([0.9])).toBeGreaterThan(detectionEvidence([0.4, 0.4, 0.4]));
    expect(detectionEvidence([])).toBe(0);
  });

  it("keeps the frame as-is unless another turn is clearly better", () => {
    expect(pickUpright([1.2, 0.3, 0.1, 0.2])).toBe(0);
    expect(pickUpright([0.1, 0.2, 1.4, 0.3])).toBe(2);
    expect(pickUpright([0.9, 1.0, 0.2, 0.1])).toBe(0);
    expect(pickUpright([0.0, 0.4, 0.1, 0.1])).toBe(0);
    expect(pickUpright([0.0, 0.0, 0.0, 0.0])).toBe(0);
    expect(pickUpright([])).toBe(0);
  });
});
