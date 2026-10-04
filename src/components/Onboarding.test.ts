import { describe, expect, it, beforeEach, vi } from "vitest";

const LS_KEY = "qu.onboarding.done";

// Mock localStorage (Node has no DOM)
const store = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => store.set(k, v),
  removeItem: (k: string) => store.delete(k),
  clear: () => store.clear(),
});

function isOnboardingDone(): boolean {
  return localStorage.getItem(LS_KEY) === "1";
}

describe("onboarding completion state", () => {
  beforeEach(() => store.clear());

  it("is not done initially", () => {
    expect(isOnboardingDone()).toBe(false);
  });

  it("is done after setting the key", () => {
    localStorage.setItem(LS_KEY, "1");
    expect(isOnboardingDone()).toBe(true);
  });

  it("is not done with other values", () => {
    localStorage.setItem(LS_KEY, "0");
    expect(isOnboardingDone()).toBe(false);
  });
});
