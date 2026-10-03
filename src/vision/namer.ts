import { identifyFromImage } from "../lib/identify";
import type { Box, CapturedObject, LabelGuess } from "../lib/types";
import { everydayLabel } from "./core/imagenetMap";
import { matchPersonal, nearestPersonal, personalConfidence } from "./core/personalMatch";
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
}

export interface NamerOptions {
  boost?: (label: string) => number;
  topK?: number;
}

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
  let vectors: Float32Array[];
  try {
    vectors = await embedImages(local.map((l) => l.crop));
  } catch (err) {
    console.warn("[namer] SigLIP failed, using the fallback classifier", err);
    return local;
  }
  await loadPersonal();
  const personal = personalEntries();
  return local.map((l, i) => {
    const top = vocab.top(vectors[i], opts.topK ?? 3, opts.boost);
    const vocabGuesses: LabelGuess[] = top.map((t) => ({ label: t.label, score: t.prob, source: "vocab" as const }));
    const hit = personal.length > 0 ? matchPersonal(vectors[i], personal) : null;
    if (personal.length > 0) {
      const near = nearestPersonal(vectors[i], personal)[0];
      console.info("[personal]", JSON.stringify({ nearest: near?.name, cos: near && +near.cos.toFixed(3), runnerUp: near && +near.runnerUp.toFixed(3), match: hit?.name ?? null }));
    }
    if (hit) {
      const confidence = personalConfidence(hit);
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
      capture: {
        ...l.capture,
        label: best.label,
        confidence: best.score,
        source: "vocab",
        alternatives: dedupe([...rest, ...l.capture.alternatives, { label: l.capture.label, score: l.capture.confidence, source: l.capture.source === "manual" ? "classifier" : l.capture.source }]).filter(
          (g) => g.label !== best.label
        ),
      },
    };
  });
}
