import type { CapturedObject, LabelGuess } from "../lib/types";
import { aimPoint, type Candidate, type Point } from "./core/aim";
import {
  DEFAULT_NAMING,
  cropLadder,
  escalate,
  orderForPointing,
  pointingScore,
  tooSmall,
  type NamingConfig,
  type Rung,
} from "./core/escalate";
import { nameCrops, type NamedCrop, type NamerOptions } from "./namer";

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
  embedding?: Float32Array;
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

export async function nameTarget(
  input: NamingInput,
  opts: { startLevel?: number; maxOptions?: number; cfg?: NamingConfig; namer?: NamerOptions } = {}
): Promise<NamingResult> {
  const t0 = performance.now();
  const cfg = opts.cfg ?? DEFAULT_NAMING;
  const { width: w, height: h } = input.image;
  const aim = input.aim ?? aimPoint(w, h, { dx: 0, dy: 0 });
  const candidates = input.candidates ?? [];
  const ladder = cropLadder(w, h, aim, candidates, cfg);
  const esc = await escalate<NamedCrop>(
    ladder,
    (rungs) =>
      nameCrops(
        input.image,
        rungs.map((r) => ({
          box: r.box,
          detected: r.candidate?.label ? { label: r.candidate.label, score: r.candidate.score ?? 0 } : undefined,
        })),
        opts.namer
      ),
    (r, rung) => pointingScore(r.capture.confidence, rung.kind, cfg),
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
      score: a.result.capture.confidence,
      rung: a,
      capture: a.result.capture,
      crop: a.result.crop,
      embedding: a.result.embedding,
    });
  }
  const max = Math.max(1, opts.maxOptions ?? 4);
  const low = (pointed[0]?.score ?? 0) < cfg.lowConfidence;
  const lead = pointed[0];
  if (low && lead) {
    for (const alt of lead.result.capture.alternatives) {
      if (options.length >= max) break;
      if (seen.has(alt.label) || alt.source !== lead.result.capture.source) continue;
      seen.add(alt.label);
      options.push({
        key: `alt-${options.length}`,
        label: alt.label,
        score: alt.score,
        rung: lead,
        capture: {
          ...lead.result.capture,
          id: `${lead.result.capture.id}-${options.length}`,
          label: alt.label,
          confidence: alt.score,
          source: alt.source,
        },
        crop: lead.result.crop,
        embedding: lead.result.embedding,
      });
    }
  }
  const ranked = low
    ? [
        ...options.filter((o) => o.rung === lead || o.rung.kind !== "candidate"),
        ...options.filter((o) => o.rung !== lead && o.rung.kind === "candidate"),
      ]
    : options;
  return {
    best: ranked[0],
    options: ranked.slice(0, max),
    low,
    level: esc.levelReached,
    tooSmall: tooSmall(candidates, w, h, cfg),
    ms: performance.now() - t0,
  };
}

export function withAlternatives(chosen: NamedOption, others: NamedOption[]): CapturedObject {
  const extra: LabelGuess[] = others
    .filter((o) => o.label !== chosen.label)
    .map((o) => ({ label: o.label, score: o.score, source: o.capture.source === "manual" ? "classifier" as const : o.capture.source }));
  const seen = new Set<string>([chosen.label]);
  const alternatives = [...chosen.capture.alternatives, ...extra].filter((g) => {
    if (seen.has(g.label)) return false;
    seen.add(g.label);
    return true;
  });
  return { ...chosen.capture, alternatives };
}
