import { describe, expect, it } from "vitest";
import { orderVerbs } from "./verbHistory";

describe("verb order", () => {
  it("keeps the profile order until the user has picked something", () => {
    expect(orderVerbs("need", ["want", "need", "would like", "will drink"], {})).toEqual(["want", "need", "would like", "will drink"]);
  });

  it("moves often-picked verbs first and keeps ties in profile order", () => {
    const counts = { "need:would like": 3, "need:need": 1, "dont-want:need": 9 };
    expect(orderVerbs("need", ["want", "need", "would like", "will drink"], counts)).toEqual(["would like", "need", "want", "will drink"]);
  });
});
