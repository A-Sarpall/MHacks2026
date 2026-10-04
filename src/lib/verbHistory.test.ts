import { describe, expect, it } from "vitest";
import { mostUsedIndex } from "./verbHistory";

describe("verb pre-highlight", () => {
  const verbs = ["want", "need", "would like", "will drink"];

  it("starts on the first verb until the user has picked something", () => {
    expect(mostUsedIndex("need", verbs, {})).toBe(0);
  });

  it("pre-highlights the most used verb without changing the order", () => {
    const counts = { "need:would like": 3, "need:need": 1, "dont-want:need": 9 };
    expect(mostUsedIndex("need", verbs, counts)).toBe(2);
    expect(verbs).toEqual(["want", "need", "would like", "will drink"]);
  });
});
