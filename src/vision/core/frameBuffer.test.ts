import { describe, expect, it } from "vitest";
import { FrameBuffer, SpeedMeter } from "./frameBuffer";

class Fake {
  closed = false;
  name: string;
  sharp: number;
  constructor(name: string, sharp: number) {
    this.name = name;
    this.sharp = sharp;
  }
  close() {
    this.closed = true;
  }
}

const buffer = (cap = 10) => new FrameBuffer<Fake>(cap, (f) => f.sharp);

describe("frame buffer", () => {
  it("keeps the last N frames and closes the ones it drops", () => {
    const b = buffer(3);
    const frames = [0, 1, 2, 3, 4].map((i) => new Fake(`f${i}`, 1));
    frames.forEach((f, i) => b.push(f, i * 33));
    expect(b.size()).toBe(3);
    expect(frames.map((f) => f.closed)).toEqual([true, true, false, false, false]);
    b.clear();
    expect(frames.every((f) => f.closed)).toBe(true);
  });

  it("picks the sharpest frame from before the press, ignoring the last 50 ms", () => {
    const b = buffer();
    b.push(new Fake("old-blurry", 5), 0);
    b.push(new Fake("sharp", 50), 33);
    b.push(new Fake("ok", 30), 66);
    b.push(new Fake("press-shake-but-sharp", 99), 99);
    const sel = b.select(120);
    expect(sel?.frame.image.name).toBe("sharp");
    expect(sel?.candidates).toBe(3);
    expect(sel?.ageMs).toBe(87);
  });

  it("penalises frames where the target was moving", () => {
    const b = buffer();
    b.push(new Fake("sharp-moving", 50), 0, 0.5);
    b.push(new Fake("slightly-softer-still", 45), 33, 0);
    expect(b.select(200)?.frame.image.name).toBe("slightly-softer-still");
  });

  it("falls back to the oldest frame when every frame is inside the skip window", () => {
    const b = buffer();
    b.push(new Fake("a", 1), 100);
    b.push(new Fake("b", 9), 120);
    expect(b.select(130)?.frame.image.name).toBe("a");
  });

  it("returns nothing for an empty buffer", () => {
    expect(buffer().select(100)).toBeNull();
  });
});

describe("speed meter", () => {
  it("measures how fast the same target moves, in frame diagonals per second", () => {
    const m = new SpeedMeter();
    m.update(1, { x: 0, y: 0 }, 0, 100);
    expect(m.update(1, { x: 10, y: 0 }, 100, 100)).toBeCloseTo(1);
  });

  it("decays instead of jumping when the target changes", () => {
    const m = new SpeedMeter();
    m.update(1, { x: 0, y: 0 }, 0, 100);
    m.update(1, { x: 10, y: 0 }, 100, 100);
    expect(m.update(2, { x: 90, y: 0 }, 200, 100)).toBeCloseTo(0.5);
  });
});
