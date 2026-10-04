// Medication mode client: asks the hub (server/) to read a bottle label and check it against the
// patient's FinchNode record. Verdict wording is built server-side (server/meds.ts) and spoken as is.
import { HUB } from "./hub";

export type VerdictKind = "match" | "dose-mismatch" | "allergy" | "unknown" | "unreadable";
export interface MedVerdict {
  kind: VerdictKind;
  speech: string;
  /** Present when the label matched a medicine on the list. */
  med?: { key: string; short: string };
}
export interface LabelRead {
  drug?: string | null;
  strength?: string | null;
}
export interface ClinicSummary {
  patient: string;
  age: number | null;
  patientWords: string[];
  text: string;
}

// Names SigLIP gives (src/data/vocabulary.ts) that mean "something with a medicine label".
const MEDICATION_LABELS = new Set(["pill bottle", "pills", "medicine", "liquid medicine", "pill organizer"]);
export const isMedicationLabel = (label: string): boolean => MEDICATION_LABELS.has(label.toLowerCase());

/** JPEG base64 (no data: prefix), downscaled so small print stays readable but the upload stays small. */
export function canvasToJpegBase64(canvas: HTMLCanvasElement, maxSide = 1280): string {
  const scale = Math.min(1, maxSide / Math.max(canvas.width, canvas.height));
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(canvas.width * scale));
  out.height = Math.max(1, Math.round(canvas.height * scale));
  out.getContext("2d")!.drawImage(canvas, 0, 0, out.width, out.height);
  return out.toDataURL("image/jpeg", 0.85).split(",")[1];
}

async function post<T>(path: string, body: unknown, timeoutMs: number): Promise<T> {
  const res = await fetch(`${HUB}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const json = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? `hub ${res.status}`);
  return json;
}

export const checkMedication = (input: { image: string } | { drug: string; strength?: string }) =>
  post<{ read: LabelRead; verdict: MedVerdict }>("/meds/check", input, 20_000);

export const fetchClinicSummary = (words: string[]) => post<ClinicSummary>("/meds/clinic", { words }, 10_000);
