export interface LabelSpec {
  label: string;
  accept?: string[];
  aim?: [number, number] | null;
  tags?: string[];
}

export type LabelFile = Record<string, LabelSpec>;

export interface CaseResult {
  file: string;
  expected: string;
  tags: string[];
  best: string;
  bestScore: number;
  source: string;
  low: boolean;
  empty: boolean;
  level: number;
  choices: string[];
  ms: number;
  totalMs: number;
}

export interface CaseOutcome {
  top1: boolean;
  top3: boolean;
  auto: boolean;
  wrongAuto: boolean;
  notSure: boolean;
}

export interface EvalSummary {
  n: number;
  top1: number;
  top3: number;
  auto: number;
  wrongAuto: number;
  notSure: number;
  avgMs: number;
  p95Ms: number;
  avgTotalMs: number;
  sources: Record<string, number>;
}

export function normLabel(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/^(a|an|the) /, "")
    .replace(/\s+/g, " ")
    .trim();
}

function singular(s: string): string {
  return s.length > 3 && s.endsWith("s") && !s.endsWith("ss") ? s.slice(0, -1) : s;
}

export function matches(label: string, spec: LabelSpec): boolean {
  const got = singular(normLabel(label));
  return [spec.label, ...(spec.accept ?? [])].some((a) => singular(normLabel(a)) === got);
}

export function outcome(r: CaseResult, spec: LabelSpec): CaseOutcome {
  const top1 = !r.empty && matches(r.best, spec);
  const top3 = !r.empty && r.choices.slice(0, 3).some((c) => matches(c, spec));
  const auto = !r.low && !r.empty;
  return { top1, top3, auto, wrongAuto: auto && !top1, notSure: r.empty };
}

export function summarizeCases(cases: { result: CaseResult; spec: LabelSpec }[]): EvalSummary {
  const n = cases.length;
  const outs = cases.map((c) => outcome(c.result, c.spec));
  const rate = (f: (o: CaseOutcome) => boolean) => (n ? outs.filter(f).length / n : 0);
  const ms = cases.map((c) => c.result.ms).sort((a, b) => a - b);
  const sources: Record<string, number> = {};
  for (const c of cases) {
    const key = c.result.empty ? "none" : c.result.source;
    sources[key] = (sources[key] ?? 0) + 1;
  }
  return {
    n,
    top1: rate((o) => o.top1),
    top3: rate((o) => o.top3),
    auto: rate((o) => o.auto),
    wrongAuto: rate((o) => o.wrongAuto),
    notSure: rate((o) => o.notSure),
    avgMs: n ? ms.reduce((a, b) => a + b, 0) / n : 0,
    p95Ms: n ? ms[Math.min(n - 1, Math.ceil(n * 0.95) - 1)] : 0,
    avgTotalMs: n ? cases.reduce((a, c) => a + c.result.totalMs, 0) / n : 0,
    sources,
  };
}

export interface SweepRow {
  threshold: number;
  summary: EvalSummary;
}

export function pickLowConfidence(rows: SweepRow[], tolerance = 0): SweepRow | null {
  if (rows.length === 0) return null;
  const floor = Math.min(...rows.map((r) => r.summary.wrongAuto));
  const ok = rows.filter((r) => r.summary.wrongAuto <= floor + tolerance + 1e-9);
  return [...ok].sort((a, b) => b.summary.auto - a.summary.auto || b.threshold - a.threshold)[0];
}

export function meanSweep(sweeps: SweepRow[][]): SweepRow[] {
  const thresholds = [...new Set(sweeps.flat().map((r) => r.threshold))].sort((a, b) => a - b);
  return thresholds.flatMap((threshold) => {
    const rows = sweeps.map((s) => s.find((r) => r.threshold === threshold));
    if (rows.length === 0 || rows.some((r) => !r)) return [];
    const sums = rows.map((r) => r!.summary);
    const mean = (f: (x: EvalSummary) => number) => sums.reduce((a, x) => a + f(x), 0) / sums.length;
    return [
      {
        threshold,
        summary: {
          ...sums[0],
          top1: mean((x) => x.top1),
          top3: mean((x) => x.top3),
          auto: mean((x) => x.auto),
          wrongAuto: mean((x) => x.wrongAuto),
          notSure: mean((x) => x.notSure),
          avgMs: mean((x) => x.avgMs),
          avgTotalMs: mean((x) => x.avgTotalMs),
        },
      },
    ];
  });
}

export interface PersonalQuery {
  file: string;
  own: number;
  others: { file: string; cos: number }[];
}

export interface PersonalSweepRow {
  threshold: number;
  margin: number;
  trueMatch: number;
  falseMatch: number;
  confused: number;
}

export function personalSweep(queries: PersonalQuery[], thresholds: number[], margins: number[]): PersonalSweepRow[] {
  const rows: PersonalSweepRow[] = [];
  const n = Math.max(1, queries.length);
  for (const threshold of thresholds) {
    for (const margin of margins) {
      let trueMatch = 0;
      let falseMatch = 0;
      let confused = 0;
      for (const q of queries) {
        const others = q.others.map((o) => o.cos).sort((a, b) => b - a);
        const [o1 = -Infinity, o2 = -Infinity] = others;
        if (q.own >= o1) {
          if (q.own >= threshold && q.own - o1 >= margin) trueMatch++;
        } else if (o1 >= threshold && o1 - Math.max(q.own, o2) >= margin) {
          confused++;
        }
        if (o1 >= threshold && o1 - o2 >= margin) falseMatch++;
      }
      rows.push({ threshold, margin, trueMatch: trueMatch / n, falseMatch: falseMatch / n, confused: confused / n });
    }
  }
  return rows;
}

export function pickPersonal(rows: PersonalSweepRow[]): PersonalSweepRow | null {
  const safe = rows.filter((r) => r.falseMatch === 0 && r.confused === 0);
  if (safe.length === 0) return null;
  return [...safe].sort((a, b) => b.trueMatch - a.trueMatch || b.threshold - a.threshold || b.margin - a.margin)[0];
}

export function worstPersonal(sweeps: PersonalSweepRow[][]): PersonalSweepRow[] {
  const [first = [], ...rest] = sweeps;
  return first.flatMap((row) => {
    const same = rest.map((s) => s.find((r) => r.threshold === row.threshold && r.margin === row.margin));
    if (same.some((r) => !r)) return [];
    const all = [row, ...(same as PersonalSweepRow[])];
    return [
      {
        threshold: row.threshold,
        margin: row.margin,
        trueMatch: Math.min(...all.map((r) => r.trueMatch)),
        falseMatch: Math.max(...all.map((r) => r.falseMatch)),
        confused: Math.max(...all.map((r) => r.confused)),
      },
    ];
  });
}
