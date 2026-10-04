import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CareState } from "./care.ts";
import { toProfile, type RawRecord } from "./meds.ts";

const p = toProfile(JSON.parse(readFileSync(new URL("./fixtures/polypharmacy.json", import.meta.url), "utf8")) as RawRecord, "fixture", new Date("2026-10-03"));
const NOW = new Date("2026-10-03T15:00:00").getTime();

describe("CareState", () => {
  it("seeds only the as-needed pain medicine, 9 hours ago", () => {
    const c = new CareState();
    c.seedDemo(p, NOW);
    const prn = c.prnStatus(p.meds, NOW);
    expect(prn.map((x) => x.name)).toEqual(["Acetaminophen", "Trazodone"]);
    expect(prn[0]).toMatchObject({ reason: "knee pain", intervalHours: 8, hoursSince: 9 });
    expect(prn[1].lastTakenAt).toBeNull(); // sleep medicine is not a pain medicine: not seeded
  });
  it("records a dose and reports hours since", () => {
    const c = new CareState();
    c.recordDose("acetaminophen", NOW - 2 * 3_600_000);
    expect(c.prnStatus(p.meds, NOW)[0].hoursSince).toBe(2);
  });
  it("hands each pain report out exactly once, oldest first", () => {
    const c = new CareState();
    c.enqueuePain(6, NOW);
    c.enqueuePain(null, NOW);
    expect(c.nextPain()).toMatchObject({ level: 6 });
    expect(c.nextPain()).toMatchObject({ level: null });
    expect(c.nextPain()).toBeNull();
  });
  it("summarises what was said and today's pain", () => {
    const c = new CareState();
    c.logSaid("Can I have some water, please?", NOW - 10 * 60_000);
    c.logSaid("   ", NOW);
    c.enqueuePain(6, NOW - 5 * 60_000);
    const s = c.summary(p, NOW);
    expect(s.saidRecently).toEqual([{ text: "Can I have some water, please?", minutesAgo: 10 }]);
    expect(s.painToday).toEqual([{ level: 6, minutesAgo: 5 }]);
    expect(s.activeMedicines).toBe(12);
  });
});
