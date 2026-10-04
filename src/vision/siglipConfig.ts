import { PROMPT_TEMPLATES, VOCABULARY } from "../data/vocabulary.ts";
import { fnv1a } from "./core/f16.ts";

export const SIGLIP = {
  model: "onnx-community/siglip2-base-patch16-224-ONNX",
  textDtype: "q8",
  visionDtypeWasm: "q4f16",
  visionDtypeWebgpu: "q4",
  dims: 768,
  maxTextLength: 64,
  logitScale: Math.exp(4.724453449249268),
  logitBias: -16.771724700927734,
  embeddingsUrl: "vocab/siglip2-base-224.bin",
  metaUrl: "vocab/siglip2-base-224.json",
} as const;

export interface VocabMeta {
  model: string;
  textDtype: string;
  dims: number;
  hash: string;
  templates: string[];
  entries: { label: string; category: string }[];
}

export function vocabHash(): string {
  return fnv1a(
    JSON.stringify({
      model: SIGLIP.model,
      dtype: SIGLIP.textDtype,
      templates: PROMPT_TEMPLATES,
      vocab: VOCABULARY.map((v) => [v.label, v.prompt]),
    })
  );
}
