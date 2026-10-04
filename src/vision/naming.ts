import { hasClaude } from "../lib/claude";
import { identifyWithClaude } from "../lib/identify";
import type { CapturedObject, LabelGuess } from "../lib/types";
import { GENERIC_WORDS } from "../data/vocabulary";
import { aimPoint, type Candidate, type Point } from "./core/aim";
import {
  DEFAULT_NAMING,
  broadGuess,
  cropLadder,
  escalate,
  orderForPointing,
  pointingScore,
  worthShowing,
  tooSmall,
  type NamingConfig,
  type Rung,
} from "./core/escalate";
import { nameCrops, type NamedCrop, type NamerOptions } from "./namer";

export interface NamingInput {
  image: HTMLCanvasElement;
  candidates?: Candidate[];
  aim?: Point;
  sharpness?: number;
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
  blurry: boolean;
  broad: boolean;
  level: number;
  tooSmall: boolean;
  empty: boolean;
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
  const blurry = input.sharpness !== undefined && input.sharpness < cfg.minSharpness;
  let low = blurry || (pointed[0]?.score ?? 0) < cfg.lowConfidence;
  const lead = pointed[0];
  let broad = false;
  if (low && lead && lead.result.capture.source === "vocab") {
    const mass = lead.result.categoryMass;
    const guesses = mass
      ? Object.entries(mass).map(([category, score]) => ({ label: category, score, category }))
      : [
          { label: lead.result.capture.label, score: lead.result.capture.confidence, category: lead.result.capture.category },
          ...lead.result.capture.alternatives.filter((a) => a.source === "vocab"),
        ];
    const generic = broadGuess(guesses, GENERIC_WORDS, cfg.broadMin);
    if (generic && !seen.has(generic.label)) {
      seen.add(generic.label);
      options.unshift({
        key: "broad",
        label: generic.label,
        score: generic.score,
        rung: lead,
        capture: {
          ...lead.result.capture,
          id: `${lead.result.capture.id}-broad`,
          label: generic.label,
          confidence: generic.score,
          source: "vocab",
          alternatives: [
            { label: lead.result.capture.label, score: lead.result.capture.confidence, source: "vocab" as const },
            ...lead.result.capture.alternatives,
          ].filter((a) => a.label !== generic.label),
        },
        crop: lead.result.crop,
        embedding: lead.result.embedding,
      });
      broad = true;
      if (!blurry && generic.score >= cfg.broadCommit) low = false;
    }
  }
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
  const ranked = low || broad
    ? [
        ...options.filter((o) => o.rung === lead || o.rung.kind !== "candidate"),
        ...options.filter((o) => o.rung !== lead && o.rung.kind === "candidate"),
      ]
    : options;
  const shown = low || broad
    ? ranked.filter((o) => o.key === "broad" || worthShowing(o.score, o.rung.kind, o.rung.candidate?.score, cfg))
    : ranked;
  const final = shown.length > 0 ? shown : ranked;
  return {
    best: final[0],
    options: final.slice(0, max),
    empty: shown.length === 0,
    low,
    blurry,
    broad,
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

export async function askClaude(lead: NamedOption, others: NamedOption[] = [], timeoutMs = 6000): Promise<NamedOption | null> {
  if (!hasClaude()) return null;
  const hints = [...new Set([lead.label, ...others.map((o) => o.label), ...lead.capture.alternatives.map((a) => a.label)])];
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), timeoutMs);
  });
  try {
    const label = await Promise.race([identifyWithClaude(lead.crop, hints), timeout]);
    if (!label) return null;
    return {
      key: "claude",
      label,
      score: 0,
      rung: lead.rung,
      crop: lead.crop,
      embedding: lead.embedding,
      capture: {
        ...lead.capture,
        id: `${lead.capture.id}-claude`,
        label,
        confidence: 0,
        source: "claude",
        refining: false,
        alternatives: hints
          .filter((h) => h !== label)
          .map((h) => ({ label: h, score: 0, source: "vocab" as const })),
      },
    };
  } catch (err) {
    console.warn("[naming] Claude fallback failed", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
