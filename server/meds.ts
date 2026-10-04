// Medication logic, pure (no network, no fs) so it is unit-tested. Turns a FinchNode record into a
// Profile, checks a bottle label against it, and builds the clinic summary.
// Deliberately conservative: anything not clearly on the list or clearly matching says "don't take it".

export interface RawRecord {
  demographics: { name: string; birthDate: string; gender?: string };
  allergies: { substance: string; reaction?: string; status?: string }[];
  medications: { name: string; dosage?: string | null; status?: string; endDate?: string | null; reason?: string | null }[];
  conditions: { name: string; status?: string }[];
}

export interface Med {
  full: string; // "24 HR metoprolol succinate 50 MG Extended Release Oral Tablet"
  key: string; // "metoprolol": first ingredient word, what labels are matched on
  short: string; // "Metoprolol": what is said aloud
  strength: string | null; // "50 mg"
  strengthMg: number | null;
  quantity: string | null; // "1 tablet"
  timing: string; // "once a day"
  prn: boolean;
  intervalHours: number | null; // "every 8 hours" -> 8
  reason: string | null;
  note: string | null; // "Do not crush."
  instructions: string; // original text
}

export interface Profile {
  name: string;
  birthDate: string;
  age: number | null;
  gender: string | null;
  conditions: string[];
  allergies: { substance: string; reaction: string | null }[];
  meds: Med[];
  source: "live" | "fixture";
}

const SPOKEN: Record<string, string> = { potassium: "Potassium chloride", cholecalciferol: "Vitamin D" };
const ALIASES: Record<string, string> = {
  lipitor: "atorvastatin", toprol: "metoprolol", lopressor: "metoprolol", lasix: "furosemide", eliquis: "apixaban",
  zestril: "lisinopril", prinivil: "lisinopril", glucophage: "metformin", synthroid: "levothyroxine",
  prilosec: "omeprazole", tylenol: "acetaminophen", paracetamol: "acetaminophen", zoloft: "sertraline",
  desyrel: "trazodone", "klor-con": "potassium", klorcon: "potassium", "k-dur": "potassium",
  bayer: "aspirin", ecotrin: "aspirin", "vitamin": "cholecalciferol", d3: "cholecalciferol",
};
// Allergy class -> words that mean a drug of that class (small, curated; not a clinical database).
const ALLERGY_CLASSES: Record<string, string[]> = {
  sulfonamide: ["sulfamethoxazole", "trimethoprim", "bactrim", "septra", "sulfasalazine", "sulfadiazine", "sulfa"],
  sulfa: ["sulfamethoxazole", "trimethoprim", "bactrim", "septra", "sulfasalazine", "sulfadiazine"],
  penicillin: ["penicillin", "amoxicillin", "ampicillin", "augmentin", "amoxil"],
  nsaid: ["ibuprofen", "naproxen", "advil", "motrin", "aleve", "diclofenac", "meloxicam"],
  codeine: ["codeine", "tramadol", "hydrocodone", "oxycodone", "morphine"],
};

const STOP = new Set(["oral", "tablet", "capsule", "extended", "release", "delayed", "mg", "mcg", "meq", "the", "and", "tablets", "capsules"]);
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9.\- ]/g, " ").split(/\s+/).filter(Boolean);

export function parseStrength(s: string | null | undefined): { text: string; mg: number } | null {
  const m = /(\d+(?:\.\d+)?)\s*(mg|mcg|ug|g|meq)\b/i.exec(s ?? "");
  if (!m) return null;
  const n = Number(m[1]);
  const u = m[2].toLowerCase();
  const mg = u === "g" ? n * 1000 : u === "mcg" || u === "ug" ? n / 1000 : n;
  return { text: `${n} ${u === "meq" ? "mEq" : u}`, mg };
}

function timingOf(dosage: string): { timing: string; prn: boolean; reason: string | null; note: string | null } {
  const d = dosage.toLowerCase();
  const prnM = /as needed(?: for ([^;.]+))?/.exec(d);
  const note = /do not crush/.test(d) ? "Do not crush." : null;
  let timing = "";
  if (/twice daily|twice a day/.test(d)) timing = "twice a day";
  else if (/every (\d+) hours/.test(d)) timing = `every ${/every (\d+) hours/.exec(d)![1]} hours`;
  else if (/every morning/.test(d)) timing = "every morning";
  else if (/at bedtime/.test(d)) timing = "at bedtime";
  else if (/once daily|once a day/.test(d)) timing = "once a day";
  const withM = /\b(with|before) (?:the )?([a-z ]+?)(?:;|\.|$| as needed)/.exec(d);
  if (withM && !/by mouth/.test(withM[0])) timing += `${timing ? ", " : ""}${withM[1]} ${withM[2].trim()}`;
  if (/empty stomach/.test(d)) timing += `${timing ? ", " : ""}on an empty stomach`;
  return { timing, prn: Boolean(prnM), reason: prnM?.[1]?.trim() ?? null, note };
}

export function parseMed(r: RawRecord["medications"][number]): Med {
  const full = r.name;
  const base = full.replace(/^\d+\s*hr\s+/i, "");
  const toks = base.split(/\s+/);
  const stop = toks.findIndex((t) => /^\d/.test(t));
  const drugWords = (stop > 0 ? toks.slice(0, stop) : toks.slice(0, 2)).map((t) => t.toLowerCase());
  const key = drugWords[0];
  const dosage = r.dosage ?? "";
  const { timing, prn, reason, note } = timingOf(dosage);
  const q = /take (\d+(?:\.\d+)?|one|two) (tablet|capsule)s?/i.exec(dosage);
  const st = parseStrength(base);
  return {
    full, key,
    short: SPOKEN[key] ?? key.charAt(0).toUpperCase() + key.slice(1),
    strength: st?.text ?? null, strengthMg: st?.mg ?? null,
    quantity: q ? `${q[1]} ${q[2]}${q[1] === "1" || q[1] === "one" ? "" : "s"}` : null,
    timing, prn, reason: reason ?? r.reason ?? null, note, instructions: dosage,
    intervalHours: Number(/every (\d+) hours/i.exec(dosage)?.[1]) || null,
  };
}

export function toProfile(raw: RawRecord, source: Profile["source"], now = new Date()): Profile {
  const born = new Date(raw.demographics.birthDate);
  const age = Number.isNaN(born.getTime()) ? null : Math.floor((now.getTime() - born.getTime()) / 31_557_600_000);
  const active = (x: { status?: string; endDate?: string | null }) => (x.status ?? "active") === "active" && !x.endDate;
  return {
    name: raw.demographics.name, birthDate: raw.demographics.birthDate, age, gender: raw.demographics.gender ?? null,
    conditions: raw.conditions.filter(active).map((c) => c.name),
    allergies: raw.allergies.filter(active).map((a) => ({ substance: a.substance, reaction: a.reaction ?? null })),
    meds: raw.medications.filter(active).map(parseMed),
    source,
  };
}

// ---- checking a bottle ----

export interface LabelRead {
  drug?: string | null;
  strength?: string | null;
}

export type Verdict =
  | { kind: "match"; speech: string; med: Med }
  | { kind: "dose-mismatch"; speech: string; med: Med }
  | { kind: "allergy"; speech: string; allergy: string }
  | { kind: "unknown"; speech: string }
  | { kind: "unreadable"; speech: string };

const tokensOf = (drug: string): string[] => words(drug).map((w) => ALIASES[w] ?? w).filter((w) => !STOP.has(w) && !/^\d/.test(w));

export function checkBottle(read: LabelRead | null, p: Profile): Verdict {
  const drug = read?.drug?.trim();
  if (!drug) return { kind: "unreadable", speech: "I can't read this label. Try again, or ask someone to check it. Don't take it until you know." };
  const toks = tokensOf(drug);

  for (const a of p.allergies) {
    const cls = words(a.substance).flatMap((w) => ALLERGY_CLASSES[w] ?? []);
    const hit = toks.some((t) => cls.includes(t) || words(a.substance).includes(t));
    if (hit) return { kind: "allergy", allergy: a.substance, speech: `Don't take this. You are allergic to ${a.substance.toLowerCase()}. Show it to your nurse or doctor.` };
  }

  const med = p.meds.find((m) => toks.includes(m.key));
  if (!med) return { kind: "unknown", speech: `This isn't on your medicine list. Don't take it. Ask your nurse or doctor.` };

  const label = parseStrength(read?.strength ?? "");
  if (label && med.strengthMg !== null && Math.abs(label.mg - med.strengthMg) > 1e-9) {
    return { kind: "dose-mismatch", med, speech: `${med.short}, but this bottle is ${label.text} and your list says ${med.strength}. Don't take it. Ask your nurse or doctor.` };
  }
  return { kind: "match", med, speech: adviceFor(med) };
}

export function adviceFor(m: Med): string {
  const when = m.timing ? ` ${m.timing}` : "";
  const prn = m.prn ? ` Only if needed${m.reason ? ` for ${m.reason}` : ""}.` : "";
  return `${m.short}. Take ${m.quantity ?? "as directed"}${when}.${prn}${m.note ? ` ${m.note}` : ""}`.replace(/\.\./g, ".");
}

// ---- clinic mode ----

export interface ClinicSummary {
  patient: string;
  age: number | null;
  conditions: string[];
  scheduled: { name: string; strength: string | null; instructions: string }[];
  asNeeded: { name: string; strength: string | null; instructions: string }[];
  allergies: { substance: string; reaction: string | null }[];
  patientWords: string[];
  text: string;
}

export function clinicSummary(p: Profile, patientWords: string[]): ClinicSummary {
  const line = (m: Med) => ({ name: m.short, strength: m.strength, instructions: m.instructions });
  const scheduled = p.meds.filter((m) => !m.prn).map(line);
  const asNeeded = p.meds.filter((m) => m.prn).map(line);
  const words = patientWords.map((w) => w.trim()).filter(Boolean).slice(-10);
  const fmt = (l: ReturnType<typeof line>) => `  - ${l.name}${l.strength ? ` ${l.strength}` : ""}: ${l.instructions}`;
  const text = [
    `${p.name}${p.age !== null ? `, ${p.age}` : ""}`,
    "",
    `In the patient's own words (typed with Qu):`,
    ...(words.length ? words.map((w) => `  "${w}"`) : ["  (nothing recorded yet)"]),
    "",
    `Conditions: ${p.conditions.join("; ") || "none listed"}`,
    `Allergies: ${p.allergies.map((a) => a.substance + (a.reaction ? ` (${a.reaction})` : "")).join("; ") || "none listed"}`,
    "",
    `Medicines (${scheduled.length}):`, ...scheduled.map(fmt),
    ...(asNeeded.length ? ["", `As needed (${asNeeded.length}):`, ...asNeeded.map(fmt)] : []),
  ].join("\n");
  return { patient: p.name, age: p.age, conditions: p.conditions, scheduled, asNeeded, allergies: p.allergies, patientWords: words, text };
}
