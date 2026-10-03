# Verified Knowledge

## MediaPipe Tasks Vision (browser) — @mediapipe/tasks-vision 1.0.1

- Wasm served locally from `public/mediapipe/wasm` (copied from node_modules by `scripts/copy-wasm.mjs`) — avoids `@latest` CDN version drift
- Models downloaded to `public/models` by `scripts/fetch-models.mjs`; app falls back to storage.googleapis.com
- Detector: `efficientdet_lite0/float16/1` on GPU works. **int8 detector on GPU returned 0 detections** (headless Chromium/SwiftShader) — avoid
- Classifier: `efficientnet_lite0/int8/latest` **throws on GPU** ("TensorsDequantizationCalculator: Unsupported input tensor type: Float32") — run on CPU
- `detectForVideo(video, ts)` requires strictly increasing timestamps
- `BoundingBox` = `originX, originY, width, height` in pixels of the input frame
- ImageNet display names can contain commas ("notebook, notebook computer") — take the first
- ImageNet has no "person" class — keep the COCO detector label for people
- MediaPipe posts telemetry to `odml.pa.googleapis.com` (failures are harmless)

## Browser SpeechSynthesis

- `speechSynthesis.speak(utterance)` async, fires `onend`; `cancel()` stops
- May require a prior user gesture

## Anthropic SDK in the browser

- `new Anthropic({ apiKey, dangerouslyAllowBrowser: true })`; model id `claude-haiku-4-5`
- Image input: `{ type: "image", source: { type: "base64", media_type: "image/jpeg", data } }`
- Vite tree-shakes the lazy SDK import when `VITE_ANTHROPIC_API_KEY` is unset at build time

## Tailwind v4 with Vite

- Plugin `@tailwindcss/vite`; `@import "tailwindcss";` in index.css; no config file

## Testing in the agent sandbox

- Headless Chromium: `--proxy-server=https=<proxy host:port>` so http://127.0.0.1 is not proxied (Playwright's `proxy` option adds `<-loopback>`)
- Fake webcam: override `navigator.mediaDevices.getUserMedia` to return `canvas.captureStream()` of a still image
- Fetch models with `NODE_USE_ENV_PROXY=1`

## SigLIP 2 in Transformers.js 4.3 (verified 2026-10-03)

- `onnx-community/siglip2-base-patch16-224-ONNX` has separate `vision_model_*.onnx` / `text_model_*.onnx`; load with `SiglipVisionModel` / `SiglipTextModel`, use `pooler_output`
- Text must be tokenized with `padding: "max_length", max_length: 64` (Gemma tokenizer)
- logit_scale = 4.724453 (exp ≈ 112.7), logit_bias = −16.7717 (read from google/siglip2-base-patch16-224 safetensors header)
- **`vision_model_quantized`/`q8` is broken** (cat image → "purse"); `q4f16` ≈ `fp16` in accuracy; text `q8` ≈ text `fp16`
- Transformers.js defaults ORT wasm to jsDelivr; set `env.backends.onnx.wasm.wasmPaths` to local `ort-wasm-simd-threaded.asyncify.{mjs,wasm}` for offline
- WebGPU works in headless Chrome on macOS; WASM is ~3× faster with COOP/COEP (cross-origin isolated → threads)
