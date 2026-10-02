// Live object detection: MediaPipe EfficientDet-Lite0 (COCO 80 classes) in
// VIDEO mode, called once per animation frame by the camera view.
import { ObjectDetector } from "@mediapipe/tasks-vision";
import type { Box, RawDetection } from "./types";
import { createWithFallback, getVisionFileset, resolveModel } from "./vision";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite";

let detector: ObjectDetector | null = null;
let initPromise: Promise<void> | null = null;
let lastTimestamp = -1;

export function initDetector(): Promise<void> {
  initPromise ??= (async () => {
    const [vision, modelAssetPath] = await Promise.all([
      getVisionFileset(),
      resolveModel("efficientdet_lite0_fp16.tflite", MODEL_URL),
    ]);
    detector = await createWithFallback((delegate) =>
      ObjectDetector.createFromOptions(vision, {
        baseOptions: { modelAssetPath, delegate },
        maxResults: 8,
        scoreThreshold: 0.35,
        runningMode: "VIDEO",
      })
    );
  })();
  initPromise.catch(() => {
    initPromise = null; // allow retry
  });
  return initPromise;
}

export function isDetectorReady(): boolean {
  return detector !== null;
}

// Run detection on the current video frame. Timestamps must strictly increase.
export function detectFrame(video: HTMLVideoElement): RawDetection[] {
  if (!detector || video.readyState < 2 || video.videoWidth === 0) return [];
  let ts = performance.now();
  if (ts <= lastTimestamp) ts = lastTimestamp + 1;
  lastTimestamp = ts;

  const result = detector.detectForVideo(video, ts);
  const out: RawDetection[] = [];
  for (const det of result.detections) {
    const cat = det.categories?.[0];
    const bb = det.boundingBox;
    if (!cat || !bb) continue;
    const box: Box = {
      x: bb.originX,
      y: bb.originY,
      w: bb.width,
      h: bb.height,
    };
    out.push({ label: cat.categoryName.toLowerCase(), score: cat.score, box });
  }
  return out;
}
