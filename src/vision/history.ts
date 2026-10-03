import {
  DEFAULT_BOOST,
  boostFrom,
  summarize,
  timeOfDay,
  toHistorySource,
  type BoostConfig,
  type HistoryEntry,
  type LabelSummary,
} from "./core/history";

export type { HistoryEntry, HistorySource, LabelSummary, TimeOfDay } from "./core/history";

const KEY = "cue.vision.history.v1";
const MAX_ENTRIES = 2000;

let entries: HistoryEntry[] | null = null;
const listeners = new Set<(log: HistoryEntry[]) => void>();

function load(): HistoryEntry[] {
  if (entries) return entries;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    entries = Array.isArray(parsed)
      ? (parsed as HistoryEntry[]).filter((e) => typeof e?.label === "string" && typeof e?.at === "number")
      : [];
  } catch {
    entries = [];
  }
  return entries;
}

function persist(next: HistoryEntry[]): void {
  entries = next.slice(-MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn("[history] could not save", err);
  }
  for (const l of listeners) l(entries);
}

export function recordSelection(sel: { id: string; label: string; source: string; at?: number }): HistoryEntry | null {
  const label = sel.label.trim();
  if (!label) return null;
  const at = sel.at ?? Date.now();
  const entry: HistoryEntry = { id: sel.id, label, source: toHistorySource(sel.source), at, timeOfDay: timeOfDay(at) };
  persist([...load().filter((e) => e.id !== sel.id), entry]);
  return entry;
}

export function correctSelection(id: string, label: string, source: string): void {
  const log = load();
  const prev = log.find((e) => e.id === id);
  if (!prev) return;
  const clean = label.trim();
  if (!clean) return;
  persist(log.map((e) => (e.id === id ? { ...e, label: clean, source: toHistorySource(source) } : e)));
}

export function historyLog(): readonly HistoryEntry[] {
  return load();
}

export function historySummary(opts: { since?: number } = {}): LabelSummary[] {
  return summarize(load().filter((e) => e.at >= (opts.since ?? 0)));
}

export function historyBoost(now = Date.now(), cfg: BoostConfig = DEFAULT_BOOST): (label: string) => number {
  return boostFrom(load(), now, cfg);
}

export function clearHistory(): void {
  persist([]);
}

export function onHistoryChange(cb: (log: HistoryEntry[]) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
