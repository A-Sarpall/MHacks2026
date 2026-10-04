// Phone-screen mode (?ui=phone): the phone app is the user's screen. The browser only recognises what the ring
// saw and tells the phone through the hub (the browser's ring link -> hub -> phone); the phone shows the item,
// the intents and the sentences, and speaks. Message format shared with phone/src/detected.ts.

export const PHONE_UI = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("ui") === "phone";

export interface DetectedOption {
  label: string;
  score: number;
  thumbnail?: string; // small JPEG data URL of the crop
}

export interface DetectedMessage {
  type: "detected";
  id: string;
  /** named: confident, shown as the item · unsure: the phone asks which one · none: nothing recognisable */
  status: "named" | "unsure" | "none";
  label: string | null;
  options: DetectedOption[];
  hint?: string;
}

const MAX_OPTIONS = 4;

/** The recognition result as the phone needs it. Options keep their order (most likely first) and are unique by name. */
export function detectedMessage(
  status: DetectedMessage["status"],
  options: { label: string; score: number; capture?: { thumbnail?: string } }[],
  hint?: string
): DetectedMessage {
  const seen = new Set<string>();
  const opts: DetectedOption[] = [];
  for (const o of options) {
    const key = o.label.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    opts.push({ label: o.label.trim(), score: Math.round(o.score * 100) / 100, thumbnail: o.capture?.thumbnail });
    if (opts.length === MAX_OPTIONS) break;
  }
  return {
    type: "detected",
    id: `d${Date.now().toString(36)}`,
    status: status !== "none" && opts.length === 0 ? "none" : status,
    label: status === "named" ? (opts[0]?.label ?? null) : null,
    options: status === "none" ? [] : opts,
    ...(hint ? { hint } : {}),
  };
}
