import { identifyFromImage } from "../lib/identify";
import type { Box, CapturedObject, LabelGuess } from "../lib/types";
import { DEFAULT_ENHANCE, averageEmbeddings, mirrored, prepareCrop, type EnhanceConfig } from "./core/enhance";
import { everydayLabel } from "./core/imagenetMap";
import {
  matchPersonal,
  nearestPersonal,
  personalConfidence,
  type PersonalEntry,
  type PersonalMatchConfig,
} from "./core/personalMatch";
import { loadPersonal, personalEntries } from "./personal";
import { embedImages, isSiglipReady, vocabIndex } from "./siglip";

export interface CropRequest {
  box: Box;
  detected?: { label: string; score: number };
}

export interface NamedCrop {
  capture: CapturedObject;
  crop: HTMLCanvasElement;
  embedding?: Float32Array;
  categoryMass?: Record<string, number>;
}

export interface NamerOptions {
  boost?: (label: string) => number;
  topK?: number;
  personal?: PersonalEntry[];
  personalCfg?: PersonalMatchConfig;
  enhance?: boolean | EnhanceConfig;
  tta?: boolean;
}

const QUERY = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
export const ENHANCE_DEFAULT = QUERY.get("enhance") === "1";
export const TTA_DEFAULT = QUERY.get("tta") === "1";

function dedupe(guesses: LabelGuess[]): LabelGuess[] {
  const seen = new Set<string>();
  return guesses.filter((g) => {
    if (!g.label || seen.has(g.label)) return false;
    seen.add(g.label);
    return true;
  });
}

export function cleanCapture(capture: CapturedObject): CapturedObject {
  const all: LabelGuess[] = [
    {
      label: capture.label,
      score: capture.confidence,
      source: capture.source === "manual" ? "classifier" : capture.source,
    },
    ...capture.alternatives,
  ];
  const cleaned = dedupe(
    all.flatMap((g) => {
      if (g.source !== "classifier") return [g];
      const label = everydayLabel(g.label);
      return label ? [{ ...g, label }] : [];
    })
  );
  const best = cleaned[0] ?? { label: "thing", score: 0, source: "classifier" as const };
  return {
    ...capture,
    label: best.label,
    confidence: best.score,
    source: best.source,
    alternatives: cleaned.slice(1),
  };
}

export async function nameCrops(
  image: HTMLCanvasElement,
  requests: CropRequest[],
  opts: NamerOptions = {}
): Promise<NamedCrop[]> {
  const local = requests.map((r) => {
    const { capture, crop } = identifyFromImage(image, r.box, r.detected);
    return { capture: cleanCapture(capture), crop };
  });
  const vocab = vocabIndex();
  if (!isSiglipReady() || !vocab) return local;
  const enhance = opts.enhance ?? ENHANCE_DEFAULT;
  const enhanceCfg = typeof enhance === "object" ? enhance : enhance ? DEFAULT_ENHANCE : null;
  const prepared = local.map((l) => (enhanceCfg ? prepareCrop(l.crop, enhanceCfg) : l.crop));
  const tta = opts.tta ?? TTA_DEFAULT;
  let vectors: Float32Array[];
  try {
    const raw = await embedImages(tta ? prepared.flatMap((c) => [c, mirrored(c)]) : prepared);
    vectors = tta ? prepared.map((_, i) => averageEmbeddings([raw[2 * i], raw[2 * i + 1]])) : raw;
  } catch (err) {
    console.warn("[namer] SigLIP failed, using the fallback classifier", err);
    return local;
  }
  if (!opts.personal) await loadPersonal();
  const personal = opts.personal ?? personalEntries();
  return local.map((l, i) => {
    const top = vocab.top(vectors[i], opts.topK ?? 3, opts.boost);
    const vocabGuesses: LabelGuess[] = top.flatMap((t, rank) => [
      { label: t.label, score: t.prob, source: "vocab" as const, category: t.category },
      ...(rank === 0 && t.specific
        ? [{ label: t.specific.label, score: t.specific.prob, source: "vocab" as const, category: t.category }]
        : []),
    ]);
    const hit = personal.length > 0 ? matchPersonal(vectors[i], personal, opts.personalCfg) : null;
    if (personal.length > 0) {
      const near = nearestPersonal(vectors[i], personal)[0];
      console.info("[personal]", JSON.stringify({ nearest: near?.name, cos: near && +near.cos.toFixed(3), runnerUp: near && +near.runnerUp.toFixed(3), match: hit?.name ?? null }));
    }
    if (hit) {
      const confidence = personalConfidence(hit, opts.personalCfg);
      return {
        crop: l.crop,
        embedding: vectors[i],
        capture: {
          ...l.capture,
          label: hit.name,
          confidence,
          source: "personal",
          alternatives: vocabGuesses.filter((g) => g.label !== hit.name),
        },
      };
    }
    const [best, ...rest] = vocabGuesses;
    return {
      crop: l.crop,
      embedding: vectors[i],
      categoryMass: vocab.categoryMass(vectors[i]),
      capture: {
        ...l.capture,
        label: best.label,
        confidence: best.score,
        source: "vocab",
        category: best.category,
        alternatives: dedupe([...rest, ...l.capture.alternatives, { label: l.capture.label, score: l.capture.confidence, source: l.capture.source === "manual" ? "classifier" : l.capture.source }]).filter(
          (g) => g.label !== best.label
        ),
      },
    };
  });
}
