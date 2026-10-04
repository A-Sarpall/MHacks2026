import { describe, expect, it } from "vitest";
import { rankCandidates } from "./aim";
import { DEFAULT_PERSONAL, matchPersonal, nearestPersonal, personalConfidence, teachBoxes, type PersonalEntry } from "./personalMatch";
import { normalize } from "./vocabIndex";

const CFG = { threshold: 0.85, margin: 0.02, minConfidence: 0.6 };

const vec = (...xs: number[]) => normalize(new Float32Array(xs));

const withCos = (c: number) => vec(c, Math.sqrt(1 - c * c), 0);

const mug: PersonalEntry = { id: "mug", name: "Mom's mug", embeddings: [vec(0, 0, 1), vec(1, 0, 0)] };
const keys: PersonalEntry = { id: "keys", name: "my keys", embeddings: [vec(0, 1, 0)] };

describe("personal objects", () => {
  it("scores each object by its closest photo", () => {
    const hits = nearestPersonal(withCos(0.9), [keys, mug]);
    expect(hits.map((h) => h.id)).toEqual(["mug", "keys"]);
    expect(hits[0].cos).toBeCloseTo(0.9);
    expect(hits[0].runnerUp).toBeCloseTo(Math.sqrt(1 - 0.81));
    expect(hits[1].runnerUp).toBe(-Infinity);
  });

  it("matches above the threshold", () => {
    expect(matchPersonal(withCos(0.9), [mug, keys], CFG)?.name).toBe("Mom's mug");
    expect(matchPersonal(withCos(0.8), [mug, keys], CFG)).toBeNull();
    expect(matchPersonal(withCos(0.9), [mug, keys])).toBeNull();
    expect(matchPersonal(withCos(0.95), [mug, keys])?.name).toBe("Mom's mug");
  });

  it("matches a single taught object without a runner-up", () => {
    expect(matchPersonal(vec(1, 0, 0), [mug])?.id).toBe("mug");
  });

  it("refuses when two taught objects look alike", () => {
    const cup: PersonalEntry = { id: "cup", name: "blue cup", embeddings: [vec(1, 0.01, 0)] };
    expect(matchPersonal(vec(1, 0.005, 0), [mug, cup], CFG)).toBeNull();
    expect(matchPersonal(vec(1, 0.005, 0), [mug, cup], { ...DEFAULT_PERSONAL, margin: 0 })).not.toBeNull();
  });

  it("ignores empty or mismatched embeddings", () => {
    const empty: PersonalEntry = { id: "e", name: "empty", embeddings: [] };
    const old: PersonalEntry = { id: "o", name: "old model", embeddings: [new Float32Array([1, 0])] };
    expect(nearestPersonal(vec(1, 0, 0), [empty, old])).toEqual([]);
    expect(matchPersonal(vec(1, 0, 0), [])).toBeNull();
  });

  it("maps a match to at least the minimum confidence", () => {
    const hit = (cos: number) => ({ id: "x", name: "x", cos, runnerUp: 0 });
    expect(personalConfidence(hit(0.85), CFG)).toBeCloseTo(0.6);
    expect(personalConfidence(hit(1), CFG)).toBeCloseTo(1);
    expect(personalConfidence(hit(0.925), CFG)).toBeCloseTo(0.8);
    expect(personalConfidence(hit(0.5), CFG)).toBeCloseTo(0.6);
    expect(personalConfidence(hit(DEFAULT_PERSONAL.threshold))).toBeCloseTo(DEFAULT_PERSONAL.minConfidence);
  });
});

describe("teaching crops", () => {
  const aim = { x: 320, y: 240 };
  const det = (id: number, label: string, x: number, y: number, w: number, h: number) => ({
    id,
    label,
    score: 0.8,
    box: { x, y, w, h },
  });

  it("uses the centre crop plus the smallest box under the aim point", () => {
    const scene = rankCandidates(
      [det(1, "person", 100, 0, 440, 480), det(2, "cup", 290, 210, 60, 60), det(3, "chair", 500, 300, 100, 150)],
      640,
      480,
      aim
    );
    expect(teachBoxes(640, 480, aim, scene)).toEqual([
      { x: 236, y: 156, w: 168, h: 168 },
      { x: 290, y: 210, w: 60, h: 60 },
    ]);
  });

  it("uses only the centre crop when nothing covers the aim point", () => {
    const scene = rankCandidates([det(3, "chair", 500, 300, 100, 150)], 640, 480, aim);
    expect(teachBoxes(640, 480, aim, scene)).toHaveLength(1);
    expect(teachBoxes(640, 480, aim)).toHaveLength(1);
  });
});
