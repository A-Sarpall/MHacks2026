export type HistorySource = "personal" | "vocab" | "fallback" | "manual";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface HistoryEntry {
  id: string;
  label: string;
  source: HistorySource;
  at: number;
  timeOfDay: TimeOfDay;
}

export interface LabelSummary {
  label: string;
  count: number;
  lastAt: number;
  sources: Partial<Record<HistorySource, number>>;
  byTimeOfDay: Partial<Record<TimeOfDay, number>>;
}

export interface BoostConfig {
  maxBoost: number;
  halfLifeDays: number;
  sameTimeWeight: number;
  saturation: number;
}

export const DEFAULT_BOOST: BoostConfig = {
  maxBoost: 0.006,
  halfLifeDays: 14,
  sameTimeWeight: 1.5,
  saturation: 3,
};

const DAY = 24 * 60 * 60 * 1000;

export function timeOfDay(at: number | Date): TimeOfDay {
  const h = (at instanceof Date ? at : new Date(at)).getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

export function toHistorySource(source: string): HistorySource {
  if (source === "personal" || source === "vocab" || source === "manual") return source;
  return "fallback";
}

export function labelWeights(entries: HistoryEntry[], now: number, cfg: BoostConfig = DEFAULT_BOOST): Map<string, number> {
  const tod = timeOfDay(now);
  const out = new Map<string, number>();
  for (const e of entries) {
    const age = Math.max(0, now - e.at) / DAY;
    const w = Math.pow(0.5, age / cfg.halfLifeDays) * (e.timeOfDay === tod ? cfg.sameTimeWeight : 1);
    out.set(e.label, (out.get(e.label) ?? 0) + w);
  }
  return out;
}

export function boostFrom(
  entries: HistoryEntry[],
  now: number,
  cfg: BoostConfig = DEFAULT_BOOST
): (label: string) => number {
  const weights = labelWeights(entries, now, cfg);
  return (label) => {
    const w = weights.get(label) ?? 0;
    return cfg.maxBoost * (1 - Math.exp(-w / cfg.saturation));
  };
}

export function summarize(entries: HistoryEntry[]): LabelSummary[] {
  const map = new Map<string, LabelSummary>();
  for (const e of entries) {
    const s = map.get(e.label) ?? { label: e.label, count: 0, lastAt: 0, sources: {}, byTimeOfDay: {} };
    s.count++;
    s.lastAt = Math.max(s.lastAt, e.at);
    s.sources[e.source] = (s.sources[e.source] ?? 0) + 1;
    s.byTimeOfDay[e.timeOfDay] = (s.byTimeOfDay[e.timeOfDay] ?? 0) + 1;
    map.set(e.label, s);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || b.lastAt - a.lastAt);
}
