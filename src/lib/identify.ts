// Capture + identify: crop the clicked region out of the live video, run the
// fine-grained classifier on it, and (optionally) ask Claude vision for a
// better name. Combines everything into a CapturedObject.
import type { Box, CapturedObject, LabelGuess } from "./types";
import { classify, isClassifierReady } from "./classify";
import { getClaude, hasClaude, CLAUDE_MODEL, textOf } from "./claude";

const PAD = 0.12; // grow the crop a bit so the whole object is in view
const THUMB = 160;
// COCO labels the ImageNet classifier has no good class for — trust the detector
const TRUST_DETECTOR = new Set(["person"]);

let counter = 0;

export function cropBox(video: HTMLVideoElement, box: Box): HTMLCanvasElement {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const padX = box.w * PAD;
  const padY = box.h * PAD;
  const x = Math.max(0, Math.floor(box.x - padX));
  const y = Math.max(0, Math.floor(box.y - padY));
  const w = Math.max(1, Math.min(vw - x, Math.ceil(box.w + padX * 2)));
  const h = Math.max(1, Math.min(vh - y, Math.ceil(box.h + padY * 2)));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(video, x, y, w, h, 0, 0, w, h);
  return canvas;
}

function thumbnail(crop: HTMLCanvasElement): string {
  const scale = THUMB / Math.max(crop.width, crop.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width * Math.min(1, scale));
  canvas.height = Math.round(crop.height * Math.min(1, scale));
  canvas.getContext("2d")!.drawImage(crop, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

function dedupe(guesses: LabelGuess[]): LabelGuess[] {
  const seen = new Set<string>();
  return guesses.filter((g) => {
    if (!g.label || seen.has(g.label)) return false;
    seen.add(g.label);
    return true;
  });
}

// Local, synchronous identification (a few ms). Detector label is optional:
// a click on empty space has no detection, only the classifier's opinion.
export function identifyLocal(
  video: HTMLVideoElement,
  box: Box,
  detected?: { label: string; score: number }
): { capture: CapturedObject; crop: HTMLCanvasElement } {
  const crop = cropBox(video, box);
  const classes: LabelGuess[] = isClassifierReady()
    ? classify(crop).map((c) => ({ ...c, source: "classifier" as const }))
    : [];
  const det: LabelGuess | null = detected
    ? { ...detected, source: "detector" }
    : null;

  let best: LabelGuess | undefined;
  if (det && TRUST_DETECTOR.has(det.label)) best = det;
  else if (classes[0] && classes[0].score >= 0.3) best = classes[0];
  else best = det ?? classes[0];
  best ??= { label: "thing", score: 0, source: "classifier" };

  const alternatives = dedupe([best, ...(det ? [det] : []), ...classes]).slice(
    1
  );

  return {
    crop,
    capture: {
      id: `obj-${Date.now()}-${counter++}`,
      label: best.label,
      confidence: best.score,
      source: best.source,
      alternatives,
      thumbnail: thumbnail(crop),
      refining: hasClaude(),
    },
  };
}

// Ask Claude vision for a short, everyday name for the object in the crop.
// `medicines` (from the health record) lets it name a medicine by its label.
export async function identifyWithClaude(
  crop: HTMLCanvasElement,
  hints: string[],
  medicines: string[] = []
): Promise<string | null> {
  const client = await getClaude();
  const data = crop.toDataURL("image/jpeg", 0.85).split(",")[1];
  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 30,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data },
          },
          {
            type: "text",
            text:
              "This is a webcam crop of an object someone is pointing at, for an AAC (speech aid) app. " +
              `On-device models guessed: ${hints.join(", ") || "nothing"}. ` +
              (medicines.length
                ? `If it is a medicine and you can read its label, include the drug name (e.g. "lisinopril bottle"); the person takes ${medicines.join(", ")}. Do not guess a drug name you cannot read. `
                : "") +
              "Reply with ONLY a short everyday name for the main object (1-3 words, lowercase, no article, no punctuation), e.g. \"water bottle\" or \"tv remote\".",
          },
        ],
      },
    ],
  });
  const text = textOf(message)
    .toLowerCase()
    .replace(/[^a-z0-9 '-]/g, "")
    .trim();
  return text && text.split(/\s+/).length <= 4 ? text : null;
}
