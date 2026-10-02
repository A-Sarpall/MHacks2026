import {
  ObjectDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import type { Detection } from "./types";

let detector: ObjectDetector | null = null;
let loading = false;

export async function initDetector(): Promise<void> {
  if (detector || loading) return;
  loading = true;
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  detector = await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/latest/efficientdet_lite0.tflite",
      delegate: "GPU",
    },
    maxResults: 5,
    scoreThreshold: 0.3,
    runningMode: "IMAGE",
  });
  loading = false;
}

export function detectObjects(
  source: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
): Detection[] {
  if (!detector) return [];
  const result = detector.detect(source);
  const seen = new Set<string>();
  const detections: Detection[] = [];
  for (const det of result.detections) {
    const cat = det.categories?.[0];
    if (!cat) continue;
    const label = cat.categoryName.toLowerCase();
    if (seen.has(label)) continue;
    seen.add(label);
    detections.push({ label, confidence: cat.score });
    if (detections.length >= 3) break;
  }
  return detections;
}

export function isDetectorReady(): boolean {
  return detector !== null;
}
