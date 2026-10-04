// FinchNode public demo API (https://api.finchnode.com/demo/v1): synthetic, no key, CORS-open.
// Verified 2026-10-03: GET /users/{subject}/records -> { data: { demographics, allergies, medications, conditions, ... } }.
// Falls back to server/fixtures/polypharmacy.json if the network is down, so the demo still runs.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { toProfile, type Profile, type RawRecord } from "./meds.ts";

const BASE = process.env.FINCHNODE_BASE ?? "https://api.finchnode.com/demo/v1";
/** Most medications of the 12 scenarios (14 active). Change with FINCHNODE_SUBJECT. */
export const SUBJECT = process.env.FINCHNODE_SUBJECT ?? "patient-demo-polypharmacy";
const TTL_MS = 5 * 60_000;

let cache: { at: number; profile: Profile } | null = null;

export async function loadProfile(): Promise<Profile> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.profile;
  let profile: Profile;
  try {
    const res = await fetch(`${BASE}/users/${SUBJECT}/records?categories=demographics,medications,conditions,allergies`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`FinchNode ${res.status}`);
    profile = toProfile(((await res.json()) as { data: RawRecord }).data, "live");
  } catch (err) {
    console.warn("[finch] live fetch failed, using bundled fixture:", (err as Error).message);
    const raw = JSON.parse(readFileSync(fileURLToPath(new URL("./fixtures/polypharmacy.json", import.meta.url)), "utf8")) as RawRecord;
    profile = toProfile(raw, "fixture");
  }
  cache = { at: Date.now(), profile };
  return profile;
}
