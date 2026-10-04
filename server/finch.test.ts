import { afterEach, describe, expect, it, vi } from "vitest";
import { currentSubject, loadProfile, setSubject } from "./finch.ts";

afterEach(() => {
  vi.unstubAllGlobals();
  setSubject("patient-demo-polypharmacy");
});

describe("patient switching", () => {
  it("rejects malformed ids and keeps the current patient", () => {
    expect(() => setSubject("../admin")).toThrow();
    expect(currentSubject()).toBe("patient-demo-polypharmacy");
  });
  it("falls back to the bundled record only for the patient it belongs to", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect((await loadProfile()).name).toBe("Harriet Lindqvist");
    setSubject("patient-demo-pediatric-asthma");
    await expect(loadProfile()).rejects.toThrow("offline");
  });
});
