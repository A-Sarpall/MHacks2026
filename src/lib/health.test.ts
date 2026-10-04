import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allergySentences, formatDate, healthContext, healthPhrases, matchHealth, toProfile, type RawRecord } from "./health";
import { composeMock } from "./compose";

// The hub's fixture is the FinchNode polypharmacy record's `data`; wrap it like a /users/{subject}/records response
const data = JSON.parse(readFileSync(new URL("../../server/fixtures/polypharmacy.json", import.meta.url), "utf8"));
const harriet = toProfile({
  id: "patient-demo-polypharmacy",
  synthetic: true,
  sources: [{ organization: "Northstar Health System (Synthetic)" }],
  data,
  meta: { dataAsOf: "2026-09-01T00:00:00Z" },
} as RawRecord);

// Shaped like the live pediatric-asthma record (RxNorm names, an inhaler, a high-severity allergy)
const theo = toProfile({
  id: "patient-demo-pediatric-asthma",
  synthetic: true,
  sources: [{ organization: "Northstar Health System (Synthetic)" }],
  data: {
    demographics: { name: "Theo Abernathy", birthDate: "2017-06-11" },
    allergies: [
      { substance: "Allergy to peanut", severity: "high", reaction: "Synthetic example: hives and lip swelling", status: "active" },
      { substance: "No known allergy", severity: null, reaction: null, status: "active" },
    ],
    medications: [
      {
        name: "NDA021457 200 ACTUAT albuterol 0.09 MG/ACTUAT Metered Dose Inhaler",
        dosage: "Child dose: inhale 2 puffs with spacer every 4 hours as needed for cough or wheeze",
        status: "active",
        startDate: "2025-03-22",
        codes: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm" }],
      },
      {
        name: "montelukast 5 MG Chewable Tablet",
        dosage: "Child dose (ages 6 to 14): chew 1 tablet by mouth once daily in the evening",
        status: "active",
        startDate: "2025-06-10",
        codes: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm" }],
      },
    ],
    conditions: [{ name: "Mild persistent asthma", status: "active" }],
  },
} as RawRecord);

describe("toProfile", () => {
  it("reads the polypharmacy record the hub uses", () => {
    expect(harriet.name).toBe("Harriet Lindqvist");
    expect(harriet.meds).toHaveLength(14);
    expect(harriet.allergies.map((a) => a.keyword)).toEqual(["sulfonamide", "contrast media"]);
  });
  it("turns RxNorm strings into plain medicine names", () => {
    const drugs = harriet.meds.map((m) => m.drug);
    expect(drugs).toContain("metoprolol");
    expect(drugs).toContain("potassium chloride");
    expect(theo.meds.map((m) => m.spoken)).toEqual(["montelukast", "albuterol inhaler"]);
    expect(theo.meds[0].dosage).toBe("chew 1 tablet by mouth once daily in the evening");
  });
  it("drops 'no known allergy' and the synthetic prefix", () => {
    expect(theo.allergies).toEqual([
      { substance: "Allergy to peanut", keyword: "peanut", severity: "high", reaction: "hives and lip swelling" },
    ]);
  });
});

describe("matchHealth", () => {
  it("flags an allergen in the object's name", () => {
    expect(matchHealth("peanut butter", theo).allergies.map((a) => a.keyword)).toEqual(["peanut"]);
    expect(matchHealth("peanuts", theo).allergies).toHaveLength(1);
    expect(matchHealth("banana", theo).allergies).toHaveLength(0);
  });
  it("names a medicine, or asks which one", () => {
    expect(matchHealth("lisinopril bottle", harriet).meds.map((m) => m.drug)).toEqual(["lisinopril"]);
    expect(matchHealth("pill bottle", harriet).medGuesses).toHaveLength(14);
    // only one inhaler on the list: that's the one
    expect(matchHealth("inhaler", theo).meds.map((m) => m.spoken)).toEqual(["albuterol inhaler"]);
  });
  it("does not treat a tablet computer as a medicine", () => {
    const m = matchHealth("tablet", harriet);
    expect(m.meds.length + m.medGuesses.length).toBe(0);
  });
});

describe("sentences", () => {
  it("only offers refusals for an allergen, whatever the core word", () => {
    const health = healthContext(theo, ["peanut butter"]);
    for (const word of ["want", "more", "yes"]) {
      const out = composeMock({ tiles: ["peanut butter"], coreWords: [word], health });
      expect(out).toEqual(allergySentences(health.allergies));
      expect(out.join(" ")).not.toMatch(/can i have|i want|more peanut/i);
    }
    expect(allergySentences(health.allergies)[0]).toBe("I can't have that, I have a peanut allergy!");
  });
  it("talks about the user's own medicine", () => {
    const health = healthContext(theo, ["montelukast"]);
    expect(composeMock({ tiles: ["montelukast"], coreWords: ["question"], health })[0]).toBe("Is it time for my montelukast?");
  });
  it("builds clinic phrases from the record", () => {
    const texts = healthPhrases(theo).map((p) => p.text);
    expect(texts[0]).toBe("I have a severe peanut allergy. It causes hives and lip swelling.");
    expect(texts).toContain("My medications are montelukast and albuterol inhaler.");
  });
  it("shows record dates as calendar dates", () => {
    expect(formatDate("2026-09-01T00:00:00Z")).toMatch(/September 1|1 September/);
  });
});
