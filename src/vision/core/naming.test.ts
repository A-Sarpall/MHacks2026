import { describe, expect, it } from "vitest";
import { decodeHalf, encodeHalf, fnv1a } from "./f16";
import { VocabIndex } from "./vocabIndex";
import { cleanGuesses, everydayLabel } from "./imagenetMap";
import { VOCABULARY } from "../../data/vocabulary";

describe("float16 storage", () => {
  it("round-trips embedding-sized values closely", () => {
    const v = new Float32Array([0, 0.0123, -0.0456, 0.25, -1, 0.999]);
    const back = decodeHalf(encodeHalf(v));
    v.forEach((x, i) => expect(back[i]).toBeCloseTo(x, 3));
  });

  it("hashes text stably", () => {
    expect(fnv1a("cue")).toBe(fnv1a("cue"));
    expect(fnv1a("cue")).not.toBe(fnv1a("cup"));
  });
});

describe("vocabulary scoring", () => {
  const rows = [
    { label: "cup", category: "kitchen" },
    { label: "fish", category: "animals" },
    { label: "fish", category: "food" },
    { label: "chair", category: "furniture" },
  ];
  const emb = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0.9, 0.436, 0, 0, 1]);
  const index = new VocabIndex(rows, emb, 3, 100);

  it("ranks by cosine, merges duplicate labels, and gives probabilities that sum to 1", () => {
    const top = index.top(new Float32Array([0, 0.8, 0.6]), 3);
    expect(top.map((t) => t.label)).toEqual(["fish", "chair", "cup"]);
    expect(top[0].category).toBe("food");
    expect(top.reduce((s, t) => s + t.prob, 0)).toBeCloseTo(1, 5);
  });

  it("applies a per-label boost", () => {
    const top = index.top(new Float32Array([0.7, 0, 0.714]), 1, (l) => (l === "cup" ? 0.1 : 0));
    expect(top[0].label).toBe("cup");
  });

  it("reorders with a boost without changing the probabilities", () => {
    const v = new Float32Array([0.7, 0, 0.714]);
    const plain = index.top(v, 4);
    const boosted = index.top(v, 4, (l) => (l === "cup" ? 0.1 : 0));
    expect(plain[0].label).toBe("chair");
    expect(boosted[0].label).toBe("cup");
    const prob = (list: typeof plain, l: string) => list.find((t) => t.label === l)?.prob;
    for (const l of ["cup", "chair", "fish"]) expect(prob(boosted, l)).toBeCloseTo(prob(plain, l)!, 9);
  });

  it("rejects embeddings that don't match the labels", () => {
    expect(() => new VocabIndex(rows, new Float32Array(5), 3, 100)).toThrow();
  });
});

describe("fallback classifier cleanup", () => {
  it("drops places and maps over-specific labels to everyday words", () => {
    expect(everydayLabel("restaurant")).toBeNull();
    expect(everydayLabel("tabby")).toBe("cat");
    expect(everydayLabel("golden retriever")).toBe("dog");
    expect(everydayLabel("notebook")).toBe("laptop");
    expect(everydayLabel("envelope")).toBe("envelope");
  });

  it("merges guesses that map to the same word", () => {
    const out = cleanGuesses([
      { label: "restaurant", score: 0.4 },
      { label: "tabby", score: 0.3 },
      { label: "tiger cat", score: 0.2 },
      { label: "quilt", score: 0.1 },
    ]);
    expect(out.map((g) => g.label)).toEqual(["cat", "blanket"]);
    expect(out[0].score).toBeCloseTo(0.5);
  });
});

describe("vocabulary", () => {
  it("has 400-800 entries and no place names", () => {
    expect(VOCABULARY.length).toBeGreaterThanOrEqual(400);
    expect(VOCABULARY.length).toBeLessThanOrEqual(800);
    expect(VOCABULARY.some((v) => v.label === "restaurant")).toBe(false);
  });

  it("includes the AAC items the datasets miss", () => {
    for (const l of ["pill organizer", "walker", "hearing aid", "phone charger", "glasses case"]) {
      expect(VOCABULARY.some((v) => v.label === l)).toBe(true);
    }
  });
});
