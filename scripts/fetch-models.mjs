// Downloads the MediaPipe models into public/models so the app works offline
// after the first run. Non-fatal: if this fails, the app loads them from the
// Google CDN at runtime instead.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const BASE = "https://storage.googleapis.com/mediapipe-models";
const MODELS = {
  "efficientdet_lite0_fp16.tflite": `${BASE}/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
  "efficientnet_lite0.tflite": `${BASE}/image_classifier/efficientnet_lite0/int8/latest/efficientnet_lite0.tflite`,
};
const dir = "public/models";
mkdirSync(dir, { recursive: true });

for (const [name, url] of Object.entries(MODELS)) {
  const dest = `${dir}/${name}`;
  if (existsSync(dest)) continue;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`[fetch-models] ${name} downloaded`);
  } catch (err) {
    console.warn(`[fetch-models] ${name} not downloaded (${err.message}); will load from CDN at runtime`);
  }
}
