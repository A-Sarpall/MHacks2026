import { aimCrop, contains, type Box, type Candidate, type Point } from "./aim";
import { DEFAULT_NAMING } from "./escalate";
import { cosine } from "./vocabIndex";

export interface PersonalEntry {
  id: string;
  name: string;
  embeddings: Float32Array[];
  contactId?: string;
}

export interface PersonalHit {
  id: string;
  name: string;
  cos: number;
  runnerUp: number;
  contactId?: string;
}

export interface PersonalMatchConfig {
  threshold: number;
  margin: number;
  minConfidence: number;
}

export const DEFAULT_PERSONAL: PersonalMatchConfig = {
  threshold: 0.92,
  margin: 0.04,
  minConfidence: 0.6,
};

export function nearestPersonal(v: Float32Array, entries: PersonalEntry[]): PersonalHit[] {
  const scored = entries
    .filter((e) => e.embeddings.length > 0)
    .map((e) => ({
      id: e.id,
      name: e.name,
      contactId: e.contactId,
      cos: e.embeddings.reduce((m, x) => Math.max(m, x.length === v.length ? cosine(x, v) : -Infinity), -Infinity),
    }))
    .filter((e) => Number.isFinite(e.cos))
    .sort((a, b) => b.cos - a.cos);
  return scored.map((s, i) => ({ ...s, runnerUp: scored[i + 1]?.cos ?? -Infinity }));
}

export function matchPersonal(
  v: Float32Array,
  entries: PersonalEntry[],
  cfg: PersonalMatchConfig = DEFAULT_PERSONAL
): PersonalHit | null {
  const [best] = nearestPersonal(v, entries);
  if (!best || best.cos < cfg.threshold) return null;
  return best.cos - best.runnerUp >= cfg.margin ? best : null;
}

export function personalConfidence(hit: PersonalHit, cfg: PersonalMatchConfig = DEFAULT_PERSONAL): number {
  const span = Math.max(1e-6, 1 - cfg.threshold);
  const t = Math.min(1, Math.max(0, (hit.cos - cfg.threshold) / span));
  return cfg.minConfidence + (1 - cfg.minConfidence) * t;
}

export function teachBoxes(w: number, h: number, aim: Point, candidates: Candidate[] = []): Box[] {
  const covering = candidates
    .filter((c) => c.kind === "detection" && contains(c.box, aim))
    .sort((a, b) => a.box.w * a.box.h - b.box.w * b.box.h)[0];
  const boxes = [aimCrop(w, h, aim, DEFAULT_NAMING.centreFrac)];
  if (covering) boxes.push({ ...covering.box });
  return boxes;
}
