import { mkdirSync, writeFileSync } from "node:fs";
import { AutoTokenizer, SiglipTextModel, env } from "@huggingface/transformers";
import { VOCABULARY, promptsFor, PROMPT_TEMPLATES } from "../src/data/vocabulary.ts";
import { SIGLIP, vocabHash } from "../src/vision/siglipConfig.ts";
import { encodeHalf } from "../src/vision/core/f16.ts";

env.cacheDir = "node_modules/.cache/transformers";

const t0 = Date.now();
let lastPct = -1;
const progress = (p) => {
  if (p.status !== "progress" || !p.file?.endsWith(".onnx")) return;
  const pct = Math.floor(p.progress / 10) * 10;
  if (pct !== lastPct) {
    lastPct = pct;
    console.log(`[embed-vocab] downloading ${p.file} ${pct}%`);
  }
};

const tokenizer = await AutoTokenizer.from_pretrained(SIGLIP.model);
const model = await SiglipTextModel.from_pretrained(SIGLIP.model, {
  dtype: SIGLIP.textDtype,
  progress_callback: progress,
});

const dims = SIGLIP.dims;
const out = new Float32Array(VOCABULARY.length * dims);
const BATCH = 32;
const prompts = VOCABULARY.flatMap((v, i) => promptsFor(v).map((text) => ({ i, text })));
const perLabel = PROMPT_TEMPLATES.length;

for (let start = 0; start < prompts.length; start += BATCH) {
  const batch = prompts.slice(start, start + BATCH);
  const inputs = tokenizer(
    batch.map((b) => b.text),
    { padding: "max_length", truncation: true, max_length: SIGLIP.maxTextLength }
  );
  const { pooler_output } = await model(inputs);
  const data = pooler_output.data;
  batch.forEach((b, k) => {
    const row = data.subarray(k * dims, (k + 1) * dims);
    let norm = 0;
    for (const v of row) norm += v * v;
    norm = Math.sqrt(norm) || 1;
    for (let d = 0; d < dims; d++) out[b.i * dims + d] += row[d] / norm / perLabel;
  });
  if ((start / BATCH) % 10 === 0) console.log(`[embed-vocab] ${Math.min(start + BATCH, prompts.length)}/${prompts.length} prompts`);
}

for (let i = 0; i < VOCABULARY.length; i++) {
  const row = out.subarray(i * dims, (i + 1) * dims);
  let norm = 0;
  for (const v of row) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  for (let d = 0; d < dims; d++) row[d] /= norm;
}

mkdirSync("public/vocab", { recursive: true });
const bin = `public/${SIGLIP.embeddingsUrl}`;
writeFileSync(bin, Buffer.from(encodeHalf(out).buffer));
writeFileSync(
  `public/${SIGLIP.metaUrl}`,
  JSON.stringify(
    {
      model: SIGLIP.model,
      textDtype: SIGLIP.textDtype,
      dims,
      hash: vocabHash(),
      templates: PROMPT_TEMPLATES,
      entries: VOCABULARY.map((v) => ({ label: v.label, category: v.category })),
    },
    null,
    1
  )
);
console.log(`[embed-vocab] ${VOCABULARY.length} labels -> ${bin} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
