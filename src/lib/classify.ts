// Fine-grained identification of a cropped object: MediaPipe ImageClassifier
// with EfficientNet-Lite0 (ImageNet, 1000 classes) — far more specific than the
// 80 COCO detector classes (e.g. "coffee mug", "water bottle", "banana").
import { ImageClassifier } from "@mediapipe/tasks-vision";
import { getVisionFileset, resolveModel } from "./vision";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/int8/latest/efficientnet_lite0.tflite";

export interface ClassLabel {
  label: string;
  score: number;
}

let classifier: ImageClassifier | null = null;
let initPromise: Promise<void> | null = null;

export function initClassifier(): Promise<void> {
  initPromise ??= (async () => {
    const [vision, modelAssetPath] = await Promise.all([
      getVisionFileset(),
      resolveModel("efficientnet_lite0.tflite", MODEL_URL),
    ]);
    // CPU on purpose: the int8 model fails on the GPU delegate at inference
    // time ("Unsupported input tensor type: Float32"), and one crop per click
    // is cheap on CPU.
    classifier = await ImageClassifier.createFromOptions(vision, {
      baseOptions: { modelAssetPath, delegate: "CPU" },
      maxResults: 3,
      runningMode: "IMAGE",
    });
  })();
  initPromise.catch(() => {
    initPromise = null;
  });
  return initPromise;
}

export function isClassifierReady(): boolean {
  return classifier !== null;
}

export function classify(image: HTMLCanvasElement): ClassLabel[] {
  if (!classifier) return [];
  let result;
  try {
    result = classifier.classify(image);
  } catch (err) {
    console.warn("[classify]", err);
    return [];
  }
  const cats = result.classifications[0]?.categories ?? [];
  return cats.map((c) => ({
    // ImageNet names can be "notebook, notebook computer" — keep the first
    label: (c.displayName || c.categoryName).split(",")[0].trim().toLowerCase(),
    score: c.score,
  }));
}
