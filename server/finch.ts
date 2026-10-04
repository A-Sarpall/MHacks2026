// FinchNode public demo API (https://api.finchnode.com/demo/v1): synthetic, no key, CORS-open.
// Verified 2026-10-03: GET /users/{subject}/records -> { data: { demographics, allergies, medications, conditions, ... } }.
// Falls back to server/fixtures/polypharmacy.json if the network is down, so the demo still runs.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { toProfile, type Profile, type RawRecord } from "./meds.ts";

const BASE = process.env.FINCHNODE_BASE ?? "https://api.finchnode.com/demo/v1";
/** The bundled fixture is this patient's record, so it is only a fallback for them. */
const FIXTURE_SUBJECT = "patient-demo-polypharmacy";
/** Most medications of the 12 scenarios (14 active). Change with FINCHNODE_SUBJECT, or at runtime with setSubject. */
let subject = process.env.FINCHNODE_SUBJECT ?? FIXTURE_SUBJECT;
const TTL_MS = 5 * 60_000;

let cache: { at: number; subject: string; profile: Profile } | null = null;

export const currentSubject = (): string => subject;

/** Switch the patient Qu is for (the browser's health-record picker). Throws on a malformed id. */
export function setSubject(next: string): void {
  if (!/^[A-Za-z0-9._-]{1,100}$/.test(next)) throw new Error("invalid patient id");
  if (next !== subject) {
    subject = next;
    cache = null;
  }
}

export async function loadProfile(): Promise<Profile> {
  const want = subject;
  if (cache && cache.subject === want && Date.now() - cache.at < TTL_MS) return cache.profile;
  let profile: Profile;
  try {
    const res = await fetch(`${BASE}/users/${encodeURIComponent(want)}/records?categories=demographics,medications,conditions,allergies`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`FinchNode ${res.status}`);
    profile = toProfile(((await res.json()) as { data: RawRecord }).data, "live");
  } catch (err) {
    // Never answer for one patient with another patient's record
    if (want !== FIXTURE_SUBJECT) throw err;
    console.warn("[finch] live fetch failed, using bundled fixture:", (err as Error).message);
    const raw = JSON.parse(readFileSync(fileURLToPath(new URL("./fixtures/polypharmacy.json", import.meta.url)), "utf8")) as RawRecord;
    profile = toProfile(raw, "fixture");
  }
  // A switch while this was loading: don't cache the old patient's record as current
  if (want === subject) cache = { at: Date.now(), subject: want, profile };
  return profile;
}
