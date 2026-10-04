import { describe, expect, it } from "vitest";
import { broadGuess, cropLadder, escalate, orderForPointing, tooSmall, type Rung } from "./escalate";
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
  const one = (scores: Partial<Record<Rung["kind"], number>>, perLabel: Record<string, number> = {}) => (r: Rung) =>
    r.candidate?.label && perLabel[r.candidate.label] !== undefined ? perLabel[r.candidate.label] : scores[r.kind] ?? 0;
  const namer =
    (scores: Partial<Record<Rung["kind"], number>>, perLabel: Record<string, number> = {}) =>
    async (rungs: Rung[]) =>
      rungs.map(one(scores, perLabel));
  const id = (n: number) => n;

  it("stops at the centre crop when it is confident", async () => {
    const calls: string[] = [];
    const r = await escalate(ladder, async (rungs) => rungs.map((rung) => (calls.push(rung.kind), one({ centre: 0.9 })(rung))), id, 0.35);
    expect(calls).toEqual(["centre"]);
    expect(r.low).toBe(false);
    expect(r.best.kind).toBe("centre");
  });

  it("widens only when the centre crop is unsure", async () => {
    const r = await escalate(ladder, namer({ centre: 0.2, wide: 0.5, box: 0.3 }), id, 0.35);
    expect(r.levelReached).toBe(1);
    expect(r.best.kind).toBe("wide");
    expect(r.attempts.map((a) => a.kind)).toEqual(["wide", "box", "centre"]);
  });

  it("names the other objects and reports low confidence when nothing is sure", async () => {
    const r = await escalate(ladder, namer({ centre: 0.1, wide: 0.1, box: 0.1 }, { person: 0.2, chair: 0.05 }), id, 0.35);
    expect(r.levelReached).toBe(2);
    expect(r.low).toBe(true);
    expect(r.attempts).toHaveLength(5);
  });

  it("starts wider on a retake", async () => {
    const calls: string[] = [];
    await escalate(ladder, async (rungs) => rungs.map((rung) => (calls.push(rung.kind), 0.9)), id, 0.35, 1);
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

describe("choice order", () => {
  it("puts the pointed-at crops first even when another object is named more confidently", async () => {
    const ladder = cropLadder(W, H, aim, scene);
    const scores: Record<string, number> = { centre: 0.25, box: 0.2, wide: 0.3, person: 0.9, chair: 0.6 };
    const r = await escalate(
      ladder,
      async (rungs) => rungs.map((rung) => scores[rung.candidate?.label === "apple" ? "box" : rung.candidate?.label ?? rung.kind]),
      (n) => n,
      0.35
    );
    const { pointed, ordered } = orderForPointing(r.attempts);
    expect(ordered.map((a) => a.candidate?.label ?? a.kind)).toEqual(["wide", "centre", "apple", "person", "chair"]);
    expect(pointed[0].score).toBeLessThan(0.35);
  });
});

describe("minimum score to show a guess", () => {
  it("hides near-random guesses but keeps confidently detected objects", async () => {
    const { worthShowing } = await import("./escalate");
    expect(worthShowing(0.07, "centre", undefined)).toBe(false);
    expect(worthShowing(0.2, "centre", undefined)).toBe(true);
    expect(worthShowing(0.05, "candidate", 0.7)).toBe(true);
    expect(worthShowing(0.05, "candidate", 0.3)).toBe(false);
  });
});

describe("wide crop penalty", () => {
  it("ranks the wide crop below the centre crop unless it is clearly more confident", async () => {
    const { pointingScore } = await import("./escalate");
    expect(pointingScore(0.3, "wide")).toBeLessThan(pointingScore(0.25, "centre"));
    expect(pointingScore(0.5, "wide")).toBeGreaterThan(pointingScore(0.25, "centre"));
  });
});

describe("broad guess when unsure", () => {
  const generics = { fruit: "fruit", drinks: "drink" };

  it("offers the category word when most of the probability is in one category", () => {
    const g = broadGuess(
      [
        { label: "banana", score: 0.3, category: "fruit" },
        { label: "corn", score: 0.2, category: "vegetables" },
        { label: "lemon", score: 0.15, category: "fruit" },
        { label: "pear", score: 0.1, category: "fruit" },
      ],
      generics,
      0.5
    );
    expect(g).toMatchObject({ label: "fruit", category: "fruit" });
    expect(g?.score).toBeCloseTo(0.55);
  });

  it("stays quiet when the guesses are spread out or the category has no broad word", () => {
    expect(broadGuess([{ label: "banana", score: 0.3, category: "fruit" }, { label: "cup", score: 0.3, category: "kitchen" }], generics, 0.5)).toBeNull();
    expect(broadGuess([{ label: "corn", score: 0.9, category: "vegetables" }], generics, 0.5)).toBeNull();
    expect(broadGuess([{ label: "corn", score: 0.9 }], generics, 0.5)).toBeNull();
  });
});
