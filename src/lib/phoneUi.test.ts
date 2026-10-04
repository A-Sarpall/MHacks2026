import { describe, expect, it } from "vitest";
import { detectedMessage } from "./phoneUi";

const opt = (label: string, score: number, thumb = `data:${label}`) => ({ label, score, capture: { thumbnail: thumb } });

describe("detectedMessage", () => {
  it("names a confident result after its most likely option", () => {
    const m = detectedMessage("named", [opt("water bottle", 0.812345), opt("bottle", 0.1)]);
    expect(m).toMatchObject({ type: "detected", status: "named", label: "water bottle" });
    expect(m.options).toEqual([
      { label: "water bottle", score: 0.81, thumbnail: "data:water bottle" },
      { label: "bottle", score: 0.1, thumbnail: "data:bottle" },
    ]);
  });
  it("asks which one when unsure, without picking a label", () => {
    const m = detectedMessage("unsure", [opt("mug", 0.3), opt("cup", 0.28)]);
    expect(m.status).toBe("unsure");
    expect(m.label).toBeNull();
    expect(m.options.map((o) => o.label)).toEqual(["mug", "cup"]);
  });
  it("keeps at most four options, unique by name, in order", () => {
    const m = detectedMessage("unsure", [opt("a", 0.5), opt("A ", 0.4), opt("b", 0.3), opt("c", 0.2), opt("d", 0.1), opt("e", 0.05)]);
    expect(m.options.map((o) => o.label)).toEqual(["a", "b", "c", "d"]);
  });
  it("reports nothing found, with a hint", () => {
    expect(detectedMessage("none", [], "Move closer")).toMatchObject({ status: "none", label: null, options: [], hint: "Move closer" });
  });
  it("turns a result with no usable options into nothing found", () => {
    expect(detectedMessage("named", [opt("  ", 0.9)]).status).toBe("none");
  });
});
