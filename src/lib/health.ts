// FinchNode health records: load a patient's record and turn it into things
// Cue can say. Uses the keyless public demo API (synthetic patients only,
// CORS open), so it runs straight from the browser with no backend.
// Production would read consented records with a server-side key instead.

const DEMO_API = "https://api.finchnode.com/demo/v1";

export interface DemoPatient {
  scenario: string; // e.g. "pediatric-asthma"
  subject: string; // e.g. "patient-demo-pediatric-asthma"
  name: string;
  title: string; // e.g. "Pediatric asthma, age 9"
}

export interface HealthMed {
  name: string; // as recorded
  spoken: string; // "albuterol inhaler", "metformin"
  drug: string; // "albuterol"
  form: string | null; // "inhaler", "tablet", ...
  dosage: string | null;
}

export interface HealthAllergy {
  substance: string;
  keyword: string; // "peanut", "house dust mite"
  severity: string | null;
  reaction: string | null;
}

export interface HealthProfile {
  subject: string;
  name: string;
  firstName: string;
  age: number | null;
  conditions: string[];
  meds: HealthMed[];
  allergies: HealthAllergy[];
  appointment: { start: string; type: string; with: string | null; location: string | null } | null;
  careTeam: { name: string; role: string | null }[];
  sources: string[];
  dataAsOf: string | null;
  synthetic: boolean;
}

// What the composer gets: the record summary plus whatever the selected
// objects matched in it
export interface HealthContext {
  summary: string;
  allergies: HealthAllergy[];
  meds: HealthMed[];
}

export interface HealthMatch {
  allergies: HealthAllergy[];
  meds: HealthMed[]; // the object names this medicine
  medGuesses: HealthMed[]; // the object could be one of these (inhaler, pill bottle)
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${DEMO_API}${path}`);
  if (res.status === 429) {
    const wait = res.headers.get("Retry-After");
    throw new Error(`FinchNode rate limit reached${wait ? `, retry in ${wait}s` : ""}`);
  }
  if (!res.ok) throw new Error(`FinchNode ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

interface ScenarioList {
  data: {
    id: string;
    kind: string;
    title: string;
    subject: string | null;
    persona?: { displayName?: string };
  }[];
}

export async function listDemoPatients(): Promise<DemoPatient[]> {
  const { data } = await getJson<ScenarioList>("/scenarios");
  return data
    .filter((s) => s.kind === "record" && s.subject)
    .map((s) => ({
      scenario: s.id,
      subject: s.subject!,
      name: (s.persona?.displayName ?? s.subject!).replace(/\s*\(synthetic\)\s*$/i, ""),
      title: s.title,
    }));
}

interface RawCoded {
  name?: string;
  status?: string | null;
  codes?: { system: string }[];
}
interface RawMed extends RawCoded {
  dosage: string | null;
  startDate: string | null;
}
interface RawAllergy {
  substance: string;
  severity: string | null;
  reaction: string | null;
  status: string | null;
}
interface RawRecord {
  id: string;
  synthetic?: boolean;
  sources: { organization: string }[];
  data: {
    demographics?: { name?: string; birthDate?: string };
    medications?: RawMed[];
    conditions?: RawCoded[];
    allergies?: RawAllergy[];
    appointments?: {
      type: string;
      status: string;
      startDate: string | null;
      practitioner: string | null;
      location: string | null;
    }[];
    careTeam?: { participants?: { name: string; role: string | null }[] }[];
  };
  meta?: { dataAsOf?: string | null };
}

const cache = new Map<string, Promise<HealthProfile>>();

export function loadHealthProfile(subject: string): Promise<HealthProfile> {
  let p = cache.get(subject);
  if (!p) {
    p = getJson<RawRecord>(`/users/${encodeURIComponent(subject)}/records`).then(toProfile);
    p.catch(() => cache.delete(subject));
    cache.set(subject, p);
  }
  return p;
}

// Words that end a drug name: units, forms and salts
const NAME_STOP = new Set([
  "mg", "mcg", "ml", "meq", "hr", "oral", "tablet", "capsule", "chewable",
  "extended", "delayed", "release", "metered", "dose", "inhaler", "solution",
  "hydrochloride", "hcl", "sodium", "succinate", "tartrate", "propionate",
]);
const FORMS = ["inhaler", "tablet", "capsule", "patch", "spray", "solution", "injection", "cream"];

function toMed(m: RawMed): HealthMed {
  const name = m.name ?? "medicine";
  const lower = name.toLowerCase();
  const form = FORMS.find((f) => lower.includes(f)) ?? null;
  let drug = name.split(",")[0].trim().toLowerCase();
  // RxNorm names look like "24 HR metoprolol succinate 50 MG ... Tablet";
  // keep the leading drug words. Free-text names are kept as written.
  if (m.codes?.some((c) => c.system.includes("rxnorm"))) {
    const words: string[] = [];
    for (const tok of name.split(/\s+/)) {
      if (/\d/.test(tok) || (tok.length > 1 && tok === tok.toUpperCase())) {
        if (words.length) break;
        continue;
      }
      const t = tok.toLowerCase();
      if (words.length && (NAME_STOP.has(t) || tok !== t)) break;
      words.push(t);
    }
    if (words.length) drug = words.join(" ");
  }
  return {
    name,
    drug,
    form,
    spoken: form === "inhaler" ? `${drug} inhaler` : drug,
    // "Child dose (ages 6 to 14): chew 1 tablet..." -> "chew 1 tablet..."
    dosage: m.dosage?.replace(/^[^:]*\bdose\b[^:]*:\s*/i, "").trim() || null,
  };
}

function isActive(status: string | null | undefined): boolean {
  return status == null || status === "active";
}

function ageFrom(birthDate: string | undefined): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
  return age;
}

function uniqueBy<T>(items: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((t) => {
    const k = key(t);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function toProfile(r: RawRecord): HealthProfile {
  const d = r.data;
  const name = d.demographics?.name ?? r.id;
  // Two sources can report the same medication; keep the most recent entry
  const meds = uniqueBy(
    (d.medications ?? [])
      .filter((m) => m.status === "active")
      .sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""))
      .map(toMed),
    (m) => m.drug
  );
  const allergies = (d.allergies ?? [])
    .filter((a) => isActive(a.status) && !/^no known/i.test(a.substance))
    .map((a) => ({
      substance: a.substance,
      keyword: a.substance
        .replace(/^allergy to\s+/i, "")
        .replace(/\s+allergy$/i, "")
        .toLowerCase(),
      severity: a.severity,
      reaction: a.reaction?.replace(/^synthetic example:\s*/i, "") ?? null,
    }));
  const now = Date.now();
  const next = (d.appointments ?? [])
    .filter((a) => a.status === "booked" && a.startDate && Date.parse(a.startDate) > now)
    .sort((a, b) => a.startDate!.localeCompare(b.startDate!))[0];
  return {
    subject: r.id,
    name,
    firstName: name.split(/\s+/)[0],
    age: ageFrom(d.demographics?.birthDate),
    conditions: uniqueBy(
      (d.conditions ?? []).filter((c) => isActive(c.status) && c.name).map((c) => c.name!),
      (c) => c.toLowerCase()
    ),
    meds,
    allergies,
    appointment: next
      ? { start: next.startDate!, type: next.type, with: next.practitioner, location: next.location }
      : null,
    careTeam: (d.careTeam ?? []).flatMap((t) => t.participants ?? []),
    sources: r.sources.map((s) => s.organization),
    dataAsOf: r.meta?.dataAsOf ?? null,
    synthetic: r.synthetic ?? false,
  };
}

// --- Matching objects the user points at against the record ---

const MEDICINE_WORDS = /\b(pill|pills|medicine|medication|tablets?|capsules?|prescription)\b/;

function mentions(label: string, keyword: string): boolean {
  // "peanut butter jar" mentions "peanut"; "peanuts" mentions "peanut"
  const stem = keyword.replace(/s$/, "");
  return stem.length > 2 && new RegExp(`\\b${stem.replace(/[^a-z0-9 ]/g, "")}`).test(label);
}

export function matchHealth(label: string, profile: HealthProfile): HealthMatch {
  const l = label.toLowerCase();
  const allergies = profile.allergies.filter((a) => mentions(l, a.keyword));
  const meds = profile.meds.filter((m) => l.includes(m.drug));
  let medGuesses: HealthMed[] = [];
  if (meds.length === 0) {
    if (l.includes("inhaler")) medGuesses = profile.meds.filter((m) => m.form === "inhaler");
    else if (MEDICINE_WORDS.test(l))
      medGuesses = profile.meds.filter((m) => m.form !== "inhaler" && m.form !== "cream");
  }
  // Only one candidate: it's that one
  if (medGuesses.length === 1) return { allergies, meds: medGuesses, medGuesses: [] };
  return { allergies, meds, medGuesses };
}

export function healthContext(profile: HealthProfile, labels: string[]): HealthContext {
  const matches = labels.map((l) => matchHealth(l, profile));
  return {
    summary: summarize(profile),
    allergies: uniqueBy(matches.flatMap((m) => m.allergies), (a) => a.keyword),
    meds: uniqueBy(matches.flatMap((m) => m.meds), (m) => m.drug),
  };
}

function summarize(p: HealthProfile): string {
  const lines = [
    `Name: ${p.name}${p.age !== null ? `, age ${p.age}` : ""}`,
    `Conditions: ${p.conditions.join("; ") || "none recorded"}`,
    `Medications: ${p.meds.map((m) => (m.dosage ? `${m.spoken} (${m.dosage})` : m.spoken)).join("; ") || "none recorded"}`,
    `Allergies: ${p.allergies.map((a) => `${a.keyword}${a.severity ? ` (${a.severity} severity${a.reaction ? `: ${a.reaction}` : ""})` : ""}`).join("; ") || "none recorded"}`,
  ];
  if (p.appointment) lines.push(`Next appointment: ${formatDate(p.appointment.start)} ${p.appointment.type}${p.appointment.with ? ` with ${p.appointment.with}` : ""}`);
  return lines.join("\n");
}

// --- Things to say ---

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

export function allergySentence(a: HealthAllergy): string {
  return `I can't have that, I have ${article(a.keyword)} ${a.keyword} allergy!`;
}

// Sentences offered for an allergen, whatever core word was picked: none of
// them asks for it
export function allergySentences(allergies: HealthAllergy[]): string[] {
  if (allergies.length === 0) return [];
  const a = allergies[0];
  return [
    ...allergies.map(allergySentence),
    `Does this have ${a.keyword} in it?`,
    "Please take it away from me.",
  ];
}

// Record dates are calendar dates; UTC keeps "Sept 1" from showing as Aug 31
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", timeZone: "UTC" });
}

export interface HealthPhrase {
  group: "safety" | "record" | "visit";
  text: string;
}

function listOf(items: string[]): string {
  return items.length > 1
    ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
    : (items[0] ?? "");
}

// One-tap sentences for a clinic visit, built from the record
export function healthPhrases(p: HealthProfile): HealthPhrase[] {
  const out: HealthPhrase[] = [];
  for (const a of p.allergies) {
    const severe = a.severity === "high" ? "severe " : "";
    out.push({
      group: "safety",
      text: `I have ${article(severe || a.keyword)} ${severe}${a.keyword} allergy${a.reaction ? `. It causes ${a.reaction.toLowerCase()}` : ""}.`,
    });
  }
  if (p.conditions.length)
    out.push({ group: "record", text: `I have ${listOf(p.conditions.slice(0, 4).map((c) => c.toLowerCase()))}.` });
  if (p.meds.length)
    out.push({ group: "record", text: `My medications are ${listOf(p.meds.map((m) => m.spoken))}.` });
  if (p.appointment)
    out.push({
      group: "record",
      text: `My next appointment is on ${formatDate(p.appointment.start)}${p.appointment.with ? ` with ${p.appointment.with}` : ""}.`,
    });
  out.push(
    { group: "visit", text: "Please ask me directly. I can answer with this device." },
    { group: "visit", text: "I need a little more time to answer." },
    { group: "visit", text: "Can you write that down for me?" }
  );
  return out;
}

export function medSentence(m: HealthMed): string {
  const take = m.form === "inhaler" ? `I use my ${m.spoken}` : `I take ${m.spoken}`;
  return m.dosage ? `${take}: ${m.dosage.replace(/\.?$/, ".")}` : `${take}.`;
}
