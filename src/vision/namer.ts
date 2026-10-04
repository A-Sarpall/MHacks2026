import { identifyFromImage } from "../lib/identify";
import type { Box, CapturedObject, LabelGuess } from "../lib/types";
import { DEFAULT_ENHANCE, averageEmbeddings, mirrored, prepareCrop, rotated, type EnhanceConfig } from "./core/enhance";
import { DEFAULT_NAMING } from "./core/escalate";
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
  rotation?: number;
}

export interface NamerOptions {
  boost?: (label: string) => number;
  topK?: number;
  personal?: PersonalEntry[];
  personalCfg?: PersonalMatchConfig;
  enhance?: boolean | EnhanceConfig;
  tta?: boolean;
  rotations?: RotationMode;
}

export type RotationMode = false | "best" | "avg" | "unsure" | "margin";

const ROTATION_MARGIN = 0.15;

const QUERY = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
export const ENHANCE_DEFAULT = QUERY.get("enhance") === "1";
export const TTA_DEFAULT = QUERY.get("tta") === "1";
export const ROTATIONS_DEFAULT: RotationMode = (() => {
  const q = QUERY.get("rotations");
  if (q === "best" || q === "avg" || q === "margin" || q === "unsure") return q;
  return false;
})();

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
  const rotations = opts.rotations ?? ROTATIONS_DEFAULT;
  const turns = rotations && rotations !== "unsure" ? [0, 1, 2, 3] : [0];
  const views = prepared.flatMap((c) => turns.flatMap((q) => (tta ? [rotated(c, q), mirrored(rotated(c, q))] : [rotated(c, q)])));
  const perCrop = views.length / prepared.length;
  const perTurn = tta ? 2 : 1;
  let vectors: Float32Array[];
  const chosenTurn: number[] = [];
  try {
    const raw = await embedImages(views);
    vectors = prepared.map((_, i) => {
      const base = i * perCrop;
      const byTurn = turns.map((_, t) => {
        const slice = raw.slice(base + t * perTurn, base + (t + 1) * perTurn);
        return perTurn === 1 ? slice[0] : averageEmbeddings(slice);
      });
      let bestT = 0;
      if (byTurn.length > 1 && rotations === "avg") {
        chosenTurn.push(-1);
        return averageEmbeddings(byTurn);
      }
      if (byTurn.length > 1) {
        const probs = byTurn.map((v) => vocab.top(v, 1)[0]?.prob ?? 0);
        const need = rotations === "margin" ? probs[0] + ROTATION_MARGIN : -1;
        probs.forEach((p, t) => {
          if (p > need && p > probs[bestT]) bestT = t;
        });
        if (rotations === "margin" && probs[bestT] <= need) bestT = 0;
      }
      chosenTurn.push(turns[bestT]);
      return byTurn[bestT];
    });
    if (rotations === "unsure") {
      const unsure = vectors.map((v, i) => ({ i, p: vocab.top(v, 1)[0]?.prob ?? 0 })).filter((x) => x.p < DEFAULT_NAMING.lowConfidence);
      if (unsure.length > 0) {
        const extra = await embedImages(unsure.flatMap((x) => [1, 2, 3].map((q) => rotated(prepared[x.i], q))));
        unsure.forEach((x, k) => {
          let best = { p: x.p, v: vectors[x.i], q: 0 };
          for (let q = 1; q <= 3; q++) {
            const v = extra[k * 3 + (q - 1)];
            const p = vocab.top(v, 1)[0]?.prob ?? 0;
            if (p > best.p) best = { p, v, q };
          }
          vectors[x.i] = best.v;
          chosenTurn[x.i] = best.q;
        });
      }
    }
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
      rotation: chosenTurn[i] < 0 ? undefined : chosenTurn[i] * 90,
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
