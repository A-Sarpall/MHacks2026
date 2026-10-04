import { aimCrop, contains, type Box, type Candidate, type Point } from "./aim";

export type AttemptKind = "centre" | "wide" | "box" | "candidate";

export interface Rung {
  kind: AttemptKind;
  box: Box;
  candidate?: Candidate;
}

export interface NamingConfig {
  centreFrac: number;
  wideFrac: number;
  lowConfidence: number;
  tinyAreaFrac: number;
  widePenalty: number;
  minShow: number;
  minDetector: number;
  minSharpness: number;
  broadMin: number;
  broadCommit: number;
}

export interface BroadGuess {
  label: string;
  score: number;
  category: string;
}

export function broadGuess(
  guesses: { label: string; score: number; category?: string }[],
  generics: Record<string, string>,
  minMass: number
): BroadGuess | null {
  const mass = new Map<string, number>();
  for (const g of guesses) {
    if (!g.category || !generics[g.category]) continue;
    mass.set(g.category, (mass.get(g.category) ?? 0) + g.score);
  }
  const top = [...mass.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] < minMass) return null;
  return { label: generics[top[0]], score: top[1], category: top[0] };
}

export const DEFAULT_NAMING: NamingConfig = {
  centreFrac: 0.35,
  wideFrac: 0.65,
  lowConfidence: 0.65,
  tinyAreaFrac: 0.01,
  widePenalty: 0.1,
  minShow: 0.12,
  minDetector: 0.5,
  minSharpness: 200,
  broadMin: 0.5,
  broadCommit: 0.6,
};

export function worthShowing(
  score: number,
  kind: AttemptKind,
  detectorScore: number | undefined,
  cfg: NamingConfig = DEFAULT_NAMING
): boolean {
  if (score >= cfg.minShow) return true;
  return kind === "candidate" && (detectorScore ?? 0) >= cfg.minDetector;
}

export function pointingScore(score: number, kind: AttemptKind, cfg: NamingConfig = DEFAULT_NAMING): number {
  return kind === "wide" ? score - cfg.widePenalty : score;
}

export function cropLadder(
  w: number,
  h: number,
  aim: Point,
  candidates: Candidate[],
  cfg: NamingConfig = DEFAULT_NAMING
): Rung[][] {
  const detections = candidates.filter((c) => c.kind === "detection");
  const covering = detections.find((c) => contains(c.box, aim));
  const level1: Rung[] = [{ kind: "wide", box: aimCrop(w, h, aim, cfg.wideFrac) }];
  if (covering) level1.unshift({ kind: "box", box: { ...covering.box }, candidate: covering });
  const level2: Rung[] = detections
    .filter((c) => c !== covering)
    .map((c) => ({ kind: "candidate" as const, box: { ...c.box }, candidate: c }));
  return [[{ kind: "centre", box: aimCrop(w, h, aim, cfg.centreFrac) }], level1, level2];
}

export interface Attempt<R> extends Rung {
  level: number;
  result: R;
  score: number;
}

export interface Escalation<R> {
  best: Attempt<R>;
  attempts: Attempt<R>[];
  low: boolean;
  levelReached: number;
}

export async function escalate<R>(
  ladder: Rung[][],
  nameLevel: (rungs: Rung[]) => Promise<R[]>,
  scoreOf: (r: R, rung: Rung) => number,
  threshold: number,
  startLevel = 0,
  maxLevel = ladder.length - 1
): Promise<Escalation<R>> {
  const attempts: Attempt<R>[] = [];
  const top = ladder.length - 1;
  const run = async (l: number) => {
    if (ladder[l].length === 0) return;
    const results = await nameLevel(ladder[l]);
    ladder[l].forEach((rung, i) => {
      attempts.push({ ...rung, level: l, result: results[i], score: scoreOf(results[i], rung) });
    });
  };
  let level = Math.min(Math.max(0, startLevel), top);
  for (let l = 0; l <= level; l++) await run(l);
  while (level < Math.min(maxLevel, top) && bestScore(attempts) < threshold) {
    level++;
    await run(level);
  }
  const sorted = [...attempts].sort((a, b) => b.score - a.score);
  return {
    best: sorted[0],
    attempts: sorted,
    low: sorted[0].score < threshold,
    levelReached: level,
  };
}

function bestScore(attempts: { score: number }[]): number {
  return attempts.reduce((m, a) => Math.max(m, a.score), -Infinity);
}

export function tooSmall(candidates: Candidate[], w: number, h: number, cfg: NamingConfig = DEFAULT_NAMING): boolean {
  const top = candidates.find((c) => c.kind === "detection" && c.containsAim);
  if (!top) return false;
  return (top.box.w * top.box.h) / (w * h) < cfg.tinyAreaFrac;
}

export function orderForPointing<R>(attempts: Attempt<R>[]): { pointed: Attempt<R>[]; ordered: Attempt<R>[] } {
  const pointed = attempts.filter((a) => a.kind !== "candidate").sort((a, b) => b.score - a.score);
  const others = attempts
    .filter((a) => a.kind === "candidate")
    .sort((a, b) => (a.candidate?.distance ?? 0) - (b.candidate?.distance ?? 0));
  return { pointed, ordered: [...pointed, ...others] };
}
