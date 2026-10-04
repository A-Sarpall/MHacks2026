const KEY = "cue.verbs.v1";

type Counts = Record<string, number>;

function load(): Counts {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Counts) : {};
  } catch {
    return {};
  }
}

export function recordVerb(intent: string, verb: string): void {
  const counts = load();
  const k = `${intent}:${verb}`;
  counts[k] = (counts[k] ?? 0) + 1;
  try {
    localStorage.setItem(KEY, JSON.stringify(counts));
  } catch {
    return;
  }
}

export function orderVerbs(intent: string, verbs: string[], counts: Counts = load()): string[] {
  return verbs
    .map((v, i) => ({ v, i, n: counts[`${intent}:${v}`] ?? 0 }))
    .sort((a, b) => b.n - a.n || a.i - b.i)
    .map((x) => x.v);
}
