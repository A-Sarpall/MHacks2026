import { describe, expect, it } from "vitest";
import { cropLadder, escalate, tooSmall, type Rung } from "./escalate";
import { rankCandidates, type Detection } from "./aim";

const W = 640;
const H = 480;
const aim = { x: 320, y: 240 };
const det = (id: number, label: string, x: number, y: number, w: number, h: number): Detection => ({
  id,
  label,
  score: 0.8,
  box: { x, y, w, h },
});

const scene = rankCandidates(
  [det(1, "person", 100, 0, 440, 480), det(2, "apple", 290, 210, 60, 60), det(3, "chair", 500, 300, 100, 150)],
  W,
  H,
  aim
);

describe("crop ladder", () => {
  it("starts with a centre crop, then widens, then the other objects", () => {
    const ladder = cropLadder(W, H, aim, scene);
    expect(ladder[0].map((r) => r.kind)).toEqual(["centre"]);
    expect(ladder[0][0].box).toEqual({ x: 236, y: 156, w: 168, h: 168 });
    expect(ladder[1].map((r) => r.kind)).toEqual(["box", "wide"]);
    expect(ladder[1][0].candidate?.label).toBe("apple");
    expect(ladder[2].map((r) => r.candidate?.label)).toEqual(["person", "chair"]);
  });
});

describe("escalation", () => {
  const ladder = cropLadder(W, H, aim, scene);
  const namer = (scores: Partial<Record<Rung["kind"], number>>, perLabel: Record<string, number> = {}) => (r: Rung) =>
    r.candidate?.label && perLabel[r.candidate.label] !== undefined ? perLabel[r.candidate.label] : scores[r.kind] ?? 0;
  const id = (n: number) => n;

  it("stops at the centre crop when it is confident", () => {
    const calls: string[] = [];
    const r = escalate(ladder, (rung) => (calls.push(rung.kind), namer({ centre: 0.9 })(rung)), id, 0.35);
    expect(calls).toEqual(["centre"]);
    expect(r.low).toBe(false);
    expect(r.best.kind).toBe("centre");
  });

  it("widens only when the centre crop is unsure", () => {
    const r = escalate(ladder, namer({ centre: 0.2, wide: 0.5, box: 0.3 }), id, 0.35);
    expect(r.levelReached).toBe(1);
    expect(r.best.kind).toBe("wide");
    expect(r.attempts.map((a) => a.kind)).toEqual(["wide", "box", "centre"]);
  });

  it("names the other objects and reports low confidence when nothing is sure", () => {
    const r = escalate(ladder, namer({ centre: 0.1, wide: 0.1, box: 0.1 }, { person: 0.2, chair: 0.05 }), id, 0.35);
    expect(r.levelReached).toBe(2);
    expect(r.low).toBe(true);
    expect(r.attempts).toHaveLength(5);
  });

  it("starts wider on a retake", () => {
    const calls: string[] = [];
    escalate(ladder, (rung) => (calls.push(rung.kind), 0.9), id, 0.35, 1);
    expect(calls).toEqual(["centre", "box", "wide"]);
  });
});

describe("move closer", () => {
  it("flags a tiny object under the aim point", () => {
    const tiny = rankCandidates([det(1, "ring", 310, 230, 20, 20)], W, H, aim);
    expect(tooSmall(tiny, W, H)).toBe(true);
    expect(tooSmall(scene, W, H)).toBe(false);
  });

  it("does not flag when nothing is detected at the aim point", () => {
    expect(tooSmall(rankCandidates([], W, H, aim), W, H)).toBe(false);
  });
});
