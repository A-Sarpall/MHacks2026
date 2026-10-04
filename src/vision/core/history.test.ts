import { describe, expect, it } from "vitest";
import { DEFAULT_BOOST, boostFrom, labelWeights, summarize, timeOfDay, toHistorySource, type HistoryEntry } from "./history";

const DAY = 24 * 60 * 60 * 1000;
const at = (h: number, daysAgo = 0) => new Date(2026, 9, 3, h).getTime() - daysAgo * DAY;
const entry = (label: string, t: number, source: HistoryEntry["source"] = "vocab"): HistoryEntry => ({
  id: `${label}-${t}`,
  label,
  source,
  at: t,
  timeOfDay: timeOfDay(t),
});

describe("selection history", () => {
  it("buckets the time of day", () => {
    expect(timeOfDay(at(8))).toBe("morning");
    expect(timeOfDay(at(13))).toBe("afternoon");
    expect(timeOfDay(at(19))).toBe("evening");
    expect(timeOfDay(at(23))).toBe("night");
    expect(timeOfDay(at(3))).toBe("night");
  });

  it("maps naming sources to history sources", () => {
    expect(toHistorySource("personal")).toBe("personal");
    expect(toHistorySource("vocab")).toBe("vocab");
    expect(toHistorySource("claude")).toBe("fallback");
    expect(toHistorySource("classifier")).toBe("fallback");
    expect(toHistorySource("manual")).toBe("manual");
  });

  it("weights recent picks and picks at the same time of day more", () => {
    const now = at(9);
    const w = labelWeights([entry("cup", at(9, 0)), entry("pills", at(9, 28)), entry("tv", at(20, 0))], now);
    expect(w.get("cup")).toBeCloseTo(DEFAULT_BOOST.sameTimeWeight);
    expect(w.get("pills")).toBeCloseTo(DEFAULT_BOOST.sameTimeWeight * 0.25);
    expect(w.get("tv")).toBeCloseTo(1);
  });

  it("gives a small boost that grows with use but never passes the maximum", () => {
    const now = at(9);
    const many = Array.from({ length: 50 }, (_, i) => entry("cup", at(9, i * 0.01)));
    const boost = boostFrom([...many, entry("tv", at(20))], now);
    expect(boost("unknown")).toBe(0);
    expect(boost("tv")).toBeGreaterThan(0);
    expect(boost("cup")).toBeGreaterThan(boost("tv"));
    expect(boost("cup")).toBeLessThanOrEqual(DEFAULT_BOOST.maxBoost);
  });

  it("summarises labels by count, source and time of day", () => {
    const s = summarize([entry("cup", at(8)), entry("cup", at(19), "personal"), entry("tv", at(20))]);
    expect(s[0]).toMatchObject({
      label: "cup",
      count: 2,
      lastAt: at(19),
      sources: { vocab: 1, personal: 1 },
      byTimeOfDay: { morning: 1, evening: 1 },
    });
    expect(s[1].label).toBe("tv");
  });
});
