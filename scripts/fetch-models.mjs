// Downloads the MediaPipe models into public/models so the app works offline
// after the first run. Non-fatal: if this fails, the app loads them from the
// Google CDN at runtime instead.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const BASE = "https://storage.googleapis.com/mediapipe-models";
const MODELS = {
  "efficientdet_lite0_fp16.tflite": `${BASE}/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
  "efficientnet_lite0.tflite": `${BASE}/image_classifier/efficientnet_lite0/int8/latest/efficientnet_lite0.tflite`,
};
const HF = "https://huggingface.co/onnx-community/siglip2-base-patch16-224-ONNX/resolve/main";
const SIGLIP_DIR = "onnx-community/siglip2-base-patch16-224-ONNX";
for (const f of ["config.json", "preprocessor_config.json", "onnx/vision_model_q4f16.onnx", "onnx/vision_model_q4.onnx"]) {
  MODELS[`${SIGLIP_DIR}/${f}`] = `${HF}/${f}`;
}
const dir = "public/models";
mkdirSync(dir, { recursive: true });

for (const [name, url] of Object.entries(MODELS)) {
  const dest = `${dir}/${name}`;
  if (existsSync(dest)) continue;
  mkdirSync(dirname(dest), { recursive: true });
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`[fetch-models] ${name} downloaded`);
  } catch (err) {
    console.warn(`[fetch-models] ${name} not downloaded (${err.message}); will load from CDN at runtime`);
  }
}
