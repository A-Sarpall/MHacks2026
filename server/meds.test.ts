import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkBottle, clinicSummary, toProfile, type RawRecord } from "./meds.ts";

const raw = JSON.parse(readFileSync(new URL("./fixtures/polypharmacy.json", import.meta.url), "utf8")) as RawRecord;
const p = toProfile(raw, "fixture", new Date("2026-10-03"));

describe("profile", () => {
  it("parses the FinchNode polypharmacy record", () => {
    expect(p.name).toBe("Harriet Lindqvist");
    expect(p.age).toBe(78);
    expect(p.meds).toHaveLength(14);
    expect(p.allergies.map((a) => a.substance)).toEqual(["Sulfonamide", "Contrast media"]);
  });
  it("parses names, strengths and timing", () => {
    const m = p.meds.find((x) => x.key === "metoprolol")!;
    expect(m).toMatchObject({ short: "Metoprolol", strength: "50 mg", quantity: "1 tablet", timing: "once a day", prn: false, note: "Do not crush." });
    const apixaban = p.meds.find((x) => x.key === "apixaban")!;
    expect(apixaban.timing).toBe("twice a day");
    const apap = p.meds.find((x) => x.key === "acetaminophen")!;
    expect(apap).toMatchObject({ prn: true, reason: "knee pain", timing: "every 8 hours", intervalHours: 8 });
    expect(p.meds.find((x) => x.key === "levothyroxine")!.timing).toBe("every morning, on an empty stomach");
    expect(p.meds.find((x) => x.key === "metformin")!.timing).toBe("once a day, with evening meal");
  });
});

describe("checkBottle", () => {
  it("says how to take a listed medicine", () => {
    const v = checkBottle({ drug: "Metoprolol Succinate", strength: "50 mg" }, p);
    expect(v.kind).toBe("match");
    expect(v.speech).toBe("Metoprolol. Take 1 tablet once a day. Do not crush.");
  });
  it("knows brand names", () => {
    expect(checkBottle({ drug: "Tylenol", strength: "500 mg" }, p).kind).toBe("match");
    expect(checkBottle({ drug: "Tylenol" }, p).speech).toContain("Only if needed for knee pain");
  });
  it("treats mcg and mg as the same dose", () => {
    expect(checkBottle({ drug: "levothyroxine", strength: "75 mcg" }, p).kind).toBe("match");
  });
  it("warns on a different strength", () => {
    const v = checkBottle({ drug: "metoprolol", strength: "100 mg" }, p);
    expect(v.kind).toBe("dose-mismatch");
    expect(v.speech).toMatch(/^Metoprolol, but this bottle is 100 mg and your list says 50 mg\. Don't take it/);
  });
  it("refuses a medicine that is not on the list", () => {
    const v = checkBottle({ drug: "Ibuprofen", strength: "200 mg" }, p);
    expect(v.kind).toBe("unknown");
    expect(v.speech).toContain("Don't take it");
  });
  it("blocks an allergy first", () => {
    const v = checkBottle({ drug: "Bactrim DS (sulfamethoxazole / trimethoprim)" }, p);
    expect(v.kind).toBe("allergy");
    expect(v.speech).toContain("allergic to sulfonamide");
  });
  it("never approves an unreadable label", () => {
    for (const read of [null, {}, { drug: null }, { drug: "  " }]) {
      const v = checkBottle(read, p);
      expect(v.kind).toBe("unreadable");
      expect(v.speech).toContain("Don't take it");
    }
  });
});

describe("clinicSummary", () => {
  it("includes the patient's own words, conditions, allergies and medicines", () => {
    const s = clinicSummary(p, ["My left arm has been hurting since Tuesday.", "  "]);
    expect(s.patientWords).toEqual(["My left arm has been hurting since Tuesday."]);
    expect(s.scheduled).toHaveLength(12);
    expect(s.asNeeded.map((m) => m.name)).toEqual(["Acetaminophen", "Trazodone"]);
    expect(s.text).toContain('"My left arm has been hurting since Tuesday."');
    expect(s.text).toContain("Allergies: Sulfonamide (Synthetic example: hives)");
  });
});
