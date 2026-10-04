import { describe, expect, it } from "vitest";
import { commandFor, RING_HINTS, RING_MAPPINGS } from "./mappings";

describe("double-press = Yes!", () => {
  it("normal mode double maps to yes, not backchannel", () => {
    expect(commandFor("normal", "double")).toBe("yes");
    expect(RING_MAPPINGS.normal.double).toBe("yes");
  });

  it("message mode double still maps to tapback", () => {
    expect(commandFor("message", "double")).toBe("tapback");
  });

  it("hint text for normal mode says Yes!", () => {
    expect(RING_HINTS.normal).toContain("Yes!");
    expect(RING_HINTS.normal).not.toContain("quick reply");
  });
});
