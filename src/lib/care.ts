// Care loop client: pain reports go to the hub, where the Care agent (agents/) picks them up.
import { HUB } from "./hub";

async function post(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${HUB}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? `hub ${res.status}`);
}

/** The user is in pain. `level` 1-10, or null when they could not say. */
export const reportPain = (level: number | null) => post("/care/pain", { level });

/** Tell the hub a medicine was just taken (the dose log the agents read). */
export const markTaken = (name: string) => post("/care/taken", { name });

/** Record a sentence the user spoke aloud (private messages are never logged). Best effort. */
export const logSpoken = (text: string): void => void post("/care/log", { text }).catch(() => {});
