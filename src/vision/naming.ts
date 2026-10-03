import { identifyFromImage } from "../lib/identify";
import type { CapturedObject, LabelGuess } from "../lib/types";
import { aimPoint, type Candidate, type Point } from "./core/aim";
import { DEFAULT_NAMING, cropLadder, escalate, orderForPointing, tooSmall, type NamingConfig, type Rung } from "./core/escalate";

export interface NamingInput {
  image: HTMLCanvasElement;
  candidates?: Candidate[];
  aim?: Point;
}

export interface NamedOption {
  key: string;
  label: string;
  score: number;
  rung: Rung;
  capture: CapturedObject;
  crop: HTMLCanvasElement;
}

export interface NamingResult {
  best: NamedOption;
  options: NamedOption[];
  low: boolean;
  level: number;
  tooSmall: boolean;
  ms: number;
}

export const RUNG_TEXT: Record<Rung["kind"], string> = {
  centre: "centre of the picture",
  wide: "wider view",
  box: "detected object",
  candidate: "another object",
};

export function nameTarget(
  input: NamingInput,
  opts: { startLevel?: number; maxOptions?: number; cfg?: NamingConfig } = {}
): NamingResult {
  const t0 = performance.now();
  const cfg = opts.cfg ?? DEFAULT_NAMING;
  const { width: w, height: h } = input.image;
  const aim = input.aim ?? aimPoint(w, h, { dx: 0, dy: 0 });
  const candidates = input.candidates ?? [];
  const ladder = cropLadder(w, h, aim, candidates, cfg);
  const esc = escalate(
    ladder,
    (rung) =>
      identifyFromImage(
        input.image,
        rung.box,
        rung.candidate?.label ? { label: rung.candidate.label, score: rung.candidate.score ?? 0 } : undefined
      ),
    (r) => r.capture.confidence,
    cfg.lowConfidence,
    opts.startLevel ?? 0
  );
  const { pointed, ordered } = orderForPointing(esc.attempts);
  const seen = new Set<string>();
  const options: NamedOption[] = [];
  for (const a of ordered) {
    const label = a.result.capture.label;
    if (seen.has(label)) continue;
    seen.add(label);
    options.push({
      key: `${a.kind}-${options.length}`,
      label,
      score: a.score,
      rung: a,
      capture: a.result.capture,
      crop: a.result.crop,
    });
  }
  const max = Math.max(1, opts.maxOptions ?? 4);
  return {
    best: options[0],
    options: options.slice(0, max),
    low: (pointed[0]?.score ?? 0) < cfg.lowConfidence,
    level: esc.levelReached,
    tooSmall: tooSmall(candidates, w, h, cfg),
    ms: performance.now() - t0,
  };
}

export function withAlternatives(chosen: NamedOption, others: NamedOption[]): CapturedObject {
  const extra: LabelGuess[] = others
    .filter((o) => o.label !== chosen.label)
    .map((o) => ({ label: o.label, score: o.score, source: "classifier" as const }));
  const seen = new Set<string>([chosen.label]);
  const alternatives = [...chosen.capture.alternatives, ...extra].filter((g) => {
    if (seen.has(g.label)) return false;
    seen.add(g.label);
    return true;
  });
  return { ...chosen.capture, alternatives };
}
